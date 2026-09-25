import sys
import os
sys.path.append(os.path.abspath('.'))
from backend.rag.pinecone_client import PineconeVectorStore
store = PineconeVectorStore()
res = store.search([0.0]*384, top_k=5)
print(res)
