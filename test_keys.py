import os
import requests
from dotenv import load_dotenv
import json

load_dotenv("env/.env")
results = {}

# 1. Test Gemini
gemini_key = os.environ.get("GEMINI_API_KEY")
if gemini_key:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
    try:
        resp = requests.post(url, json={"contents": [{"parts":[{"text": "Hi"}]}]})
        results["Gemini"] = f"{resp.status_code} - {resp.text[:150]}"
    except Exception as e:
        results["Gemini"] = f"Error: {e}"
else:
    results["Gemini"] = "No key found"

# 2. Test OpenRouter
openrouter_key = os.environ.get("OPENROUTER_API_KEY")
if openrouter_key:
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {"Authorization": f"Bearer {openrouter_key}"}
    try:
        resp = requests.post(url, headers=headers, json={"model": "openai/gpt-3.5-turbo", "messages": [{"role": "user", "content": "Hi"}], "max_tokens": 10})
        results["OpenRouter"] = f"{resp.status_code} - {resp.text[:150]}"
    except Exception as e:
        results["OpenRouter"] = f"Error: {e}"
else:
    results["OpenRouter"] = "No key found"

# 3. Test NVIDIA Chat Models
nvidia_models = [
    ("NVIDIA_GLM_5_3_FLASH", "z-ai/glm-5.3-flash"),
    ("NVIDIA_NEMOTRON_3_SUPER_120B", "nvidia/nemotron-3-super-120b-a12b"),
    ("NVIDIA_NEMOTRON_3_ULTRA_550B", "nvidia/nemotron-3-ultra-550b-a55b"),
    ("NVIDIA_GPT_OSS_20B", "openai/gpt-oss-20b"),
    ("NVIDIA_KIMI_K3", "moonshotai/kimi-k3"),
    ("NVIDIA_NEMOTRON_3_5_LIGHTNING_30B", "nvidia/nemotron-3.5-lightning-30b-a3b")
]

for env_prefix, model in nvidia_models:
    key = os.environ.get(f"{env_prefix}_API_KEY")
    if key:
        url = "https://integrate.api.nvidia.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {key}", "Accept": "application/json"}
        try:
            resp = requests.post(url, headers=headers, json={"model": model, "messages": [{"role": "user", "content": "Hi"}], "max_tokens": 10}, timeout=10)
            results[f"NVIDIA ({model})"] = f"{resp.status_code} - {resp.text[:150]}"
        except Exception as e:
            results[f"NVIDIA ({model})"] = f"Error: {e}"
    else:
        results[f"NVIDIA ({model})"] = "No key found"

# 4. Pinecone
pinecone_key = os.environ.get("PINECONE_API_KEY")
pinecone_host = os.environ.get("PINECONE_INDEX_HOST")
if pinecone_key and pinecone_host:
    url = f"{pinecone_host}/query"
    headers = {"Api-Key": pinecone_key, "Content-Type": "application/json"}
    try:
        # We just query with a dummy vector to see if we get a 200 or 401/404
        resp = requests.post(url, headers=headers, json={"vector": [0.1]*2048, "topK": 1}, timeout=5)
        results["Pinecone"] = f"{resp.status_code} - {resp.text[:150]}"
    except Exception as e:
        results["Pinecone"] = f"Error: {e}"
else:
    results["Pinecone"] = "No key or host found"

print(json.dumps(results, indent=2))

