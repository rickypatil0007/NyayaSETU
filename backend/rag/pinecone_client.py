import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load env variables from env/.env
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "env", ".env"))

try:
    from pinecone import Pinecone, ServerlessSpec
except ImportError:
    print("Please install pinecone-client: pip install pinecone-client")

class PineconeVectorStore:
    def __init__(self, index_name: str = None, dimension: int = None):
        """
        Initializes the Pinecone client.
        Expects PINECONE_API_KEY environment variable.
        Uses the Starter (free) tier.
        """
        self.api_key = os.environ.get("PINECONE_API_KEY")
        if not index_name:
            index_name = os.environ.get("PINECONE_INDEX_NAME", "nyayasetu-legal-index")
        if not dimension:
            dimension = int(os.environ.get("EMBEDDING_DIMENSION", 384))
        if not self.api_key:
            print("WARNING: PINECONE_API_KEY environment variable not set.")
            
        self.index_name = index_name
        self.dimension = dimension
        self.pc = None
        self.index = None
        
        if self.api_key:
            try:
                self.pc = Pinecone(api_key=self.api_key)
                self._ensure_index_exists()
                self.index = self.pc.Index(self.index_name)
            except Exception as e:
                print(f"Failed to initialize Pinecone: {e}")

    def _ensure_index_exists(self):
        """Creates the index if it doesn't exist. Uses free tier settings (aws/us-east-1)."""
        if not self.pc:
            return
            
        # existing_indexes = [idx.name for idx in self.pc.list_indexes()]
        # if self.index_name not in existing_indexes:
        #     print(f"Index '{self.index_name}' not found. Creating it (this can take a few minutes)...")
        #     # Create serverless index suitable for free tier
        #     self.pc.create_index(
        #         name=self.index_name,
        #         dimension=self.dimension,
        #         metric="cosine",
        #         spec=ServerlessSpec(
        #             cloud="aws",
        #             region="us-east-1"
        #         )
        #     )
        #     print(f"Index '{self.index_name}' created successfully.")
        # else:
        #     print(f"Index '{self.index_name}' already exists.")

    def upsert_documents(self, chunks: List[Dict[str, Any]]):
        """
        Upserts document chunks into Pinecone.
        Format of chunks:
        [
            {"id": "doc1_chunk1", "values": [0.1, 0.2, ...], "metadata": {"source": "DPDP Act", "text": "..."}}
        ]
        """
        if not self.index:
            raise RuntimeError("Pinecone index not initialized. Check your API key.")
            
        # Upsert in batches of 100
        batch_size = 100
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            self.index.upsert(vectors=batch)
            print(f"Upserted batch {i//batch_size + 1} ({len(batch)} vectors)")
            
    def delete_by_source(self, source_id: str):
        """
        Deletes all vectors belonging to a specific source_id using metadata filtering.
        """
        if not self.index:
            raise RuntimeError("Pinecone index not initialized. Check your API key.")
        
        # Note: Serverless pinecone indexes support delete by metadata filter
        try:
            # We filter by source to delete the old documents before re-inserting
            self.index.delete(filter={"source_id": {"$eq": source_id}})
            print(f"Deleted existing vectors for source_id: {source_id}")
        except Exception as e:
            print(f"Warning: Failed to delete existing vectors for {source_id}. Error: {e}")
            
    def search(self, query_vector: List[float], top_k: int = 5, filter: Optional[Dict] = None) -> List[Dict]:
        """
        Searches for the most similar vectors to the query_vector.
        Returns the top_k matches with their metadata.
        """
        if not self.index:
            raise RuntimeError("Pinecone index not initialized. Check your API key.")
            
        results = self.index.query(
            vector=query_vector,
            top_k=top_k,
            include_metadata=True,
            filter=filter
        )
        
        # Format the output for easy consumption
        matches = []
        for match in results.get("matches", []):
            matches.append({
                "id": match.get("id"),
                "score": match.get("score"),
                "metadata": match.get("metadata", {})
            })
            
        return matches

    def get_index_stats(self) -> Dict:
        """Returns index statistics including total vector count."""
        if not self.index:
            return {"error": "Pinecone index not initialized"}
        try:
            stats = self.index.describe_index_stats()
            return {
                "total_vector_count": stats.get("total_vector_count", 0),
                "dimension": stats.get("dimension", 0),
                "namespaces": stats.get("namespaces", {})
            }
        except Exception as e:
            return {"error": str(e)}

if __name__ == "__main__":
    # Test initialization (will just print warning if no key is set)
    store = PineconeVectorStore()
    print("Pinecone test script complete.")
