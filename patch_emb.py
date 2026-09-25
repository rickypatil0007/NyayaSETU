import re

with open("backend/rag/embeddings.py", "r", encoding="utf-8") as f:
    emb_content = f.read()

emb_replacement = """    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        import time
        import random
        _logger.info(f"  [MOCK Embed] Generating {len(texts)} mocked embeddings to avoid API limits.")
        time.sleep(0.1)
        # return a random vector of 2048 dims
        return [[random.random() for _ in range(self.dimension)] for _ in texts]
"""

target2 = re.search(r'    def generate_embeddings\(self, texts: List\[str\]\) -> List\[List\[float\]\]:.*', emb_content, re.DOTALL)
if target2:
    emb_content = emb_content[:target2.start()] + emb_replacement
    with open("backend/rag/embeddings.py", "w", encoding="utf-8") as f:
        f.write(emb_content)
    print("Patched embeddings.py")
else:
    print("Could not find generate_embeddings in embeddings.py")
