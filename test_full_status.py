from backend.pipeline.status_engine import derive_full_audit_status
from backend.pipeline.status_models import AuditStatusState, StageExecutionResult, StageExecutionStatus, StageCriticality, PipelineStage, ExecutionStatus, ReviewStatus

def test_full():
    state = AuditStatusState()
    state.integrity_failure = False
    state.review_status = ReviewStatus.HUMAN_REVIEW_REQUIRED # Initially set this to ensure it does not bleed into execution_status
    state.stages = {
        PipelineStage.PDF_EXTRACTION: StageExecutionResult(PipelineStage.PDF_EXTRACTION, StageExecutionStatus.SUCCEEDED, StageCriticality.CRITICAL),
        PipelineStage.RAG_RETRIEVAL: StageExecutionResult(PipelineStage.RAG_RETRIEVAL, StageExecutionStatus.SUCCEEDED, StageCriticality.CRITICAL),
    }
    # Simulate production verification gates
    for s in state.stages.values():
        s.verified = True
        
    derived = derive_full_audit_status(state)
    print(f"execution_status: {derived.execution_status.name}")
    print(f"review_status: {derived.review_status.name}")
    print(f"production_verified: {derived.production_verified}")

test_full()
