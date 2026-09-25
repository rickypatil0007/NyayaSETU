import json
import asyncio
from backend.pipeline.document_processor import DocumentProcessor
from backend.pipeline.audit_orchestrator import AuditOrchestrator
from backend.pipeline.report_generator import ReportGenerator

def test_gratuity_regression():
    print("\n--- 1. Document Extraction ---")
    doc_result = DocumentProcessor.extract_pdf("real_test.pdf")
    if doc_result["status"] == "EXTRACTION_FAILED":
        print("Failed to extract PDF.")
        return
        
    clauses = doc_result["clauses"]
    print(f"Extracted {len(clauses)} clauses. Effective Date: {doc_result['effective_date']}")
    
    # Filter for the gratuity clause if present (for testing specifically)
    gratuity_clause = None
    for c in clauses:
        if "gratuity" in c["clause_text"].lower():
            gratuity_clause = c
            break
            
    if not gratuity_clause:
        # Fallback to a mock gratuity clause to ensure the regression test runs
        print("No gratuity clause found in PDF, mocking one for regression test.")
        gratuity_clause = {
            "clause_text": "The Employee shall be entitled to gratuity after 2 years of continuous service.",
            "page_number": 2,
            "heading": "7. TERMINATION BENEFITS",
            "extraction_confidence": 0.99,
            "audit_date": "2026-09-16"
        }
    else:
        gratuity_clause["audit_date"] = "2026-09-16"

    print("\n--- 2. Orchestration & RAG ---")
    orch = AuditOrchestrator()
    print(f"Testing clause: {gratuity_clause['clause_text']}")
    
    finding = orch.process_clause(json.dumps(gratuity_clause))
    
    print("\n--- 3. Report Generation ---")
    report = ReportGenerator.generate_report("real_test.pdf", "India", [finding], {"overall_risk": finding.get("final_risk"), "confidence_score": 90})
    md = ReportGenerator.format_as_markdown(report)
    print(md)
    
if __name__ == "__main__":
    test_gratuity_regression()
