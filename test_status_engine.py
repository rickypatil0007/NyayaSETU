from backend.pipeline.status_engine import derive_execution_status
from backend.pipeline.status_models import AuditStatusState, StageExecutionResult, ExecutionStatus, StageExecutionStatus, StageCriticality, PipelineStage

def test_status_cases():
    print('Testing Status Engine Cases...')

    # CASE 1: No work started
    state = AuditStatusState()
    state.stages = {
        PipelineStage.PDF_EXTRACTION: StageExecutionResult(PipelineStage.PDF_EXTRACTION, StageExecutionStatus.PENDING, StageCriticality.CRITICAL),
        PipelineStage.RAG_RETRIEVAL: StageExecutionResult(PipelineStage.RAG_RETRIEVAL, StageExecutionStatus.PENDING, StageCriticality.CRITICAL),
    }
    print(f"CASE 1 (Expected PENDING): {derive_execution_status(state).name}")

    # CASE 2: One required stage running
    state.stages[PipelineStage.PDF_EXTRACTION].status = StageExecutionStatus.RUNNING
    print(f"CASE 2 (Expected RUNNING): {derive_execution_status(state).name}")

    # CASE 3: Verified work exists, remaining required work exists, no blocker.
    state.stages[PipelineStage.PDF_EXTRACTION].status = StageExecutionStatus.SUCCEEDED
    print(f"CASE 3 (Expected PARTIAL): {derive_execution_status(state).name}")

    # CASE 4: Required stage blocked.
    state.stages[PipelineStage.RAG_RETRIEVAL].status = StageExecutionStatus.BLOCKED
    print(f"CASE 4 (Expected BLOCKED): {derive_execution_status(state).name}")

    # CASE 5: Unrecoverable integrity failure.
    state.integrity_failure = True
    print(f"CASE 5 (Expected FAILED): {derive_execution_status(state).name}")

    # CASE 6: All required stages and verification gates pass.
    state.integrity_failure = False
    state.stages = {
        PipelineStage.PDF_EXTRACTION: StageExecutionResult(PipelineStage.PDF_EXTRACTION, StageExecutionStatus.SUCCEEDED, StageCriticality.CRITICAL),
        PipelineStage.RAG_RETRIEVAL: StageExecutionResult(PipelineStage.RAG_RETRIEVAL, StageExecutionStatus.SUCCEEDED, StageCriticality.CRITICAL),
    }
    print(f"CASE 6 (Expected COMPLETED): {derive_execution_status(state).name}")

if __name__ == '__main__':
    test_status_cases()
