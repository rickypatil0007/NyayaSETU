import re
import time

with open('backend/agents/llm_router.py.bak', 'r', encoding='utf-8') as f:
    text = f.read()

breaker_new = """class _ProviderCircuitBreaker:
    def __init__(self, threshold: int = 2, cooldown_sec: float = 60.0):
        self._failures = {}
        self._last_failure = {}
        self._permanent = {}
        self._threshold = threshold
        self._cooldown = cooldown_sec
        import threading
        self._lock = threading.Lock()

    def record_failure(self, identifier: str, error_msg: str = "") -> None:
        import time
        with self._lock:
            err = error_msg.lower()
            if any(x in err for x in ["401", "403", "unauthorized", "invalid api key", "invalid model", "not found", "quota", "429", "402"]):
                self._permanent[identifier] = True
            
            self._failures[identifier] = self._failures.get(identifier, 0) + 1
            self._last_failure[identifier] = time.time()

    def record_success(self, identifier: str) -> None:
        with self._lock:
            self._failures[identifier] = 0
            self._permanent[identifier] = False

    def is_tripped(self, identifier: str) -> bool:
        import time
        with self._lock:
            if self._permanent.get(identifier, False):
                return True
                
            failures = self._failures.get(identifier, 0)
            if failures >= self._threshold:
                last_time = self._last_failure.get(identifier, 0)
                if time.time() - last_time > self._cooldown:
                    return False
                return True
            return False"""

text = re.sub(r'class _ProviderCircuitBreaker:.*?return False', breaker_new, text, flags=re.DOTALL)

init_new = """    def __init__(self):
        self.nvidia_configs = []
        
        key_env_vars = [
            "NVIDIA_NEMOTRON_3_SUPER_120B_API_KEY",
            "NVIDIA_NEMOTRON_3_ULTRA_550B_API_KEY",
            "NVIDIA_GPT_OSS_20B_API_KEY",
            "NVIDIA_GLM_5_3_FLASH_API_KEY"
        ]
        
        found_keys = []
        import os
        for var in key_env_vars:
            val = os.environ.get(var)
            if val:
                found_keys.append((var, val))
                if len(found_keys) == 2:
                    break
                    
        for var, key in found_keys:
            self.nvidia_configs.append({
                "provider": "nvidia",
                "key_name": var,
                "api_key": key,
                "model_name": "nvidia/nemotron-3-super-120b-a12b"
            })

        self.gemini_api_key = os.environ.get("GEMINI_API_KEY")
        self.gemini_model_name = "models/gemini-1.5-flash"
        
        self.openrouter_api_key = os.environ.get("OPENROUTER_API_KEY")
        
        self._breaker = _ProviderCircuitBreaker(threshold=2)
        self.call_log = []
        import requests
        self._session = requests.Session()"""
text = re.sub(r'    def __init__\(self\):.*?self\._session = requests\.Session\(\)', init_new, text, flags=re.DOTALL)


gen_new = """    def generate_json_response(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        import requests as _requests_module
        import time
        
        full_prompt = f"{system_prompt}\\n\\nUser Input:\\n{user_prompt}\\n\\nPlease respond ONLY with valid JSON."
        call_start = time.monotonic()
        deadline = call_start + self.LOGICAL_CALL_DEADLINE_SECONDS
        logical_call_id = f"llm-{id(self)}-{int(time.monotonic()*1000)}"

        if self._breaker.is_tripped("provider_nvidia"):
            _logger.info("--> Provider NVIDIA globally tripped. Skipping to fallbacks.")
            nvidia_candidates = []
        else:
            nvidia_candidates = [c for c in self.nvidia_configs if not self._breaker.is_tripped(c["key_name"])]
            if not nvidia_candidates:
                if self.nvidia_configs:
                    self._breaker.record_failure("provider_nvidia", "All keys exhausted")
        
        invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
        for config in nvidia_candidates:
            key_name = config["key_name"]
            api_key = config["api_key"]
            model_name = config["model_name"]
            
            max_attempts_per_key = 2
            key_exhausted = False
            
            for attempt in range(max_attempts_per_key):
                if time.monotonic() > deadline:
                    break
                    
                attempt_record = {
                    "logical_call_id": logical_call_id,
                    "provider": "nvidia",
                    "key_name": key_name,
                    "model": model_name,
                    "attempt": attempt + 1,
                    "start": time.time(),
                }
                
                try:
                    _logger.info(f"--> Trying NVIDIA (Key: {key_name})")
                    headers = {
                        "Authorization": f"Bearer {api_key}",
                        "Accept": "application/json"
                    }
                    payload = {
                        "model": model_name,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt + "\\n\\nPlease respond ONLY with a raw, valid JSON object (no markdown, no backticks, just the {})."}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 4096,
                        "stream": False
                    }
                    
                    effective_read = min(self.READ_TIMEOUT, max(2.0, deadline - time.monotonic()))
                    response = self._session.post(
                        invoke_url, headers=headers, json=payload, timeout=(self.CONNECT_TIMEOUT, effective_read)
                    )
                    
                    response.raise_for_status()
                    data = response.json()
                    text_resp = data["choices"][0]["message"]["content"].strip()
                    
                    attempt_record.update({"end": time.time(), "duration": time.time() - attempt_record["start"], "status": "SUCCESS"})
                    self.call_log.append(attempt_record)
                    self._breaker.record_success(key_name)
                    self._breaker.record_success("provider_nvidia")
                    
                    return self._parse_json(text_resp)
                    
                except _requests_module.exceptions.Timeout as e:
                    attempt_record.update({"end": time.time(), "duration": time.time() - attempt_record["start"], "status": "TIMEOUT"})
                    self.call_log.append(attempt_record)
                    self._breaker.record_failure(key_name, "timeout")
                    _logger.info(f"NVIDIA API ({key_name}): timeout")
                    if attempt < max_attempts_per_key - 1:
                        time.sleep(1.0)
                    else:
                        key_exhausted = True
                    continue
                    
                except _requests_module.exceptions.HTTPError as e:
                    status_code = e.response.status_code if e.response is not None else 0
                    attempt_record.update({"end": time.time(), "duration": time.time() - attempt_record["start"], "status": f"HTTP_{status_code}"})
                    self.call_log.append(attempt_record)
                    
                    if status_code in (401, 402, 403, 429):
                        self._breaker.record_failure(key_name, f"HTTP {status_code} quota/auth")
                        _logger.info(f"NVIDIA API ({key_name}): auth/quota failure {status_code} - skipping key")
                        key_exhausted = True
                        break
                    else:
                        self._breaker.record_failure(key_name, f"HTTP {status_code}")
                        _logger.info(f"NVIDIA API ({key_name}): HTTP {status_code}")
                        if attempt < max_attempts_per_key - 1:
                            time.sleep(1.0)
                        else:
                            key_exhausted = True
                    continue
                    
                except Exception as e:
                    attempt_record.update({"end": time.time(), "duration": time.time() - attempt_record["start"], "status": "ERROR"})
                    self.call_log.append(attempt_record)
                    self._breaker.record_failure(key_name, str(e))
                    _logger.info(f"NVIDIA API ({key_name}): {e}")
                    if attempt < max_attempts_per_key - 1:
                        time.sleep(1.0)
                    else:
                        key_exhausted = True
                    continue
            
            if not key_exhausted:
                break
        
        if self.gemini_api_key and genai and not self._breaker.is_tripped("provider_gemini"):
            try:
                _logger.info("--> Trying Gemini fallback")
                genai.configure(api_key=self.gemini_api_key)
                model = genai.GenerativeModel(self.gemini_model_name)
                
                start_time = time.time()
                response = model.generate_content(
                    f"{system_prompt}\\n\\nUser Input:\\n{user_prompt}\\n\\nPlease respond ONLY with valid JSON.",
                    generation_config=genai.types.GenerationConfig(temperature=0.7)
                )
                
                self.call_log.append({
                    "logical_call_id": logical_call_id, "provider": "gemini", "model": self.gemini_model_name,
                    "attempt": 1, "start": start_time, "end": time.time(), "duration": time.time() - start_time,
                    "status": "SUCCESS"
                })
                self._breaker.record_success("provider_gemini")
                return self._parse_json(response.text)
                
            except Exception as e:
                err_str = str(e).lower()
                self._breaker.record_failure("provider_gemini", err_str)
                _logger.info(f"Gemini API error: {e}")
                self.call_log.append({
                    "logical_call_id": logical_call_id, "provider": "gemini", "model": self.gemini_model_name,
                    "attempt": 1, "start": start_time, "end": time.time(), "duration": time.time() - start_time,
                    "status": "ERROR"
                })
        
        if self.openrouter_api_key and not self._breaker.is_tripped("provider_openrouter"):
            try:
                _logger.info("--> Trying OpenRouter fallback")
                headers = {
                    "Authorization": f"Bearer {self.openrouter_api_key}",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "NyayaSETU"
                }
                payload = {
                    "model": "google/gemini-pro",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt + "\\n\\nPlease respond ONLY with valid JSON."}
                    ]
                }
                
                start_time = time.time()
                response = self._session.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers, json=payload, timeout=20.0
                )
                response.raise_for_status()
                text_resp = response.json()["choices"][0]["message"]["content"].strip()
                
                self.call_log.append({
                    "logical_call_id": logical_call_id, "provider": "openrouter", "model": "google/gemini-pro",
                    "attempt": 1, "start": start_time, "end": time.time(), "duration": time.time() - start_time,
                    "status": "SUCCESS"
                })
                self._breaker.record_success("provider_openrouter")
                return self._parse_json(text_resp)
                
            except _requests_module.exceptions.HTTPError as e:
                status_code = e.response.status_code if e.response is not None else 0
                self._breaker.record_failure("provider_openrouter", f"HTTP {status_code} {str(e).lower()}")
                _logger.info(f"OpenRouter API HTTP {status_code}")
            except Exception as e:
                self._breaker.record_failure("provider_openrouter", str(e).lower())
                _logger.info(f"OpenRouter API error: {e}")

        return {"error": "PROVIDER_UNAVAILABLE", "status": "FAILED", "message": "All LLM providers temporarily unavailable; audit execution paused/failed without exhausting additional providers."}"""

text = re.sub(r'    def generate_json_response\(self, system_prompt: str, user_prompt: str\) -> Dict\[str, Any\]:.*?(?=    def get_call_stats\(self\) -> Dict\[str, Any\]:)', gen_new + '\n\n', text, flags=re.DOTALL)

with open('backend/agents/llm_router.py', 'w', encoding='utf-8') as f:
    f.write(text)

print("Done")
