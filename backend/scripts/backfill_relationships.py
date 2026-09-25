import os
import sys
import json
import httpx
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'env', '.env'))

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SECRET_KEY")

if not supabase_url or not supabase_key:
    print("Supabase credentials not found.")
    sys.exit(1)

def main():
    client = httpx.Client()
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json"
    }

    # Fetch all sources
    res = client.get(f"{supabase_url}/rest/v1/legal_sources?select=id,source_id,title", headers=headers)
    if res.status_code >= 400:
        print(f"Error fetching sources: {res.text}")
        return
        
    sources = res.json()
    source_id_map = {s["source_id"].lower(): s["id"] for s in sources}
    title_map = {s["title"].lower(): s["id"] for s in sources}
    
    # Also add basic normalization
    def normalize(t): return t.lower().replace(" ", "_").replace(",", "").replace("-", "_")
    norm_map = {normalize(s["title"]): s["id"] for s in sources}

    # Load crosswalk
    crosswalk_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "rag", "repeal_replacement_crosswalk.json")
    if not os.path.exists(crosswalk_path):
        print("Crosswalk file not found.")
        return
        
    with open(crosswalk_path, "r", encoding="utf-8") as f:
        crosswalk = json.load(f)
        
    inserted = 0
    for item in crosswalk.get("repeals", []):
        orig_name = item.get("original_name")
        super_source_id = item.get("superseded_by_source_id")
        
        # Find original UUID
        orig_uuid = title_map.get(orig_name.lower()) or norm_map.get(normalize(orig_name))
        
        # If not found directly, maybe it matches a source_id directly
        if not orig_uuid:
            orig_uuid = source_id_map.get(normalize(orig_name))
            
        # Find superseded UUID
        super_uuid = source_id_map.get(super_source_id.lower())
        
        if orig_uuid and super_uuid:
            # Insert relationship
            rel = {
                "source_id": orig_uuid,
                "related_source_id": super_uuid,
                "relationship_type": "superseded_by"
            }
            # Upsert relying on unique constraint (source_id, related_source_id, relationship_type)
            res = client.post(
                f"{supabase_url}/rest/v1/legal_source_relationships?on_conflict=source_id,related_source_id,relationship_type",
                headers=headers,
                json=rel
            )
            if res.status_code < 400:
                inserted += 1
                print(f"Linked {orig_name} -> {super_source_id}")
            else:
                print(f"Failed to link {orig_name}: {res.text}")
        else:
            print(f"Could not resolve UUIDs for {orig_name} (found: {bool(orig_uuid)}) -> {super_source_id} (found: {bool(super_uuid)})")
            
    print(f"Done. {inserted} relationships inserted/verified.")

if __name__ == "__main__":
    main()
