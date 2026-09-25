import re
import os

with open("backend/agents/llm_router.py", "r", encoding="utf-8") as f:
    content = f.read()

replacement = """    def generate_json_response(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        import time
        import random
        _logger.info(f"[MOCK] Generating mocked LLM response to avoid API limits.")
        time.sleep(1.0)  # Simulate network delay

        # Depending on the prompt, return appropriate mock JSON
        if "Reviewer" in system_prompt or "Identify ALL clauses" in system_prompt:
            return {
                "findings": [
                    {
                        "exact_contract_quote": "mocked clause text",
                        "exact_law_quote": "mocked law text",
                        "issue": "Mocked compliance issue to demonstrate the UI",
                        "risk_level": "MEDIUM",
                        "confidence": 85,
                        "evidence_ids": ["E1", "E2"],
                        "reasoning_summary": "This is a mock reasoning from the reviewer."
                    }
                ]
            }
        elif "Skeptic" in system_prompt:
            return {
                "challenge": "Mocked skeptic challenge to the reviewer's finding.",
                "severity_adjustment": "DOWNGRADE",
                "reasoning": "The mock evidence doesn't strictly prohibit this."
            }
        elif "Supervisor" in system_prompt:
            return {
                "verdict": "COMPROMISE",
                "final_risk": "MEDIUM",
                "reason": "Mocked supervisor decision.",
                "human_escalation": False
            }
        else:
            return {"mock": True, "message": "Generic mock response"}
"""

# Find the start of generate_json_response and the end of the method body (the next `    def ` or EOF)
target = re.search(r'    def generate_json_response\(self, system_prompt: str, user_prompt: str\) -> Dict\[str, Any\]:.*?(?=    def )', content, re.DOTALL)
if target:
    content = content[:target.start()] + replacement + "\n" + content[target.end():]
    with open("backend/agents/llm_router.py", "w", encoding="utf-8") as f:
        f.write(content)
    print("Patched llm_router.py")
else:
    print("Could not find generate_json_response in llm_router.py")

with open("backend/rag/embeddings.py", "r", encoding="utf-8") as f:
    emb_content = f.read()

emb_replacement = """    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        import time
        import random
        print(f"[MOCK] Generating {len(texts)} mocked embeddings to avoid API limits.")
        time.sleep(0.5)
        # return a random vector of 1024 dims
        return [[random.random() for _ in range(1024)] for _ in texts]
"""

target2 = re.search(r'    def generate_embeddings\(self, texts: List\[str\]\) -> List\[List\[float\]\]:.*?(?=    def )', emb_content, re.DOTALL)
if target2:
    emb_content = emb_content[:target2.start()] + emb_replacement + "\n" + emb_content[target2.end():]
    with open("backend/rag/embeddings.py", "w", encoding="utf-8") as f:
        f.write(emb_content)
    print("Patched embeddings.py")
else:
    print("Could not find generate_embeddings in embeddings.py")
