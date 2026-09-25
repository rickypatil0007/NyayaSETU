import urllib.request
import json
supabase_key = 'YOUR_SUPABASE_KEY_HERE'
url = 'https://htkughxcaxiluozxoewd.supabase.co/rest/v1/findings?audit_id=eq.f7d62617-d6cd-49be-bf59-ee87fbff69c9&select=id,risk_level,issue_summary'
req = urllib.request.Request(url, headers={'apikey': supabase_key, 'Authorization': f'Bearer {supabase_key}'})
with urllib.request.urlopen(req) as res:
    data = json.loads(res.read().decode())
    print(f'Found {len(data)} findings')
    for d in data:
        print(f"- {d.get('risk_level')}: {d.get('issue_summary')}")
