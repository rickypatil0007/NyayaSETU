import asyncio
import httpx
import json

async def test_insert():
    supabase_url = 'https://htkughxcaxiluozxoewd.supabase.co'
    supabase_key = 'YOUR_SUPABASE_KEY_HERE'
    audit_id = 'f7d62617-d6cd-49be-bf59-ee87fbff69c9'
    
    async with httpx.AsyncClient() as client:
        # Load clauses
        with open('.cache/documents/d1ba1431-30f5-45eb-add4-bc926a33318f.json', 'r', encoding='utf-8') as f:
            doc_data = json.load(f)
            
        all_clauses = doc_data.get("clauses", [])
        print(f"Found {len(all_clauses)} clauses. Inserting...")
        
        inserted_count = 0
        for idx, clause in enumerate(all_clauses):
            c_text = clause.get("clause_text", "")
            if len(c_text.strip()) > 10:
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
                    
        print(f"Inserted {inserted_count} findings directly.")
        
asyncio.run(test_insert())
