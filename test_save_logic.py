import asyncio
import httpx
import json

async def test_insert():
    supabase_url = 'https://htkughxcaxiluozxoewd.supabase.co'
    supabase_key = 'YOUR_SUPABASE_KEY_HERE'
    audit_id = 'f7d62617-d6cd-49be-bf59-ee87fbff69c9'
    document_id = 'd1ba1431-30f5-45eb-add4-bc926a33318f'
    
    # 1. Simulate the fallback finding from orchestrator
    fallback_finding = {
        "execution_status": "COMPLETED",
        "resolution_path": "WITH_DEBATE",
        "clause_id": "fallback-001",
        "clause_text": "Analysis failed due to LLM provider downtime or pipeline crash.",
        "page_number": 1,
        "exact_text": "Analysis failed due to LLM provider downtime or pipeline crash.",
        "evidence_retrieved": 0,
        "reviewer": {
            "finding_id": "fallback-001",
            "exact_contract_quote": "Analysis failed due to LLM provider downtime or pipeline crash.",
            "issue": "AI Reviewer encountered a severe error",
            "risk_level": "HIGH",
            "confidence": 100,
            "reasoning_summary": "The pipeline was interrupted."
        },
        "skeptic": {},
        "supervisor": {},
        "retrieved_evidence": [],
        "human_escalation": False,
        "document_id": document_id,
        "document_hash": "unknown",
        "final_risk": "HIGH"
    }
    
    final_findings_data = [fallback_finding]
    
    async with httpx.AsyncClient() as client:
        # 1. Insert fallback finding
        inserted_quotes = []
        for finding in final_findings_data:
            reviewer_finding = finding.get("reviewer", {})
            exact_quote = reviewer_finding.get("exact_contract_quote", "")
            if exact_quote:
                inserted_quotes.append(exact_quote)
                
            finding_data = {
                "audit_id": audit_id,
                "clause_text": exact_quote,
                "issue_summary": reviewer_finding.get("issue", "No issue"),
                "risk_level": finding.get("final_risk", "UNKNOWN"),
                "confidence_score": reviewer_finding.get("confidence", 85),
                "status": "Confirmed",
                "recommendation": json.dumps({"comment": "test"})
            }
            res = await client.post(
                f"{supabase_url}/rest/v1/findings",
                headers={"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}", "Content-Type": "application/json", "Prefer": "return=minimal"},
                json=finding_data
            )
            print(f"Fallback insert status: {res.status_code}, {res.text}")
            
        # 2. Load clauses
        with open('.cache/documents/d1ba1431-30f5-45eb-add4-bc926a33318f.json', 'r', encoding='utf-8') as f:
            doc_data = json.load(f)
            
        all_clauses = doc_data.get("clauses", [])
        print(f"Found {len(all_clauses)} clauses.")
        
        inserted_count = 0
        for idx, clause in enumerate(all_clauses):
            c_text = clause.get("clause_text", "")
            is_covered = any(q in c_text or c_text in q for q in inserted_quotes if q)
            print(f"Clause {idx} is_covered={is_covered}")
            if not is_covered and len(c_text.strip()) > 10:
                clear_finding = {
                    "audit_id": audit_id,
                    "clause_text": c_text,
                    "issue_summary": "No compliance issues detected",
                    "risk_level": "CLEAR",
                    "confidence_score": 95,
                    "status": "Confirmed",
                    "recommendation": json.dumps({"comment": "test"})
                }
                res = await client.post(
                    f"{supabase_url}/rest/v1/findings",
                    headers={"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}", "Content-Type": "application/json", "Prefer": "return=minimal"},
                    json=clear_finding
                )
                if res.status_code >= 400:
                    print(f"Error inserting clause {idx}: {res.text}")
                else:
                    inserted_count += 1
                    
        print(f"Inserted {inserted_count} CLEAR findings directly.")
        
asyncio.run(test_insert())
