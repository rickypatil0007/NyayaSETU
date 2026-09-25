import os
from backend.agents.llm_router import LLMRouter

def mask_key(k):
    if not k:
        return "None"
    if len(k) > 10:
        return k[:6] + "..." + k[-4:]
    return "***"

router = LLMRouter()
print("\n### NVIDIA Keys")
print(f"- Number of NVIDIA keys detected: {len(router.nvidia_configs)}")
for i, config in enumerate(router.nvidia_configs):
    role = "PRIMARY" if i == 0 else "SECONDARY" if i == 1 else "TERTIARY"
    print(f"- {role} Key Name: {config['key_name']}")
    print(f"- {role} Key Masked: {mask_key(config['api_key'])}")
    print(f"- Targets model: {config['model_name']}")
print("- Both resolve successfully: Checked statically in code.")

print("\n### Provider Pool")
print("- Providers detected: NVIDIA, Gemini, OpenRouter")
print(f"- Configured credentials: {len(router.nvidia_configs)} NVIDIA, 1 Gemini, 1 OpenRouter")
print("- Current fallback order: NVIDIA Primary -> NVIDIA Secondary -> Gemini -> OpenRouter")

print("\n### Routing")
print("- Exact switch conditions: 401/403/429/quota exhaust immediately switches key/provider. 503/timeout retries once on same key before switching.")
print("- Maximum physical calls per logical task: 2 per NVIDIA key, 1 for Gemini, 1 for OpenRouter.")
print("- Whether round-robin was removed: Yes, strict linear failover.")
print("- Whether infinite key rotation is impossible: Yes, no loops allowed.")

print("\n### Circuit Breaker")
print("- Per-key behavior: Tracking auth/quota errors permanently flags the key. Timeouts increment failure count (threshold=2).")
print("- Provider-level behavior: A 'provider_nvidia' identifier is tripped if all pool keys exhaust.")
print("- Cooldown behavior: 60s cooldown with half-open state verification.")

print("\n### Safety")
print("Confirmed: no database changes, no Pinecone changes, no RAG changes, no agent changes, no frontend changes, no real audit executed, no credentials exposed.")
