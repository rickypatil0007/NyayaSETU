import re
import json
import os

with open(r"C:\Users\RICKY PATIL\.gemini\antigravity-ide\brain\e91bc51d-9ff9-45e7-ae99-d38ca45c91b6\.system_generated\logs\transcript_full.jsonl", "r", encoding="utf-8") as f:
    for line in f:
        data = json.loads(line)
        if data.get("type") == "TOOL_RESPONSE" and "def generate_json_response" in str(data):
            content = data.get("content", "")
            if "File Path: `file:///c:/Users/RICKY%20PATIL/Desktop/AI_Orchestrate/NyayaSETU/backend/agents/llm_router.py`" in content:
                lines = content.splitlines()
                restored_lines = []
                for l in lines:
                    if re.match(r'^\d+:\s', l):
                        restored_lines.append(l.split(': ', 1)[1])
                
                if restored_lines:
                    # we must read the whole file, because the transcript chunk might be truncated
                    pass

# Actually it's much easier to just undo the regex substitution from patch_llm.py!
with open(r"C:\Users\RICKY PATIL\Desktop\AI_Orchestrate\NyayaSETU\backend\agents\llm_router.py", "r", encoding="utf-8") as f:
    content = f.read()

# I will just write a patch that completely undoes my mock!
