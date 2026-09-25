import asyncio
import httpx
import json
import time

async def run_audit():
    async with httpx.AsyncClient(timeout=300.0) as client:
        supabase_key = 'YOUR_SUPABASE_KEY_HERE'
        import uuid
        audit_id = str(uuid.uuid4())
        
        await client.post(
            'https://htkughxcaxiluozxoewd.supabase.co/rest/v1/audits',
            headers={'apikey': supabase_key, 'Authorization': f'Bearer {supabase_key}'},
            json={'id': audit_id, 'name': 'Test Audit Fallback', 'document_id': 'd1ba1431-30f5-45eb-add4-bc926a33318f'}
        )
        
        print(f'Started audit {audit_id}')
        
        try:
            async with client.stream('GET', f'http://127.0.0.1:8000/api/v1/audit/{audit_id}/run?document_id=d1ba1431-30f5-45eb-add4-bc926a33318f') as response:
                async for line in response.aiter_lines():
                    print(line)
                    if 'SKEPTIC' in line:
                        print('Disconnecting early to trigger CancelledError!')
                        break
        except Exception as e:
            print(f'Stream ended: {e}')
            
        print('Waiting 10 seconds for background task to insert CLEAR findings and fallback...')
        await asyncio.sleep(10)
        
        r = await client.get(
            f'https://htkughxcaxiluozxoewd.supabase.co/rest/v1/findings?audit_id=eq.{audit_id}&select=id,risk_level,issue_summary',
            headers={'apikey': supabase_key, 'Authorization': f'Bearer {supabase_key}'}
        )
        findings = r.json()
        print(f'Found {len(findings)} findings!')
        for f in findings:
            if f.get('risk_level') != 'CLEAR':
                print(f"Risk: {f['risk_level']}, Summary: {f['issue_summary']}")

asyncio.run(run_audit())
