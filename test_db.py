import urllib.request
import json
supabase_key = 'YOUR_SUPABASE_KEY_HERE'
url = f'https://htkughxcaxiluozxoewd.supabase.co/rest/v1/audits?select=*&order=created_at.desc&limit=5'
req = urllib.request.Request(url, headers={
    'apikey': supabase_key,
    'Authorization': f'Bearer ' + supabase_key
})
try:
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode())
        print(f'Found {len(data)} recent audits:')
        for d in data:
            print(f"- {d['id']} : {d.get('name', 'Unknown')}")
            
            f_url = f"https://htkughxcaxiluozxoewd.supabase.co/rest/v1/findings?audit_id=eq.{d['id']}&select=id,risk_level"
            f_req = urllib.request.Request(f_url, headers={'apikey': supabase_key, 'Authorization': 'Bearer ' + supabase_key})
            try:
                with urllib.request.urlopen(f_req) as f_res:
                    f_data = json.loads(f_res.read().decode())
                    print(f"  -> Findings: {len(f_data)}")
            except Exception as e:
                pass
except Exception as e:
    print(f'DB Query failed: {e}')
