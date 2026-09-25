import asyncio
import httpx

async def check():
    supabase_url = 'https://htkughxcaxiluozxoewd.supabase.co'
    supabase_key = 'YOUR_SUPABASE_KEY_HERE'
    audit_id = 'f7d62617-d6cd-49be-bf59-ee87fbff69c9'
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f'{supabase_url}/rest/v1/findings?audit_id=eq.{audit_id}',
            headers={'apikey': supabase_key, 'Authorization': f'Bearer {supabase_key}'}
        )
        data = res.json()
        print(f'Found {len(data)} findings for f7d6:')
        for i, d in enumerate(data):
            text = str(d.get('clause_text', ''))
            print(f"  {i+1}: risk={d.get('risk_level')}, text={text[:40]}")

asyncio.run(check())
