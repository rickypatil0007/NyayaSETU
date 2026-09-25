import os
import requests
from dotenv import load_dotenv

load_dotenv("env/.env")

gemini_key = os.getenv("GEMINI_API_KEY")
openrouter_key = os.getenv("OPENROUTER_API_KEY")

print("--- Testing Gemini ---")
if gemini_key:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={gemini_key}"
    payload = {
        "contents": [{"parts": [{"text": "Hello, respond with {}"}]}],
        "generationConfig": {"responseMimeType": "application/json"}
    }
    resp = requests.post(url, json=payload)
    print(resp.status_code)
    print(resp.text[:200])

print("\n--- Testing OpenRouter ---")
if openrouter_key:
    headers = {"Authorization": f"Bearer {openrouter_key}"}
    payload = {
        "model": "google/gemini-1.5-flash",
        "messages": [{"role": "user", "content": "Hello, {}"}]
    }
    resp = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
    print(resp.status_code)
    print(resp.text[:200])
