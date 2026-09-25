import os
import io
import sys
import json
import time
import threading
import logging
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

# Load env variables from env/.env
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "env", ".env"), override=True)

try:
    import google.generativeai as genai
except ImportError:
    genai = None
    print("Please install google-generativeai: pip install google-generativeai")

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None
    print("Please install openai: pip install openai")

# ---------------------------------------------------------------------------
# Module-level logger that writes UTF-8 regardless of the Windows console
# codepage.  All LLM router diagnostics go through this logger instead of
# bare print() calls, which crash on cp1252 when the model returns em-dashes,
# curly quotes, or Indic script.
# ---------------------------------------------------------------------------
_logger = logging.getLogger("nyayasetu.llm_router")
if not _logger.handlers:
    _handler = logging.StreamHandler(
        stream=io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="backslashreplace")
    )
    _handler.setFormatter(logging.Formatter("%(message)s"))
    _logger.addHandler(_handler)
    _logger.setLevel(logging.INFO)


class _KeyHealthTracker:
    """
    Tracks per-key health WITHOUT permanently blocking keys across calls.
    
    Unlike the old circuit breaker, this tracker:
    - Never permanently blocks a key (429/timeout are temporary)
    - Only permanently blocks on auth errors (401/403)
    - Resets transient failure counts between audit calls
    - Tracks which key succeeded last so we try it first next time
    """
    def __init__(self):
        self._permanent_dead: Dict[str, bool] = {}  # Only for 401/403 auth failures
        self._last_success: Optional[str] = None     # Last key that worked
        self._lock = threading.Lock()

    def mark_auth_dead(self, key_name: str) -> None:
        """Permanently disable a key that has an authentication/authorization error."""
        with self._lock:
            self._permanent_dead[key_name] = True
            _logger.info(f"    [HEALTH] {key_name} permanently disabled (auth failure)")

    def mark_success(self, key_name: str) -> None:
        """Record that this key just worked."""
        with self._lock:
            self._last_success = key_name

    def is_permanently_dead(self, key_name: str) -> bool:
        with self._lock:
            return self._permanent_dead.get(key_name, False)

    def get_preferred_key(self) -> Optional[str]:
        with self._lock:
            return self._last_success


class LLMRouter:
    """
    Routes LLM requests across multiple NVIDIA API keys, Gemini, and OpenRouter.

    Key design principles (v3 — resilient rotation):
      • Every generate_json_response() call tries ALL non-dead keys fresh.
        Transient failures (timeout, 429, 503) do NOT poison future calls.
      • Only 401/403 auth errors permanently disable a key.
      • 429 rate limits trigger a short backoff + retry on the SAME key before
        moving to the next key.
      • The last-successful key is tried first for locality.
      • Per-key retries: up to 3 attempts with exponential backoff.
      • Global call deadline prevents infinite loops.
    """

    # Timeouts
    CONNECT_TIMEOUT = float(os.environ.get("NVIDIA_CONNECT_TIMEOUT", "10.0"))
    READ_TIMEOUT = float(os.environ.get("NVIDIA_READ_TIMEOUT", "60.0"))
    LOGICAL_CALL_DEADLINE_SECONDS = float(os.environ.get("LLM_CALL_DEADLINE", "420.0"))

    # Retry config
    MAX_RETRIES_PER_KEY = 1
    BACKOFF_BASE_SECONDS = 1.0  # 1s

    def __init__(self):
        # NVIDIA setup — use ALL available keys
        self.nvidia_configs: List[Dict[str, str]] = []

        key_model_map = [
            ("NVIDIA_NEMOTRON_3_SUPER_120B_API_KEY", "nvidia/nemotron-3-super-120b-a12b"),
            ("NVIDIA_NEMOTRON_3_ULTRA_550B_API_KEY", "nvidia/nemotron-3-ultra-550b-a55b"),
            ("NVIDIA_GPT_OSS_20B_API_KEY", "openai/gpt-oss-20b"),
            ("NVIDIA_GLM_5_3_FLASH_API_KEY", "google/gemma-4-31b-it"),
            ("NVIDIA_KIMI_K3_API_KEY", "meta/llama-3.2-90b-vision-instruct"),
            ("NVIDIA_NEMOTRON_3_5_LIGHTNING_30B_API_KEY", "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning"),
        ]

        for var, model in key_model_map:
            val = os.environ.get(var)
            if val:
                self.nvidia_configs.append({
                    "provider": "nvidia",
                    "key_name": var,
                    "api_key": val,
                    "model_name": model
                })

        # Gemini setup (Fallback)
        self.gemini_api_key = os.environ.get("GEMINI_API_KEY")
        self.gemini_model_name = "models/gemini-3.5-flash"

        # OpenRouter setup (Fallback)
        self.openrouter_api_key = os.environ.get("OPENROUTER_API_KEY")

        # Health tracker (survives across calls but only blocks auth-dead keys)
        self._health = _KeyHealthTracker()

        # Call instrumentation log
        self.call_log: list = []

        import requests
        self._session = requests.Session()

        _logger.info(f"LLMRouter initialized with {len(self.nvidia_configs)} NVIDIA keys, "
                     f"Gemini={'yes' if self.gemini_api_key else 'no'}, "
                     f"OpenRouter={'yes' if self.openrouter_api_key else 'no'}")

    def generate_json_response(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        import requests as _requests_module

        call_start = time.monotonic()
        deadline = call_start + self.LOGICAL_CALL_DEADLINE_SECONDS
        logical_call_id = f"llm-{id(self)}-{int(time.monotonic()*1000)}"

        errors_collected = []

        # ---- ORDER NVIDIA KEYS: preferred key first ----
        preferred = self._health.get_preferred_key()
        nvidia_candidates = [c for c in self.nvidia_configs if not self._health.is_permanently_dead(c["key_name"])]

        if preferred:
            # Move preferred to front
            nvidia_candidates.sort(key=lambda c: 0 if c["key_name"] == preferred else 1)

        _logger.info(f"[{logical_call_id}] Starting LLM call. {len(nvidia_candidates)} NVIDIA keys available.")

        # ================================================================
        # 1. GEMINI (PRIORITIZED DUE TO OUTAGE)
        # ================================================================
        if self.gemini_api_key and genai:
            for attempt in range(2):
                if time.monotonic() > deadline:
                    break
                try:
                    _logger.info(f"  --> Trying Gemini (attempt {attempt+1}/2)")
                    genai.configure(api_key=self.gemini_api_key)
                    model = genai.GenerativeModel(self.gemini_model_name)
                    prompt = f"System: {system_prompt}\n\nUser: {user_prompt}\n\nPlease respond ONLY with a raw, valid JSON object."
                    
                    start_t = time.time()
                    resp = model.generate_content(prompt)
                    duration = time.time() - start_t
                    
                    _logger.info(f"    SUCCESS via Gemini in {duration:.1f}s")
                    return self._parse_json(resp.text)
                except Exception as e:
                    errors_collected.append(f"Gemini: {e}")
                    if "429" in str(e) and attempt < 1:
                        wait = 5.0
                        _logger.info(f"    Gemini rate limited. Waiting {wait:.0f}s...")
                        time.sleep(min(wait, max(1.0, deadline - time.monotonic())))
                    else:
                        break

        # ================================================================
        # 2. TRY EVERY NVIDIA KEY (FALLBACK)
        # ================================================================
        invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"

        for config in nvidia_candidates:
            key_name = config["key_name"]
            api_key = config["api_key"]
            model_name = config["model_name"]

            for attempt in range(self.MAX_RETRIES_PER_KEY):
                if time.monotonic() > deadline:
                    _logger.info(f"    Global deadline reached. Stopping NVIDIA attempts.")
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
                    _logger.info(f"  --> Trying NVIDIA {key_name} (attempt {attempt+1}/{self.MAX_RETRIES_PER_KEY})")

                    headers = {
                        "Authorization": f"Bearer {api_key}",
                        "Accept": "application/json"
                    }
                    payload = {
                        "model": model_name,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt + "\n\nPlease respond ONLY with a raw, valid JSON object (no markdown, no backticks, just the {})."}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 4096,
                        "stream": False
                    }

                    effective_read = min(self.READ_TIMEOUT, max(5.0, deadline - time.monotonic()))
                    response = self._session.post(
                        invoke_url, headers=headers, json=payload,
                        timeout=(self.CONNECT_TIMEOUT, effective_read)
                    )

                    response.raise_for_status()
                    data = response.json()
                    text_resp = data["choices"][0]["message"]["content"].strip()

                    # SUCCESS
                    duration = time.time() - attempt_record["start"]
                    attempt_record.update({"end": time.time(), "duration": duration, "status": "SUCCESS"})
                    self.call_log.append(attempt_record)
                    self._health.mark_success(key_name)
                    _logger.info(f"    SUCCESS via {key_name} in {duration:.1f}s")

                    return self._parse_json(text_resp)

                except _requests_module.exceptions.Timeout:
                    duration = time.time() - attempt_record["start"]
                    attempt_record.update({"end": time.time(), "duration": duration, "status": "TIMEOUT"})
                    self.call_log.append(attempt_record)
                    errors_collected.append(f"{key_name}: timeout (attempt {attempt+1})")
                    _logger.info(f"    TIMEOUT on {key_name} after {duration:.1f}s")

                    # Backoff before retry on same key
                    if attempt < self.MAX_RETRIES_PER_KEY - 1:
                        wait = self.BACKOFF_BASE_SECONDS * (2 ** attempt)
                        _logger.info(f"    Backing off {wait:.0f}s before retry...")
                        time.sleep(min(wait, max(1.0, deadline - time.monotonic())))
                    continue

                except _requests_module.exceptions.HTTPError as e:
                    status_code = e.response.status_code if e.response is not None else 0
                    duration = time.time() - attempt_record["start"]
                    attempt_record.update({"end": time.time(), "duration": duration, "status": f"HTTP_{status_code}"})
                    self.call_log.append(attempt_record)
                    errors_collected.append(f"{key_name}: HTTP {status_code} (attempt {attempt+1})")

                    if status_code in (401, 403):
                        # Auth failure — permanently disable this key
                        self._health.mark_auth_dead(key_name)
                        _logger.info(f"    AUTH FAILURE {status_code} on {key_name} — key permanently disabled")
                        break  # Don't retry this key
                    elif status_code == 429:
                        if attempt < self.MAX_RETRIES_PER_KEY - 1:
                            wait = self.BACKOFF_BASE_SECONDS * (2 ** attempt)
                            time.sleep(min(wait, max(1.0, deadline - time.monotonic())))
                        continue
                    elif status_code in (500, 502, 503, 504):
                        _logger.info(f"    SERVER ERROR {status_code} on {key_name}")
                        if attempt < self.MAX_RETRIES_PER_KEY - 1:
                            wait = self.BACKOFF_BASE_SECONDS * (2 ** attempt)
                            _logger.info(f"    Backing off {wait:.0f}s before retry on same key...")
                            time.sleep(min(wait, max(1.0, deadline - time.monotonic())))
                            continue
                        else:
                            _logger.info(f"    Max retries on {key_name} — trying next key")
                            break
                except Exception as e:
                    errors_collected.append(f"{key_name}: {e}")
                    break

        # ================================================================
        # 3. OPENROUTER FALLBACK
        # ================================================================
        if self.openrouter_api_key and OpenAI:
            # Try multiple models in case one is unavailable on OpenRouter
            openrouter_models = [
                "google/gemini-2.5-flash",
                "meta-llama/llama-4-maverick",
                "anthropic/claude-3.5-haiku",
                "google/gemma-3-27b-it",
            ]
            for or_model in openrouter_models:
                if time.monotonic() > deadline:
                    break
                try:
                    _logger.info(f"  --> Trying OpenRouter {or_model}")
                    client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=self.openrouter_api_key)
                    start_t = time.time()
                    completion = client.chat.completions.create(
                        model=or_model,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt + "\n\nPlease respond ONLY with a raw, valid JSON object."}
                        ]
                    )
                    duration = time.time() - start_t
                    _logger.info(f"    SUCCESS via OpenRouter ({or_model}) in {duration:.1f}s")
                    return self._parse_json(completion.choices[0].message.content)
                except Exception as e:
                    errors_collected.append(f"OpenRouter({or_model}): {e}")
                    _logger.info(f"    OpenRouter {or_model} failed: {e}")
                    continue  # Try next model

        _logger.error(f"  ALL PROVIDERS EXHAUSTED after {len(self.call_log)} total attempts.")
        _logger.error(f"  Errors: {'; '.join(errors_collected[-5:])}")
        raise RuntimeError("All LLM providers exhausted or timed out.")

    def get_call_stats(self) -> Dict[str, Any]:
        """Returns aggregate statistics from the call instrumentation log."""
        total = len(self.call_log)
        successes = sum(1 for c in self.call_log if c.get("status") == "SUCCESS")
        failures = total - successes
        timeouts = sum(1 for c in self.call_log if "TIMEOUT" in c.get("status", ""))
        provider_counts: Dict[str, int] = {}
        for c in self.call_log:
            p = c.get("provider", "unknown")
            provider_counts[p] = provider_counts.get(p, 0) + 1
        return {
            "total_attempts": total,
            "successful_attempts": successes,
            "failed_attempts": failures,
            "timeouts": timeouts,
            "provider_breakdown": provider_counts,
        }

    def _parse_json(self, text: str) -> Dict[str, Any]:
        """Cleans and parses the text into a JSON object.  Lossless Unicode."""
        import ast
        try:
            if text.startswith("```json"):
                text = text[7:-3]
            elif text.startswith("```"):
                text = text[3:-3]
            return json.loads(text.strip())
        except json.JSONDecodeError as e:
            try:
                # Attempt to parse python-style dictionary representation (single quotes)
                result = ast.literal_eval(text.strip())
                if isinstance(result, dict):
                    return result
                raise ValueError("Parsed result is not a dictionary")
            except Exception:
                # Log safely - repr() is always ASCII-safe and lossless
                _logger.info(f"JSON Parse Error: {e}\nRaw text: {text!r}")
                raise ValueError("Failed to parse JSON")

if __name__ == "__main__":
    router = LLMRouter()
    print("LLMRouter initialized.")
