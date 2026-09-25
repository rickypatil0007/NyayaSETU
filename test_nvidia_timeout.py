import os
import requests
from dotenv import load_dotenv

load_dotenv('env/.env')
url = 'https://integrate.api.nvidia.com/v1/chat/completions'
headers = {
    'Authorization': f'Bearer {os.getenv("NVIDIA_GLM_5_3_FLASH_API_KEY")}',
    'Content-Type': 'application/json'
}
payload = {
    "model": "z-ai/glm-5.3-flash",
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Write a 500 word essay about the wonders of GPU computing."}
    ],
    "temperature": 0.7,
    "max_tokens": 1024,
    "stream": False
}
print("Testing glm-5.3-flash...")
try:
    response = requests.post(url, headers=headers, json=payload, timeout=90.0)
    print("Status Code:", response.status_code)
    print("Content Length:", len(response.text))
except Exception as e:
    print("Error:", str(e))
