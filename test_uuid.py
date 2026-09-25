import asyncio
import httpx

async def check():
    supabase_url = 'https://htkughxcaxiluozxoewd.supabase.co'
    supabase_key = 'YOUR_SUPABASE_KEY_HERE'
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f'{supabase_url}/rest/v1/audits?select=id',
            headers={'apikey': supabase_key, 'Authorization': f'Bearer {supabase_key}'}
        )
        for row in res.json():
            if row['id'].startswith('2d4ea39f'):
                print(f'Found match: {row["id"]}')
                audit_id = row["id"]
                
                # Check findings for this audit
                res_findings = await client.get(
                    f'{supabase_url}/rest/v1/findings?audit_id=eq.{audit_id}',
                    headers={'apikey': supabase_key, 'Authorization': f'Bearer {supabase_key}'}
                )
                print(f'Findings count: {len(res_findings.json())}')
                
asyncio.run(check())
