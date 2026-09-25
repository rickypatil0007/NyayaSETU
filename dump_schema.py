import urllib.request
import json

supabase_key = 'YOUR_SUPABASE_KEY_HERE'
url = 'https://htkughxcaxiluozxoewd.supabase.co/rest/v1/?apikey=' + supabase_key

req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode())
        
        tables = data.get('definitions', {})
        output = {}
        for table_name, schema in tables.items():
            props = schema.get('properties', {})
            output[table_name] = list(props.keys())
            
        with open('supabase_schema_dump.json', 'w') as f:
            json.dump(output, f, indent=2)
            
        print("Schema dumped successfully to supabase_schema_dump.json")
        for table, cols in output.items():
            print(f"Table: {table}")
            print(f"  Columns: {cols}")
except Exception as e:
    print(f'DB Query failed: {e}')
