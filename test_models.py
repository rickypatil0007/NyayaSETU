import os
import requests
from dotenv import load_dotenv

load_dotenv("env/.env")

gemini_key = os.getenv("GEMINI_API_KEY")
print("Gemini Models:")
if gemini_key:
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={gemini_key}"
    resp = requests.get(url)
    if resp.status_code == 200:
        models = [m['name'] for m in resp.json().get('models', []) if 'gemini' in m['name'].lower()]
        print(models)
    else:
        print(resp.status_code, resp.text)

print("\nOpenRouter Models:")
resp = requests.get("https://openrouter.ai/api/v1/models")
if resp.status_code == 200:
    models = [m['id'] for m in resp.json().get('data', []) if 'gemini' in m['id'].lower()]
    print(models)
