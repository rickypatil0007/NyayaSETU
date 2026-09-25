import re

with open("backend/pipeline/audit_orchestrator.py", "r", encoding="utf-8") as f:
    content = f.read()

new_func = """
    async def retrieve_legal_evidence(self, clause_text: str, doc_context: dict, audit_date: str) -> list:
        import asyncio
        router = self.shared_router
        jurisdiction = doc_context.get("jurisdiction", "India")
        doc_type = doc_context.get("document_type", "Contract")
        
        # 1. Extract Issues
        issue_prompt = f"Analyze this contract clause and extract the core legal issues it governs (e.g. 'gratuity', 'termination benefits', 'data protection').\\nClause: {clause_text}\\nRespond in JSON format: {{'legal_issues': ['issue 1', 'issue 2']}}"
        
        try:
            issue_data = await asyncio.wait_for(
                asyncio.to_thread(router.generate_json_response, "You are a legal concept extractor.", issue_prompt),
                timeout=45.0
            )
            legal_issues = issue_data.get("legal_issues", [])
        except Exception as e:
            _logger.warning(f"Issue extraction timed out or failed: {e}")
            legal_issues = []
            
        search_query = ", ".join(legal_issues) + f" (Context: {clause_text[:100]})" if legal_issues else clause_text
        
        # 2. Embedding
        try:
            query_vector = await asyncio.wait_for(
                asyncio.to_thread(self.embedding_generator.generate_embedding, search_query),
                timeout=30.0
            )
        except Exception as e:
            _logger.error(f"Embedding generation failed: {e}")
            return []
            
        pinecone_filter = {"jurisdiction": jurisdiction}
        
        # 3. Pinecone Search
        try:
            evidence_raw = await asyncio.wait_for(
                asyncio.to_thread(self.vector_store.search, query_vector, 8, pinecone_filter),
                timeout=30.0
            )
        except Exception as e:
            _logger.error(f"Pinecone search failed: {e}")
            return []
            
        # 4. Temporal Filter & Relevance Gate
        evidence = []
        
        async def check_relevance(e):
            meta = e.get("metadata", {})
            eff_from = str(meta.get("effective_from", "1900-01-01"))
            eff_to = str(meta.get("effective_to", "2099-12-31"))
            
            if audit_date < eff_from or audit_date > eff_to or meta.get("status") == "SUPERSEDED":
                return None
                
            prompt = f"Why does this legal text apply to this specific {doc_type} governed by {jurisdiction}? Does it explicitly regulate, prohibit, or require something directly applicable to this contract clause?\\n\\nClause: {clause_text}\\n\\nLegal Text ({meta.get('source')}): {meta.get('text')}\\n\\nRespond with JSON: {{'relevance': 'YES', 'reason': '...'}} or {{'relevance': 'NO', 'reason': '...'}}"
            try:
                relevance_data = await asyncio.wait_for(
                    asyncio.to_thread(router.generate_json_response, "You are a strict legal relevance gatekeeper. Reject generic or tangentially related sources.", prompt),
                    timeout=45.0
                )
                relevance = relevance_data.get("relevance", "YES") if isinstance(relevance_data, dict) else "YES"
                if "YES" in str(relevance).upper():
                    return e
            except Exception as ex:
                _logger.warning(f"Relevance check timed out or failed for {meta.get('source')}: {ex}")
            return None

        tasks = [check_relevance(e) for e in evidence_raw]
        results = await asyncio.gather(*tasks)
        for res in results:
            if res:
                evidence.append(res)
                
        return evidence[:3]
"""

# Insert the function before process_clause
content = content.replace("    def process_clause(", new_func + "\n    def process_clause(")

with open("backend/pipeline/audit_orchestrator.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Injected retrieve_legal_evidence")
