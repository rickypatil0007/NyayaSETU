import json
with open('.cache/documents/d1ba1431-30f5-45eb-add4-bc926a33318f.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    clauses = data.get('clauses', [])
    print(f'Found {len(clauses)} clauses')
    if len(clauses) > 0:
        print(f'First clause length: {len(clauses[0].get("clause_text", ""))}')
