import json
import re
import ast

def restore_from_transcript(filepath_in_repo, search_string):
    transcript_path = r"C:\Users\RICKY PATIL\.gemini\antigravity-ide\brain\e91bc51d-9ff9-45e7-ae99-d38ca45c91b6\.system_generated\logs\transcript_full.jsonl"
    with open(transcript_path, "r", encoding="utf-8") as f:
        for line in reversed(list(f)):
            data = json.loads(line)
            if data.get("type") == "TOOL_RESPONSE" and search_string in str(data):
                content = data.get("content", "")
                if f"File Path: `file:///c:/Users/RICKY%20PATIL/Desktop/AI_Orchestrate/NyayaSETU/{filepath_in_repo.replace(chr(92), '/')}`" in content:
                    lines = content.splitlines()
                    restored_lines = []
                    for l in lines:
                        if re.match(r'^\d+:\s', l):
                            restored_lines.append(l.split(': ', 1)[1])
                    
                    if restored_lines:
                        # Found it! Since it was sliced (e.g. lines 1 to 250), we might need multiple view_files or it might have been the whole file.
                        return "\n".join(restored_lines)
    return None

llm_router = restore_from_transcript("backend/agents/llm_router.py", "def generate_json_response")
print("Found llm_router: ", len(llm_router) if llm_router else None)

# Since I viewed llm_router in multiple turns (e.g. earlier I viewed 1 to 454?), I can grep for the whole file.
