import os
import requests
import time
import logging
import io
import sys
from typing import List
from dotenv import load_dotenv

# Load env variables from env/.env
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "env", ".env"))

_logger = logging.getLogger("nyayasetu.embeddings")
if not _logger.handlers:
    _handler = logging.StreamHandler(
        stream=io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="backslashreplace")
    )
    _handler.setFormatter(logging.Formatter("%(message)s"))
    _logger.addHandler(_handler)
    _logger.setLevel(logging.INFO)


class EmbeddingGenerator:
    _instance = None

    MAX_RETRIES_PER_PROVIDER = 3
    BACKOFF_BASE = 2.0  # seconds

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(EmbeddingGenerator, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if hasattr(self, '_initialized') and self._initialized:
            return
            
        self._initialized = True
        
        # Configure NVIDIA Embedding models
        self.providers = []
        
        key1 = os.environ.get("NVIDIA_NEMOTRON_3_EMBED_1B_API_KEY")
        if key1:
            self.providers.append({
                "api_key": key1,
                "model_name": "nvidia/nemotron-3-embed-1b",
                "key_name": "NVIDIA_NEMOTRON_3_EMBED_1B_API_KEY"
            })
            
        key2 = os.environ.get("NVIDIA_LLAMA_NEMOTRON_EMBED_VL_1B_V2_API_KEY")
        if key2:
            self.providers.append({
                "api_key": key2,
                "model_name": "nvidia/llama-nemotron-embed-vl-1b-v2",
                "key_name": "NVIDIA_LLAMA_NEMOTRON_EMBED_VL_1B_V2_API_KEY"
            })

        self._dimension = 2048  # These specific NVIDIA models return 2048
        self._session = requests.Session()
        _logger.info(f"EmbeddingGenerator initialized with {len(self.providers)} providers")

    @property
    def dimension(self):
        return self._dimension

    def generate_embedding(self, text: str) -> List[float]:
        return self.generate_embeddings([text])[0]

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        if not self.providers:
            raise RuntimeError("No NVIDIA Embedding API keys configured in .env")

        url = "https://integrate.api.nvidia.com/v1/embeddings"
        all_errors = []
        
        for provider in self.providers:
            key_name = provider.get("key_name", "unknown")
            
            for attempt in range(self.MAX_RETRIES_PER_PROVIDER):
                headers = {
                    "Authorization": f"Bearer {provider['api_key']}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "input": texts,
                    "model": provider["model_name"],
                    "input_type": "query",
                    "encoding_format": "float",
                    "truncate": "NONE"
                }
                
                try:
                    _logger.info(f"  [Embed] Trying {key_name} / {provider['model_name']} (attempt {attempt+1}/{self.MAX_RETRIES_PER_PROVIDER})")
                    
                    response = self._session.post(url, headers=headers, json=payload, timeout=20.0)
                    response.raise_for_status()
                    data = response.json()
                    
                    if "data" not in data or not data["data"]:
                        raise ValueError(f"No embeddings returned from {key_name}")
                        
                    _logger.info(f"  [Embed] SUCCESS via {key_name}")
                    # Sort data array by index in case it came back out of order
                    sorted_data = sorted(data["data"], key=lambda x: x["index"])
                    return [d["embedding"] for d in sorted_data]
                    
                except requests.exceptions.Timeout:
                    err = f"{key_name}: Timeout (attempt {attempt+1})"
                    all_errors.append(err)
                    _logger.warning(f"  [Embed] {err}")
                    if attempt < self.MAX_RETRIES_PER_PROVIDER - 1:
                        time.sleep(self.BACKOFF_BASE * (2 ** attempt))
                except requests.exceptions.HTTPError as e:
                    status = e.response.status_code if e.response is not None else 0
                    err = f"{key_name}: HTTP {status} (attempt {attempt+1})"
                    all_errors.append(err)
                    _logger.warning(f"  [Embed] {err}")
                    
                    if status in (401, 403):
                        _logger.warning(f"  [Embed] AUTH ERROR {status} on {key_name}, trying next provider")
                        break # Skip remaining attempts for this key
                    elif attempt < self.MAX_RETRIES_PER_PROVIDER - 1:
                        time.sleep(self.BACKOFF_BASE * (2 ** attempt))
                except Exception as e:
                    err = f"{key_name}: Error: {str(e)} (attempt {attempt+1})"
                    all_errors.append(err)
                    _logger.warning(f"  [Embed] {err}")
                    if attempt < self.MAX_RETRIES_PER_PROVIDER - 1:
                        time.sleep(self.BACKOFF_BASE * (2 ** attempt))

        _logger.error(f"  [Embed] ALL ATTEMPTS FAILED. Errors: {all_errors}")
        raise RuntimeError("Failed to generate embeddings across all configured API keys and attempts.")
