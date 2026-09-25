import urllib.request
import json
supabase_key = 'YOUR_SUPABASE_KEY_HERE'
url = 'https://htkughxcaxiluozxoewd.supabase.co/rest/v1/findings?audit_id=eq.3697c505-9997-4901-9b55-ae93041689a0&select=id,risk_level,issue_summary'
req = urllib.request.Request(url, headers={'apikey': supabase_key, 'Authorization': f'Bearer {supabase_key}'})
with urllib.request.urlopen(req) as res:
    data = json.loads(res.read().decode())
    print(f'Found {len(data)} findings')
    for d in data:
        print(f"- {d.get('risk_level')}: {d.get('issue_summary')}")
