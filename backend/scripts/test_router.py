import os
import sys
import asyncio

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from backend.agents.llm_router import LLMRouter

async def test_router():
    print("Initializing LLM Router...")
    router = LLMRouter()
    
    print(f"Loaded {len(router.nvidia_configs)} NVIDIA keys.")
    
    system_prompt = "You are a helpful assistant."
    user_prompt = "Say 'The LLM Router is successfully connected to the NVIDIA API!' in exactly those words, then provide a valid JSON object like {'status': 'success'}."
    
    print("\nSending test prompt to router...")
    try:
        response = router.generate_json_response(system_prompt, user_prompt)
        print("\nRouter Response:")
        print(response)
        
        print("\nCall Stats:")
        print(router.get_call_stats())
    except Exception as e:
        print(f"\nError: {e}")

if __name__ == "__main__":
    asyncio.run(test_router())
