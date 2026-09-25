import os
import io
import sys
import json
import uuid
import logging
from typing import Dict, Any, List

from backend.rag.embeddings import EmbeddingGenerator
from backend.rag.pinecone_client import PineconeVectorStore
from backend.agents.reviewer import ReviewerAgent
from backend.agents.skeptic import SkepticAgent
from backend.agents.supervisor import SupervisorAgent
from backend.pipeline.scoring import BaselineScoreCalculator
from backend.pipeline.report_generator import ReportGenerator

# UTF-8 logger — safe on Windows regardless of console codepage
_logger = logging.getLogger("nyayasetu.orchestrator")
if not _logger.handlers:
    _handler = logging.StreamHandler(
        stream=io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    )
    _handler.setFormatter(logging.Formatter("%(message)s"))
    _logger.addHandler(_handler)
    _logger.setLevel(logging.INFO)

class AuditOrchestrator:
    def __init__(self):
        """
        Initializes the entire multi-agent RAG pipeline with Multi-Round Debate.
        """
        print("Initializing Audit Orchestrator...")
        self.embedding_generator = EmbeddingGenerator()
        self.vector_store = PineconeVectorStore()
        
        from backend.agents.llm_router import LLMRouter
        self.shared_router = LLMRouter()
        
        from backend.agents.classifier import DocumentClassifierAgent
        
        self.reviewer = ReviewerAgent(client=self.shared_router)
        self.skeptic = SkepticAgent(client=self.shared_router)
        self.supervisor = SupervisorAgent(client=self.shared_router)
        self.classifier = DocumentClassifierAgent(client=self.shared_router)


    async def retrieve_legal_evidence_for_document(self, document_text: str, doc_context: dict, audit_date: str) -> list:
        import asyncio
        import os
        import json
        
        router = self.shared_router
        jurisdiction = doc_context.get("jurisdiction", "India")
        
        # --- STALE CITATION DETECTION ---
        stale_warnings = []
        stale_successors = []
        crosswalk_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "rag", "repeal_replacement_crosswalk.json")
        try:
            if os.path.exists(crosswalk_path):
                with open(crosswalk_path, "r", encoding="utf-8") as f:
                    crosswalk = json.load(f).get("repeals", [])
                    
                doc_lower = document_text.lower()
                for item in crosswalk:
                    orig = item.get("original_name", "")
                    if orig and orig.lower() in doc_lower:
                        successor = item.get("superseded_by")
                        successor_id = item.get("superseded_by_source_id")
                        msg = f"WARNING: Contract cites repealed/superseded law '{orig}'. The current authoritative framework is '{successor}'."
                        stale_warnings.append(msg)
                        if successor_id:
                            stale_successors.append(successor_id)
        except Exception as e:
            _logger.warning(f"Failed to process repeal crosswalk: {e}")
        
        # 1. Extract Issues
        # We extract top 5 broad issues from the document
        issue_prompt = f"Analyze this legal document and extract the top 5 core legal themes/issues it governs.\nDocument excerpt:\n{document_text[:4000]}\nRespond in JSON format: {{'legal_issues': ['issue 1', 'issue 2']}}"
        
        try:
            issue_data = await asyncio.wait_for(
                asyncio.to_thread(router.generate_json_response, "You are a legal concept extractor.", issue_prompt),
                timeout=300.0
            )
            legal_issues = issue_data.get("legal_issues", [])
        except Exception as e:
            _logger.warning(f"Issue extraction timed out or failed: {e}. Falling back to keywords.")
            # Fallback to basic keyword extraction if LLM fails
            keywords = ["gratuity", "termination", "leave", "intellectual property", "confidentiality", "compensation", "wages", "liability", "dispute"]
            legal_issues = [kw for kw in keywords if kw.lower() in document_text.lower()]
            if not legal_issues:
                legal_issues = ["Legal compliance rules for contracts"]
            
        search_query = ", ".join(legal_issues) if legal_issues else "Legal compliance rules for contracts"
        
        # Add successor names to query if a stale citation was found
        if stale_successors:
            search_query += " " + " ".join(stale_successors)
        
        # 2. Embedding
        try:
            query_vectors = await asyncio.wait_for(
                asyncio.to_thread(self.embedding_generator.generate_embeddings, [search_query]),
                timeout=30.0
            )
            query_vector = query_vectors[0]
        except Exception as e:
            _logger.error(f"Embedding generation failed: {e}")
            return []
            
        # --- STATUS-AWARE RETRIEVAL ---
        # Default behavior: prefer in_force or partially_in_force, exclude repealed unless explicitly asked
        # Since Pinecone's free tier has limited filtering sometimes, we do basic filtering and strict post-filtering
        pinecone_filter = {"jurisdiction": jurisdiction}
        
        # 3. Pinecone Search
        try:
            evidence_raw = await asyncio.wait_for(
                asyncio.to_thread(self.vector_store.search, query_vector, 25, pinecone_filter),
                timeout=30.0
            )
        except Exception as e:
            _logger.error(f"Pinecone search failed: {e}")
            return []
            
        # --- HYBRID LEGAL RETRIEVAL (PSEUDO-HYBRID RE-RANKING) ---
        def calculate_hybrid_score(doc, issues):
            score = doc.get("score", 0.0)
            meta = doc.get("metadata", {})
            text = meta.get("text", "").lower()
            source = meta.get("source", "").lower()
            status = meta.get("status", "unknown").lower()
            
            keyword_bonus = 0.0
            for issue in issues:
                issue_lower = issue.lower()
                if issue_lower in source:
                    keyword_bonus += 0.5
                if issue_lower in text:
                    keyword_bonus += 0.2
                    
            # Heavily penalize repealed law unless it's the exact successor we wanted
            if status == "repealed" or status == "archived":
                keyword_bonus -= 1.0 # Demote but don't entirely destroy if it's an exact historical match
            elif status == "in_force":
                keyword_bonus += 0.3 # Boost current law
                
            return score + keyword_bonus
            
        evidence_raw.sort(key=lambda x: calculate_hybrid_score(x, legal_issues), reverse=True)
        evidence_raw = evidence_raw[:15] # Broader context for whole document
        
        # 4. Temporal Filter & Status Gate
        evidence = []
        for e in evidence_raw:
            meta = e.get("metadata", {})
            
            raw_eff_from = meta.get("in_force_from") or meta.get("effective_from")
            if not raw_eff_from or str(raw_eff_from).lower() == "none" or str(raw_eff_from).lower() == "null":
                eff_from = "1900-01-01"
            else:
                eff_from = str(raw_eff_from)
                
            raw_eff_to = meta.get("repealed_on") or meta.get("effective_to")
            if not raw_eff_to or str(raw_eff_to).lower() == "none" or str(raw_eff_to).lower() == "null":
                eff_to = "2099-12-31"
            else:
                eff_to = str(raw_eff_to)
                
            status = str(meta.get("status", "unknown")).lower()
            
            if e.get("score", 0) < 0.2:
                continue
                
            # Date filter (if audit date is strictly outside the bounds)
            if audit_date < eff_from:
                continue
            # If the law was repealed BEFORE the audit date, and the query isn't explicitly historical
            if audit_date > eff_to:
                continue
                
            evidence.append(e)
            
        # Sort final evidence by score
        evidence = sorted(evidence, key=lambda x: x.get("score", 0), reverse=True)[:6]
        
        # Inject stale warnings as synthetic evidence if present
        for warning in stale_warnings:
            evidence.insert(0, {
                "id": f"synthetic_stale_{uuid.uuid4().hex[:8]}",
                "score": 1.0,
                "metadata": {
                    "source": "NyayaSETU Compliance Engine",
                    "status": "system_alert",
                    "text": warning,
                    "section": "Stale Law Reference Detection"
                }
            })
                
        return evidence[:7]

    async def process_full_document_stream(self, document_text: str, doc_context: Dict[str, Any] = None, document_id: str = None, document_hash: str = None):
        """
        Async generator that streams the multi-agent debate process via Server-Sent Events (SSE)
        for the ENTIRE document in a single cycle.
        """
        import asyncio
        doc_context = doc_context or {}
        audit_date = doc_context.get("effective_date", "2026-09-16")
        
        # 1. Retrieval
        yield "event: state\ndata: RETRIEVING_EVIDENCE\n\n"
        await asyncio.sleep(0.1) 
        
        try:
            evidence = await self.retrieve_legal_evidence_for_document(document_text, doc_context, audit_date)
        except Exception as e:
            _logger.error(f"Retrieval failed critically: {e}")
            evidence = []
            
        yield "event: state\ndata: FILTERING_RELEVANCE\n\n"
        await asyncio.sleep(0.1)
        
        debate_history = []
        
        reviewer_findings = []
        skeptic_challenges = []
        reviewer_rebuttals = []
        skeptic_rebuttals = []
        reviewer_closings = []
        skeptic_closings = []
        resolutions = []
        
        try:
            # ================= ROUND 1: OPENING =================
            yield "event: state\ndata: REVIEWER_THINKING\n\n"
            await asyncio.sleep(0.1)
        
            provenance_data = {
                "audit_date": audit_date
            }
            reviewer_response = await asyncio.to_thread(self.reviewer.review_document, document_text, evidence, provenance_data)
        
            if "error" in reviewer_response:
                yield f"event: agent_error\ndata: {reviewer_response['error']}\n\n"
                reviewer_response = {
                    "findings": [
                        {
                            "finding_id": "fallback-001",
                            "exact_contract_quote": "Analysis failed due to LLM provider downtime.",
                            "issue": "AI Reviewer encountered a severe network timeout or rate limit.",
                            "risk_level": "UNKNOWN",
                            "confidence": 0,
                            "reasoning_summary": f"The Reviewer LLM timed out while analyzing the document: {reviewer_response.get('error', '')}"
                        }
                    ]
                }
            
            reviewer_findings = reviewer_response.get("findings", [])
            debate_history.append({"role": "Reviewer", "stage": "Opening", "content": reviewer_findings})
        
            # Stream the findings back
            yield f"event: reviewer_findings\ndata: {json.dumps(reviewer_response)}\n\n"
        
            # ================= ROUND 1: SKEPTIC CHALLENGE =================
            yield "event: state\ndata: SKEPTIC_CRITIQUING\n\n"
            await asyncio.sleep(0.1)
            skeptic_response = await asyncio.to_thread(self.skeptic.challenge_findings, reviewer_findings, document_text, evidence)
        
            if "error" in skeptic_response:
                yield f"event: agent_error\ndata: {skeptic_response['error']}\n\n"
                skeptic_response = {}
            
            skeptic_challenges = skeptic_response.get("challenges", [])
            debate_history.append({"role": "Skeptic", "stage": "Opening", "content": skeptic_challenges})
            yield f"event: skeptic_critiques\ndata: {json.dumps(skeptic_response)}\n\n"
        
            # ================= ROUND 2: REBUTTAL =================
            yield "event: state\ndata: REVIEWER_AMENDING\n\n"
            await asyncio.sleep(0.1)
            reviewer_rebuttal_resp = await asyncio.to_thread(self.reviewer.generate_rebuttal, reviewer_findings, skeptic_challenges, evidence)
            if "error" in reviewer_rebuttal_resp:
                yield f"event: agent_error\ndata: {reviewer_rebuttal_resp['error']}\n\n"
                reviewer_rebuttal_resp = {}
            reviewer_rebuttals = reviewer_rebuttal_resp.get("rebuttals", [])
            debate_history.append({"role": "Reviewer", "stage": "Rebuttal", "content": reviewer_rebuttals})
            yield f"event: reviewer_rebuttal\ndata: {json.dumps(reviewer_rebuttal_resp)}\n\n"
        
            yield "event: state\ndata: SKEPTIC_CRITIQUING\n\n"
            await asyncio.sleep(0.1)
            skeptic_rebuttal_resp = await asyncio.to_thread(self.skeptic.generate_rebuttal, reviewer_rebuttals, evidence)
            if "error" in skeptic_rebuttal_resp:
                yield f"event: agent_error\ndata: {skeptic_rebuttal_resp['error']}\n\n"
                skeptic_rebuttal_resp = {}
            skeptic_rebuttals = skeptic_rebuttal_resp.get("rebuttals", [])
            debate_history.append({"role": "Skeptic", "stage": "Rebuttal", "content": skeptic_rebuttals})
            yield f"event: skeptic_rebuttal\ndata: {json.dumps(skeptic_rebuttal_resp)}\n\n"

            # ================= ROUND 3: CLOSING =================
            yield "event: state\ndata: REVIEWER_AMENDING\n\n"
            await asyncio.sleep(0.1)
            reviewer_closing_resp = await asyncio.to_thread(self.reviewer.generate_closing, debate_history)
            if "error" in reviewer_closing_resp:
                yield f"event: agent_error\ndata: {reviewer_closing_resp['error']}\n\n"
                reviewer_closing_resp = {}
            reviewer_closings = reviewer_closing_resp.get("closings", [])
            debate_history.append({"role": "Reviewer", "stage": "Closing", "content": reviewer_closings})
            yield f"event: reviewer_closing\ndata: {json.dumps(reviewer_closing_resp)}\n\n"

            yield "event: state\ndata: SKEPTIC_CRITIQUING\n\n"
            await asyncio.sleep(0.1)
            skeptic_closing_resp = await asyncio.to_thread(self.skeptic.generate_closing, debate_history)
            if "error" in skeptic_closing_resp:
                yield f"event: agent_error\ndata: {skeptic_closing_resp['error']}\n\n"
                skeptic_closing_resp = {}
            skeptic_closings = skeptic_closing_resp.get("closings", [])
            debate_history.append({"role": "Skeptic", "stage": "Closing", "content": skeptic_closings})
            yield f"event: skeptic_closing\ndata: {json.dumps(skeptic_closing_resp)}\n\n"

            # ================= SUPERVISOR =================
            yield "event: state\ndata: SUPERVISOR_THINKING\n\n"
            await asyncio.sleep(0.1)
        
            supervisor_response = await asyncio.to_thread(
                self.supervisor.resolve_disputes, document_text, debate_history, evidence
            )
        
            if "error" in supervisor_response:
                yield f"event: agent_error\ndata: {supervisor_response['error']}\n\n"
                supervisor_response = {}
                
            yield f"event: supervisor_resolution\ndata: {json.dumps(supervisor_response)}\n\n"
            
        except Exception as e:
            import traceback
            print(f"Orchestrator pipeline interrupted: {e}")
            yield f"event: agent_error\ndata: {json.dumps({'error': str(e)})}\n\n"
            if not reviewer_findings:
                reviewer_findings = [{
                    "finding_id": "fallback-001",
                    "exact_contract_quote": "Analysis failed due to LLM provider downtime or pipeline crash.",
                    "issue": f"AI Reviewer encountered a severe error: {e}",
                    "risk_level": "HIGH",
                    "confidence": 100,
                    "reasoning_summary": f"The pipeline was interrupted."
                }]
            
        # Process and combine results for the frontend/db
        final_findings = []
        if 'supervisor_response' in locals() and isinstance(supervisor_response, dict):
            resolutions = supervisor_response.get("resolutions", [])
        else:
            resolutions = []
        
        for reviewer_f in reviewer_findings:
            f_id = reviewer_f.get("finding_id")
            s_challenge = next((c for c in skeptic_challenges if c.get("finding_id") == f_id), {})
            s_resolution = next((r for r in resolutions if r.get("finding_id") == f_id), {})
            
            final_finding = {
                "execution_status": "COMPLETED",
                "resolution_path": "WITH_DEBATE",
                "clause_id": f_id,
                "clause_text": reviewer_f.get("exact_contract_quote", ""),
                "page_number": 1,
                "exact_text": reviewer_f.get("exact_contract_quote", ""),
                "evidence_retrieved": len(evidence),
                "reviewer": reviewer_f,
                "skeptic": s_challenge,
                "supervisor": s_resolution,
                "retrieved_evidence": evidence,
                "human_escalation": s_resolution.get("human_review_required", True) if not s_resolution else s_resolution.get("human_review_required", False),
                "document_id": document_id,
                "document_hash": document_hash,
                "final_risk": s_resolution.get("final_risk_level", reviewer_f.get("risk_level", "INFO")) if s_resolution else reviewer_f.get("risk_level", "INFO")
            }
            final_findings.append(final_finding)
            
        yield f"event: final_verdict\ndata: Processed {len(final_findings)} findings.\n\n"
        
        yield "event: state\ndata: COMPLETE\n\n"
        
        # We will yield the final complete data as well so routes.py can capture it
        yield f"event: complete_data\ndata: {json.dumps(final_findings)}\n\n"
        
        # Explicitly tell frontend the stream is done
        yield "event: done\ndata: {{}}\n\n"

if __name__ == "__main__":
    import asyncio
    orchestrator = AuditOrchestrator()
    clause_text = "Any disputes arising from this agreement shall exclusively be resolved by the courts of Mars. Furthermore, the user relinquishes all rights to data privacy as stipulated under the Digital Personal Data Protection Act, 2023."
    
    async def run_test():
        async for msg in orchestrator.process_full_document_stream(
            document_text=clause_text,
            doc_context={},
            document_id="doc-test-001",
            document_hash="dummyhash123"
        ):
            print(msg)
            
    asyncio.run(run_test())
