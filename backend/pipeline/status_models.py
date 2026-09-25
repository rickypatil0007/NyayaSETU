from enum import Enum
from typing import List, Optional, Dict, Any

class ExecutionStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    PARTIAL = "PARTIAL"
    BLOCKED = "BLOCKED"
    FAILED = "FAILED"
    COMPLETED = "COMPLETED"

class ReviewStatus(str, Enum):
    NOT_REQUIRED = "NOT_REQUIRED"
    IN_PROGRESS = "IN_PROGRESS"
    HUMAN_REVIEW_REQUIRED = "HUMAN_REVIEW_REQUIRED"
    HUMAN_REVIEW_IN_PROGRESS = "HUMAN_REVIEW_IN_PROGRESS"
    HUMAN_REVIEW_COMPLETED = "HUMAN_REVIEW_COMPLETED"
    REJECTED = "REJECTED"

class VerificationStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    PARTIALLY_VERIFIED = "PARTIALLY_VERIFIED"
    VERIFIED = "VERIFIED"
    FAILED = "FAILED"

class ReportStatus(str, Enum):
    NOT_READY = "NOT_READY"
    GENERATING = "GENERATING"
    DRAFT = "DRAFT"
    PARTIAL = "PARTIAL"
    FINAL = "FINAL"
    BLOCKED = "BLOCKED"
    INVALID = "INVALID"

class BlockerStatus(str, Enum):
    NONE = "NONE"
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"

class PipelineStage(str, Enum):
    UPLOAD = "UPLOAD"
    DOCUMENT_REGISTRATION = "DOCUMENT_REGISTRATION"
    DOCUMENT_HASHING = "DOCUMENT_HASHING"
    PDF_EXTRACTION = "PDF_EXTRACTION"
    OCR = "OCR"
    PAGE_SEGMENTATION = "PAGE_SEGMENTATION"
    CLAUSE_DETECTION = "CLAUSE_DETECTION"
    CLAUSE_COVERAGE = "CLAUSE_COVERAGE"
    CANDIDATE_DETECTION = "CANDIDATE_DETECTION"
    RAG_RETRIEVAL = "RAG_RETRIEVAL"
    RAG_VALIDATION = "RAG_VALIDATION"
    REVIEWER = "REVIEWER"
    SKEPTIC = "SKEPTIC"
    SUPERVISOR = "SUPERVISOR"
    FINDING_VALIDATION = "FINDING_VALIDATION"
    COMPLETENESS_CHECK = "COMPLETENESS_CHECK"
    REPORT_AGGREGATION = "REPORT_AGGREGATION"
    REPORT_GENERATION = "REPORT_GENERATION"
    PDF_RENDERING = "PDF_RENDERING"
    FINAL_VERIFICATION = "FINAL_VERIFICATION"

class StageCriticality(str, Enum):
    CRITICAL = "CRITICAL"
    IMPORTANT = "IMPORTANT"
    OPTIONAL = "OPTIONAL"

class StageExecutionStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    SUCCEEDED = "SUCCEEDED"
    PARTIAL = "PARTIAL"
    BLOCKED = "BLOCKED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"
    NOT_APPLICABLE = "NOT_APPLICABLE"

class StageExecutionResult:
    def __init__(self, stage: PipelineStage, status: StageExecutionStatus, criticality: StageCriticality):
        self.stage = stage
        self.status = status
        self.criticality = criticality
        self.verified: bool = False
        self.downstream_safe: bool = False
        self.blocker_id: Optional[str] = None
        self.failure_code: Optional[str] = None

class AuditStatusState:
    def __init__(self):
        self.execution_status: ExecutionStatus = ExecutionStatus.PENDING
        self.review_status: ReviewStatus = ReviewStatus.NOT_REQUIRED
        self.verification_status: VerificationStatus = VerificationStatus.NOT_STARTED
        self.report_status: ReportStatus = ReportStatus.NOT_READY
        self.blocker_status: BlockerStatus = BlockerStatus.NONE
        self.production_verified: bool = False
        self.integrity_failure: bool = False
        self.stages: Dict[PipelineStage, StageExecutionResult] = {}

