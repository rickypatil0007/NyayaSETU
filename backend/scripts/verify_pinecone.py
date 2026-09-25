import os
import sys

# Ensure backend modules can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.rag.pinecone_client import PineconeVectorStore
from backend.rag.embeddings import EmbeddingGenerator

def verify():
    print("Initializing Pinecone...")
    store = PineconeVectorStore()
    
    print("\n--- Index Stats ---")
    stats = store.get_index_stats()
    print(stats)
    
    if stats.get("total_vector_count", 0) == 0:
        print("\nWARNING: Index is empty! You need to run ingest_laws.py first.")
        
    print("\nInitializing Embedding Generator...")
    gen = EmbeddingGenerator()
    
    query = "gratuity payment employee completed five years"
    print(f"\nTest Query: '{query}'")
    
    try:
        vec = gen.generate_embedding(query)
        print(f"Generated vector of dimension: {len(vec)}")
        
        if len(vec) != stats.get("dimension", 2048) and stats.get("dimension", 0) != 0:
            print(f"CRITICAL ERROR: Vector dimension ({len(vec)}) does not match Pinecone dimension ({stats.get('dimension')}).")
            
        print("\nSearching Pinecone...")
        results = store.search(vec, top_k=3, filter={"jurisdiction": "India"})
        
        print(f"Found {len(results)} matches:")
        for i, res in enumerate(results):
            score = res.get('score', 0)
            meta = res.get('metadata', {})
            print(f"  {i+1}. Score: {score:.4f} | Source: {meta.get('source')} | Section: {meta.get('section')}")
            
    except Exception as e:
        print(f"Error during verification: {e}")

if __name__ == "__main__":
    verify()
