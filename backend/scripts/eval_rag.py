import os
import sys
import asyncio
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.pipeline.audit_orchestrator import AuditOrchestrator

async def run_evaluation():
    orchestrator = AuditOrchestrator()
    print("Starting RAG Evaluation...\n")
    
    test_queries = [
        {
            "id": 1,
            "type": "stale_citation",
            "text": "The Employee shall be entitled to payment of gratuity upon termination in accordance with the Payment of Gratuity Act, 1972.",
            "doc_context": {"jurisdiction": "india"},
            "audit_date": "2024-05-01",
            "expected_warning": True,
            "expected_successor": "Code on Social Security"
        },
        {
            "id": 2,
            "type": "modern_law",
            "text": "Data fiduciary shall process personal data in accordance with the Digital Personal Data Protection Act, 2023.",
            "doc_context": {"jurisdiction": "india"},
            "audit_date": "2024-05-01",
            "expected_warning": False,
            "expected_successor": None
        },
        {
            "id": 3,
            "type": "historical_valid",
            "text": "The contract was executed under the Indian Contract Act, 1872 regarding breach of warranty.",
            "doc_context": {"jurisdiction": "india"},
            "audit_date": "2024-05-01",
            "expected_warning": False,
            "expected_successor": None
        },
        {
            "id": 4,
            "type": "stale_citation_multiple",
            "text": "The factory will comply with the Factories Act and the Industrial Disputes Act for handling employee strikes.",
            "doc_context": {"jurisdiction": "india"},
            "audit_date": "2024-05-01",
            "expected_warning": True,
            "expected_successor": "Occupational Safety" # partial match
        }
    ]
    
    passed = 0
    total = len(test_queries)
    
    for q in test_queries:
        print(f"--- Running Test {q['id']}: {q['type']} ---")
        evidence = await orchestrator.retrieve_legal_evidence_for_document(
            document_text=q["text"],
            doc_context=q["doc_context"],
            audit_date=q["audit_date"]
        )
        
        has_warning = any(e.get("metadata", {}).get("status") == "system_alert" for e in evidence)
        
        warning_texts = [e.get("metadata", {}).get("text", "") for e in evidence if e.get("metadata", {}).get("status") == "system_alert"]
        
        success = True
        
        if q["expected_warning"] and not has_warning:
            print("[FAIL] Expected stale citation warning, but got none.")
            success = False
        elif not q["expected_warning"] and has_warning:
            print(f"[FAIL] Did not expect warning, but got: {warning_texts}")
            success = False
        elif q["expected_warning"] and has_warning:
            # check successor text
            if q["expected_successor"]:
                found_successor = any(q["expected_successor"].lower() in w.lower() for w in warning_texts)
                if not found_successor:
                    print(f"[FAIL] Expected successor '{q['expected_successor']}' in warning, got {warning_texts}")
                    success = False
                else:
                    print(f"[PASS] Correct warning and successor detected. ({warning_texts[0]})")
            else:
                print(f"[PASS] Warning detected as expected. ({warning_texts[0]})")
        else:
            print("[PASS] Handled modern/historical correctly without warnings.")
            
        if success:
            passed += 1
            
        print("Top Evidence Chunks Retrieved:")
        for idx, e in enumerate(evidence):
            score = e.get('score', 1.0)
            status = e.get('metadata', {}).get('status', 'unknown')
            source = e.get('metadata', {}).get('source', 'unknown')
            print(f"  {idx+1}. [{status.upper()}] (Score: {score:.3f}) {source}")
            
        print("\n")
        
    print(f"Evaluation Complete: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")

if __name__ == "__main__":
    asyncio.run(run_evaluation())
