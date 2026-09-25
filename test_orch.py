import traceback
from backend.pipeline.audit_orchestrator import AuditOrchestrator

try:
    print("Initializing orchestrator...")
    orch = AuditOrchestrator()
    print("Processing clause...")
    result = orch.process_clause('This is a test clause.')
    print("Success:", result)
except Exception as e:
    print("Exception occurred:")
    traceback.print_exc()
