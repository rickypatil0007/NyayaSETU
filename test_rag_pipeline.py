import time
import os
from dotenv import load_dotenv

# Load env
load_dotenv('env/.env')

print("=== Starting RAG Diagnostic Test ===")
start_time = time.time()

# 1. Test LLM Router (Chat)
print("\n1. Testing LLM Router (NVIDIA API)...")
try:
    from backend.agents.llm_router import LLMRouter
    router = LLMRouter()
    result = router.generate_json_response(
        system_prompt="You are a legal concept extractor.",
        user_prompt="Extract concepts from: 'The contractor shall deliver by Friday.' Return as {'concepts': ['...']}"
    )
    print("LLM Result:", result)
except Exception as e:
    print("LLM Error:", str(e))

# 2. Test Embedding
print("\n2. Testing NVIDIA Embedding API...")
try:
    from backend.rag.embeddings import EmbeddingGenerator
    embedder = EmbeddingGenerator()
    vec = embedder.generate_embedding("Contractor shall deliver by Friday.")
    print(f"Embedding success. Dimension: {len(vec)}")
except Exception as e:
    print("Embedding Error:", str(e))
    vec = None

# 3. Test Pinecone DB
print("\n3. Testing Pinecone Database...")
if vec:
    try:
        from pinecone import Pinecone
        pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
        index = pc.Index(os.environ.get("PINECONE_INDEX_NAME"), host=os.environ.get("PINECONE_INDEX_HOST"))
        
        # Try inserting a dummy vector
        print(f"Upserting test vector into {os.environ.get('PINECONE_INDEX_HOST')}...")
        index.upsert(vectors=[
            {"id": "test_vec_1", "values": vec, "metadata": {"text": "Contractor shall deliver by Friday."}}
        ])
        
        # Try querying it
        time.sleep(2) # Give pinecone a moment to index
        print("Querying test vector...")
        query_res = index.query(vector=vec, top_k=1, include_metadata=True)
        print("Pinecone Query Result Matches:", len(query_res['matches']))
        if len(query_res['matches']) > 0:
             print("Top Match Metadata:", query_res['matches'][0]['metadata'])
    except Exception as e:
        print(f"Pinecone Error: {e}")
else:
    print("Skipping Pinecone test because embedding failed.")

elapsed = time.time() - start_time
print(f"\n=== Test Completed in {elapsed:.1f} seconds ===")
