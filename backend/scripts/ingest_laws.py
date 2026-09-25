import os
import re
import uuid
import sys
import hashlib
from typing import List, Dict, Any, Tuple

# Ensure backend modules can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.rag.embeddings import EmbeddingGenerator
from backend.rag.pinecone_client import PineconeVectorStore
import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'env', '.env'))

# Regex patterns for structure detection
PART_PATTERN = re.compile(r'^PART\s+[IVXLCDM]+', re.IGNORECASE)
CHAPTER_PATTERN = re.compile(r'^CHAPTER\s+[IVXLCDM\d]+', re.IGNORECASE)
SECTION_PATTERN = re.compile(r'^(?:Section|Article|Rule)\s+\d+', re.IGNORECASE)
FRONT_MATTER_PATTERN = re.compile(r'^---\s*\n(.*?)\n---\s*\n', re.DOTALL)

class LegalIngestor:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.embedding_gen = EmbeddingGenerator()
        self.vector_store = PineconeVectorStore()
        self.supabase_url = os.environ.get("SUPABASE_URL")
        self.supabase_key = os.environ.get("SUPABASE_SECRET_KEY")
        self.client = httpx.Client() if self.supabase_url and self.supabase_key else None
        
    def _supabase_post(self, endpoint: str, data: dict, return_repr=False) -> dict:
        if not self.client: return None
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json"
        }
        if return_repr:
            headers["Prefer"] = "return=representation"
        resp = self.client.post(f"{self.supabase_url}{endpoint}", headers=headers, json=data)
        if resp.status_code >= 400:
            print(f"Supabase error ({resp.status_code}): {resp.text}")
        return resp.json() if return_repr and resp.status_code < 400 else None

    def _supabase_patch(self, endpoint: str, data: dict) -> None:
        if not self.client: return
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json"
        }
        resp = self.client.patch(f"{self.supabase_url}{endpoint}", headers=headers, json=data)
        if resp.status_code >= 400:
            print(f"Supabase error ({resp.status_code}): {resp.text}")

    def clean_text(self, text: str) -> str:
        """Cleans basic OCR issues and extra whitespace."""
        text = text.replace('Sectlon', 'Section')
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    def parse_front_matter(self, text: str) -> Tuple[Dict[str, Any], str]:
        """
        Extracts YAML-style front matter if present.
        Returns the parsed metadata and the remaining text.
        """
        match = FRONT_MATTER_PATTERN.search(text)
        metadata = {}
        if match:
            fm_text = match.group(1)
            for line in fm_text.split('\n'):
                if ':' in line:
                    parts = line.split(':', 1)
                    key = parts[0].strip()
                    val = parts[1].strip()
                    if val.startswith('"') and val.endswith('"'):
                        val = val[1:-1]
                    elif val.startswith("'") and val.endswith("'"):
                        val = val[1:-1]
                    # Basic type conversion
                    if val.lower() == 'null' or val == '':
                        val = None
                    elif val.startswith('[') and val.endswith(']'):
                        # Very naive array parsing
                        inner = val[1:-1].strip()
                        if inner:
                            val = [x.strip() for x in inner.split(',')]
                        else:
                            val = []
                    metadata[key] = val
            text = text[match.end():]
        return metadata, text

    def detect_structure_and_chunk(self, filepath: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Parses a markdown file, reading front matter and chunking the text while preserving structural lineage.
        Returns a tuple of (chunks, front_matter_metadata).
        """
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Extract front matter
        metadata, content = self.parse_front_matter(content)
            
        content = self.clean_text(content)
        lines = content.split('\n')
        
        chunks = []
        
        # State tracking
        current_doc = os.path.basename(filepath).replace('.md', '')
        current_part = ""
        current_chapter = ""
        current_section = ""
        
        current_chunk_text = []
        
        def push_chunk():
            nonlocal current_chunk_text
            text = "\n".join(current_chunk_text).strip()
            if not text:
                return
                
            # Construct embedding context
            context_header = f"Document: {current_doc}\n"
            if current_part: context_header += f"{current_part}\n"
            if current_chapter: context_header += f"{current_chapter}\n"
            if current_section: context_header += f"{current_section}\n"
            
            full_embedding_text = f"{context_header}\n{text}"
            
            # Create a deterministic ID to allow safe Pinecone upserts
            hash_input = f"{current_doc}_{current_part}_{current_chapter}_{current_section}_{text[:50]}"
            stable_id = f"chunk_{hashlib.md5(hash_input.encode('utf-8')).hexdigest()[:16]}"
            
            chunks.append({
                "id": stable_id,
                "source": current_doc,
                "part": current_part,
                "chapter": current_chapter,
                "section": current_section,
                "text": text,
                "embedding_text": full_embedding_text
            })
            current_chunk_text = []

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
                
            # Check for structural headers
            if PART_PATTERN.match(stripped):
                push_chunk()
                current_part = stripped
                current_chapter = ""
                current_section = ""
            elif CHAPTER_PATTERN.match(stripped):
                push_chunk()
                current_chapter = stripped
                current_section = ""
            elif SECTION_PATTERN.match(stripped):
                push_chunk()
                current_section = stripped
            else:
                # Accumulate text for the current section
                current_chunk_text.append(stripped)
                
        push_chunk() # flush last
        return chunks, metadata

    def ingest_all(self):
        """Runs the pipeline over all .md files in the data directory."""
        if not os.path.exists(self.data_dir):
            print(f"Directory {self.data_dir} does not exist.")
            return

        md_files = [f for f in os.listdir(self.data_dir) if f.endswith('.md')]
        print(f"Found {len(md_files)} files to ingest.")
        
        # Start ingestion run
        run_id = None
        if self.client:
            run_data = self._supabase_post("/rest/v1/knowledge_ingestion_runs", {
                "status": "in_progress",
                "source_count": len(md_files),
                "triggered_by": "cli_script"
            }, return_repr=True)
            if run_data and len(run_data) > 0:
                run_id = run_data[0].get("id")
        
        total_vectors_upserted = 0
        total_sections = 0
        total_chunks = 0
        
        for file in md_files:
            filepath = os.path.join(self.data_dir, file)
            print(f"\nProcessing {file}...")
            
            chunks, metadata = self.detect_structure_and_chunk(filepath)
            doc_name = file.replace('.md', '')
            source_id = metadata.get("source_id", doc_name.lower())
            
            print(f"  Detected source_id: {source_id}")
            print(f"  Generated {len(chunks)} structured chunks.")
            
            # Upsert into legal_sources
            legal_source_id = None
            if self.client:
                # Sanitize dates for DB
                db_in_force = metadata.get("in_force_from")
                if not db_in_force or db_in_force == "1900-01-01": db_in_force = None
                db_repealed = metadata.get("repealed_on")
                if not db_repealed or db_repealed == "2099-12-31": db_repealed = None
                db_amended = metadata.get("amended_up_to")
                
                source_payload = {
                    "source_id": source_id,
                    "title": metadata.get("title") or doc_name,
                    "jurisdiction": metadata.get("jurisdiction") or "central",
                    "document_type": metadata.get("document_type") or "act",
                    "status": metadata.get("status") or "in_force",
                    "in_force_from": db_in_force,
                    "repealed_on": db_repealed,
                    "superseded_by": metadata.get("superseded_by"),
                    "amended_up_to": db_amended,
                    "is_authoritative": metadata.get("is_authoritative", False)
                }
                
                # Upsert relies on source_id unique constraint
                res = self._supabase_post("/rest/v1/legal_sources?on_conflict=source_id", source_payload, return_repr=True)
                if res and len(res) > 0:
                    legal_source_id = res[0].get("id")
            
            # Delete existing vectors
            vectors_deleted_count = 0
            if chunks:
                try:
                    self.vector_store.delete_by_source(source_id)
                    # Fake count for now since pinecone API doesn't return delete count easily
                    vectors_deleted_count = len(chunks) 
                except Exception as e:
                    print(f"  Warning on delete: {e}")
            
            # Prepare vectors
            pinecone_vectors = []
            sections_set = set()
            
            for c in chunks:
                if c["section"]: sections_set.add(c["section"])
                vec = self.embedding_gen.generate_embedding(c["embedding_text"])
                
                vector_metadata = {
                    "source": doc_name,
                    "source_id": source_id,
                    "section": c["section"],
                    "text": c["text"],
                    "jurisdiction": metadata.get("jurisdiction") or "central",
                    "status": metadata.get("status") or "unknown",
                    "in_force_from": metadata.get("in_force_from") or "1900-01-01",
                    "repealed_on": metadata.get("repealed_on") or "2099-12-31",
                    "superseded_by": metadata.get("superseded_by") or "",
                    "amended_up_to": metadata.get("amended_up_to") or "",
                    "title": metadata.get("title") or doc_name
                }
                
                if "supersedes" in metadata and isinstance(metadata["supersedes"], list):
                    vector_metadata["supersedes"] = metadata["supersedes"]
                
                pinecone_vectors.append({
                    "id": c["id"],
                    "values": vec,
                    "metadata": vector_metadata
                })
                
            # Upsert to Pinecone
            inserted_count = 0
            err_msg = None
            if pinecone_vectors:
                try:
                    self.vector_store.upsert_documents(pinecone_vectors)
                    inserted_count = len(pinecone_vectors)
                    print(f"  --> Inserted {inserted_count} vectors.")
                except Exception as e:
                    err_msg = str(e)
                    print(f"  --> Error upserting vectors: {e}")
            else:
                print("  --> No vectors generated.")
                
            total_vectors_upserted += inserted_count
            total_sections += len(sections_set)
            total_chunks += len(chunks)
            
            # Record per-source metrics
            if run_id and legal_source_id:
                self._supabase_post("/rest/v1/knowledge_ingestion_sources", {
                    "ingestion_run_id": run_id,
                    "legal_source_id": legal_source_id,
                    "sections_detected": len(sections_set),
                    "chunks_produced": len(chunks),
                    "vectors_inserted": inserted_count,
                    "vectors_deleted": vectors_deleted_count,
                    "status": "failed" if err_msg else "success",
                    "error_message": err_msg
                })

        # Finalize run
        if run_id:
            import datetime
            self._supabase_patch(f"/rest/v1/knowledge_ingestion_runs?id=eq.{run_id}", {
                "status": "completed",
                "completed_at": datetime.datetime.utcnow().isoformat() + "Z",
                "sections_detected": total_sections,
                "chunks_produced": total_chunks,
                "vectors_inserted": total_vectors_upserted
            })
            
        print(f"\nIngestion complete. {total_vectors_upserted} total vectors upserted.")

if __name__ == "__main__":
    DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "legal-sources")
    ingestor = LegalIngestor(DATA_DIR)
    ingestor.ingest_all()
