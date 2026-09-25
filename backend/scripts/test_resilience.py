import os
import sys
import asyncio
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from backend.pipeline.audit_orchestrator import AuditOrchestrator

async def validate_resilience():
    print("Initializing Orchestrator with a broken supervisor...")
    
    orchestrator = AuditOrchestrator()
    
    clause_text = """7. Limitation of Liability
    The company's liability is capped at $100.
    12. Termination
    This agreement can be terminated without notice."""
    
    print("Running audit...")
    final_findings_data = []
    
    # We will just mock the supervisor by patching it.
    async def mock_fail(*args, **kwargs):
        return {"error": "API timeout simulated for supervisor"}
    
    orchestrator.supervisor.resolve_disputes = mock_fail
    
    async for msg in orchestrator.process_full_document_stream(
        document_text=clause_text,
        doc_context={},
        document_id="doc-val-002",
        document_hash="dummyhashval"
    ):
        if msg.startswith("event: complete_data"):
            data_str = msg.split("data: ")[1].strip()
            final_findings_data = json.loads(data_str)
            break
            
    print("\n=== RESILIENCE TEST RESULT ===")
    print(f"Total Detected Findings Upstream: {len(final_findings_data)}")
    
    for idx, f in enumerate(final_findings_data):
        print(f"\n--- Finding {idx+1} ---")
        print(f"Clause: {f.get('clause_text', '')[:50]}...")
        print(f"Final Risk: {f.get('final_risk')}")
        print(f"Human Escalation: {f.get('human_escalation')}")

if __name__ == "__main__":
    asyncio.run(validate_resilience())
