import requests
import json
import uuid
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"
FILE_PATH = r"C:\Users\RICKY PATIL\.gemini\antigravity-ide\brain\e91bc51d-9ff9-45e7-ae99-d38ca45c91b6\.user_uploaded\media_1790099437921.pdf"

print("1. Uploading Document...")
try:
    with open(FILE_PATH, "rb") as f:
        files = {"file": ("test_doc.pdf", f, "application/pdf")}
        upload_resp = requests.post(f"{BASE_URL}/documents/upload", files=files)
    upload_resp.raise_for_status()
    upload_data = upload_resp.json()
    document_id = upload_data.get("document_id")
    print(f"Upload successful. Document ID: {document_id}")
except Exception as e:
    print(f"Upload failed: {e}")
    sys.exit(1)

print("\n2. Starting Audit Stream...")
audit_id = str(uuid.uuid4())
stream_url = f"{BASE_URL}/audit/{audit_id}/run?document_id={document_id}"

try:
    with requests.get(stream_url, stream=True) as r:
        r.raise_for_status()
        for line in r.iter_lines():
            if line:
                decoded_line = line.decode('utf-8')
                print(decoded_line)
                
                # We can also parse JSON here if we want to print summaries
                if decoded_line.startswith("data: ") and not decoded_line.startswith("data: {"):
                    pass # just state text
except Exception as e:
    print(f"Stream failed: {e}")

print("\n3. Stream Finished!")
