from backend.pipeline.audit_orchestrator import AuditOrchestrator
try:
    orch = AuditOrchestrator()
    res = orch.process_clause("This is a test clause.")
    print("SUCCESS", res)
except Exception as e:
    import traceback
    traceback.print_exc()
