from backend.pipeline.status_models import (
    AuditStatusState,
    ExecutionStatus,
    VerificationStatus,
    ReportStatus,
    BlockerStatus,
    StageExecutionStatus,
    StageCriticality,
    PipelineStage
)

def derive_execution_status(state: AuditStatusState) -> ExecutionStatus:
    """
    Deterministic status aggregation according to the 20G Strict Precedence Rule:
    1. FAILED (Integrity / Unrecoverable)
    2. BLOCKED (Active required blocker)
    3. PARTIAL (Incomplete required work)
    4. RUNNING (Active execution)
    5. PENDING (Not started)
    6. COMPLETED (All gates passed)
    """
    
    # 1. INTEGRITY FAILURE OVERRIDES EVERYTHING
    if state.integrity_failure:
        return ExecutionStatus.FAILED
        
    # 2. UNRECOVERABLE CRITICAL FAILURE
    for stage_result in state.stages.values():
        if stage_result.criticality == StageCriticality.CRITICAL and stage_result.status == StageExecutionStatus.FAILED:
            return ExecutionStatus.FAILED
            
    # 3. ACTIVE REQUIRED BLOCKER
    for stage_result in state.stages.values():
        if stage_result.status == StageExecutionStatus.BLOCKED:
            if stage_result.criticality in (StageCriticality.CRITICAL, StageCriticality.IMPORTANT):
                return ExecutionStatus.BLOCKED
                
    # 4. INCOMPLETE REQUIRED WORK WITHOUT ACTIVE BLOCKER
    # Check if any required stage is not SUCCEEDED/SKIPPED/NOT_APPLICABLE
    has_incomplete = False
    has_running = False
    has_started = False
    
    for stage_result in state.stages.values():
        if stage_result.status != StageExecutionStatus.PENDING:
            has_started = True
            
        if stage_result.status == StageExecutionStatus.RUNNING:
            has_running = True
            
        if stage_result.criticality in (StageCriticality.CRITICAL, StageCriticality.IMPORTANT):
            if stage_result.status in (StageExecutionStatus.PENDING, StageExecutionStatus.PARTIAL, StageExecutionStatus.FAILED):
                # A failed IMPORTANT stage falls into PARTIAL if valid upstream outputs exist
                has_incomplete = True
                
    # 5. ACTIVELY EXECUTING
    if has_running:
        return ExecutionStatus.RUNNING
        
    # If not running but incomplete (and not blocked or failed), it's PARTIAL
    if has_incomplete and has_started:
        return ExecutionStatus.PARTIAL
        
    # 6. NOT YET STARTED
    if not has_started:
        return ExecutionStatus.PENDING
        
    # 7. COMPLETED (All required gates passed)
    return ExecutionStatus.COMPLETED

def derive_full_audit_status(state: AuditStatusState) -> AuditStatusState:
    """Computes all orthogonal status dimensions based on the stage inputs."""
    # Compute Execution Status
    state.execution_status = derive_execution_status(state)
    
    # Compute Verification Status & Production Verified
    all_mandatory_verified = True
    any_verified = False
    any_failed = False
    
    for stage, result in state.stages.items():
        if result.criticality in (StageCriticality.CRITICAL, StageCriticality.IMPORTANT):
            if result.verified:
                any_verified = True
            elif result.status not in (StageExecutionStatus.SKIPPED, StageExecutionStatus.NOT_APPLICABLE):
                all_mandatory_verified = False
        
        if result.status == StageExecutionStatus.FAILED and result.criticality == StageCriticality.CRITICAL:
            any_failed = True
            
    if any_failed or state.integrity_failure:
        state.verification_status = VerificationStatus.FAILED
    elif all_mandatory_verified and state.execution_status == ExecutionStatus.COMPLETED:
        state.verification_status = VerificationStatus.VERIFIED
    elif any_verified:
        state.verification_status = VerificationStatus.PARTIALLY_VERIFIED
    elif state.execution_status == ExecutionStatus.IN_PROGRESS:
        state.verification_status = VerificationStatus.IN_PROGRESS
    else:
        state.verification_status = VerificationStatus.NOT_STARTED
        
    # Production Verified boolean strictly follows completion and verification
    state.production_verified = (
        state.execution_status == ExecutionStatus.COMPLETED and
        state.verification_status == VerificationStatus.VERIFIED and
        not state.integrity_failure
    )
    
    # Compute Report Status
    if state.execution_status == ExecutionStatus.FAILED or state.integrity_failure:
        state.report_status = ReportStatus.INVALID
    elif state.execution_status == ExecutionStatus.BLOCKED:
        state.report_status = ReportStatus.BLOCKED
    elif state.execution_status == ExecutionStatus.COMPLETED and state.production_verified:
        state.report_status = ReportStatus.FINAL
    elif state.execution_status == ExecutionStatus.PARTIAL:
        state.report_status = ReportStatus.PARTIAL
    elif state.execution_status == ExecutionStatus.RUNNING:
        state.report_status = ReportStatus.GENERATING
    else:
        state.report_status = ReportStatus.NOT_READY
        
    # Blocker Status
    if state.execution_status == ExecutionStatus.BLOCKED:
        state.blocker_status = BlockerStatus.ACTIVE
    elif state.blocker_status == BlockerStatus.ACTIVE and state.execution_status != ExecutionStatus.BLOCKED:
        state.blocker_status = BlockerStatus.RESOLVED

    return state

