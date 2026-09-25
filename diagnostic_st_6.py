from backend.pipeline.audit_orchestrator import AuditOrchestrator
print('Instantiating AuditOrchestrator...')
try:
    orchestrator = AuditOrchestrator()
    print('Instantiated successfully!')
except Exception as e:
    print(f'Failed: {e}')
