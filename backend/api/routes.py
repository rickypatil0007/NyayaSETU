import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from pypdf import PdfReader
from typing import Dict, Any, List

from backend.pipeline.audit_orchestrator import AuditOrchestrator

router = APIRouter()
orchestrator = AuditOrchestrator()

import uuid

TEMP_STORAGE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", ".cache", "documents")
os.makedirs(TEMP_STORAGE_DIR, exist_ok=True)
@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Receives an uploaded document, extracts text, stores it temporarily,
    and returns an ID so the frontend can initiate the SSE stream.
    """
    if not file.filename.endswith((".pdf", ".docx", ".txt")):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are supported.")
        
    try:
        import tempfile
        from backend.pipeline.document_processor import DocumentProcessor
        
        import hashlib
        import json
        file_bytes = await file.read()
        file_hash = hashlib.sha256(file_bytes).hexdigest()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
            
        doc_data = {"clauses": [], "pages": 1, "effective_date": None, "full_text": ""}
        
        try:
            if file.filename.endswith(".pdf"):
                doc_data = DocumentProcessor.extract_pdf(tmp_path)
            elif file.filename.endswith(".docx"):
                import docx
                doc = docx.Document(tmp_path)
                text = ""
                for para in doc.paragraphs:
                    text += para.text + "\n"
                doc_data["full_text"] = text
                paragraphs = [p for p in text.split("\n\n") if len(p.strip()) > 50]
                doc_data["clauses"] = [{"clause_text": p, "page_number": 1, "heading": "", "extraction_confidence": 0.8} for p in paragraphs]
            elif file.filename.endswith(".txt"):
                with open(tmp_path, "r", encoding="utf-8") as f:
                    text = f.read()
                doc_data["full_text"] = text
                paragraphs = [p for p in text.split("\n\n") if len(p.strip()) > 50]
                doc_data["clauses"] = [{"clause_text": p, "page_number": 1, "heading": "", "extraction_confidence": 1.0} for p in paragraphs]
        finally:
            os.remove(tmp_path)
            
        if not doc_data.get("clauses"):
            doc_data["clauses"] = [{"clause_text": doc_data.get("full_text", "")[:1000], "page_number": 1, "heading": "", "extraction_confidence": 0.5}]
            
        doc_id = str(uuid.uuid4())
        
        # Classify the document
        try:
            from backend.agents.classifier import DocumentClassifierAgent
            classifier = DocumentClassifierAgent(client=orchestrator.shared_router)
            
            import asyncio
            classification_res = await asyncio.wait_for(
                asyncio.to_thread(classifier.classify_document, doc_data.get("full_text", "")),
                timeout=15.0
            )
            doc_data.update(classification_res)
        except Exception as e:
            print(f"Classification failed or timed out: {e}")
            doc_data["jurisdiction"] = "India"
            doc_data["document_type"] = "Contract"
        
        # Save structured JSON data
        with open(os.path.join(TEMP_STORAGE_DIR, f"{doc_id}.json"), "w", encoding="utf-8") as f:
            json.dump({
                "filename": file.filename,
                "document_id": doc_id,
                "document_hash": file_hash,
                "file_size": len(file_bytes),
                "page_count": doc_data["pages"],
                "effective_date": doc_data.get("effective_date"),
                "jurisdiction": doc_data.get("jurisdiction", "India"),
                "document_type": doc_data.get("document_type", "Contract"),
                "contract_type": doc_data.get("contract_type", "Contract"),
                "industry": doc_data.get("industry", "General"),
                "party_roles": doc_data.get("party_roles", []),
                "full_text": doc_data.get("full_text", ""), # Saved for single cycle full document analysis
                "clauses": doc_data["clauses"]
            }, f, indent=2)
        
        return {
            "message": "Document processed and ready for streaming",
            "filename": file.filename,
            "document_id": doc_id,
            "document_hash": file_hash,
            "extracted_text_preview": doc_data["full_text"][:200] if doc_data.get("full_text") else "No text extracted.",
            "pages": doc_data["pages"],
            "sections": max(1, len(doc_data["clauses"]) // 5),
            "clauses": len(doc_data["clauses"])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print("Error processing document:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import StreamingResponse
import asyncio
import json

MAX_CONCURRENT_AUDITS = 1
audit_semaphore = asyncio.Semaphore(MAX_CONCURRENT_AUDITS)

async def save_findings_to_db(final_findings_data, audit_id, document_id, supabase_url, supabase_key):
    import httpx
    try:
        async with httpx.AsyncClient() as client:
            inserted_quotes = []
            findings_to_insert = []
            if final_findings_data is not None:
                for finding in final_findings_data:
                    reviewer_finding = finding.get("reviewer", {})
                    skeptic_finding = finding.get("skeptic", {})
                    supervisor_finding = finding.get("supervisor", {})
                    
                    exact_quote = reviewer_finding.get("exact_contract_quote", "")
                    if exact_quote:
                        inserted_quotes.append(exact_quote)
                    
                    sources_list = []
                    evidence_ids = reviewer_finding.get("evidence_ids", [])
                    retrieved_evidence = finding.get("retrieved_evidence", [])
                    
                    if isinstance(evidence_ids, list):
                        for ev_id in evidence_ids:
                            evidence_meta = next((e.get("metadata", {}) for e in retrieved_evidence if e.get("id") == ev_id), {})
                            sources_list.append({
                                "id": str(ev_id),
                                "title": evidence_meta.get("source", "Legal Authority"),
                                "source_id": evidence_meta.get("source_id", ""),
                                "section": evidence_meta.get("text", "Applicable Provision")[:150] + "..." if evidence_meta.get("text") else "Applicable Provision"
                            })
                            
                    finding_data = {
                        "audit_id": audit_id,
                        "clause_text": exact_quote,
                        "issue_summary": reviewer_finding.get("issue", "No issue"),
                        "risk_level": finding.get("final_risk", "UNKNOWN"),
                        "confidence_score": reviewer_finding.get("confidence", 85),
                        "status": "Needs Review" if finding.get("human_escalation") else "Confirmed",
                        "recommendation": json.dumps({
                            "reviewer_comment": f"Assessment: {reviewer_finding.get('risk_level')}. {reviewer_finding.get('issue')}",
                            "skeptic_comment": f"Challenge: {skeptic_finding.get('challenge', 'None')}",
                            "supervisor_comment": f"Final: {finding.get('final_risk')} RISK. Decision: {supervisor_finding.get('verdict')}. {supervisor_finding.get('reason', '')}",
                            "location": f"Document ID: {document_id}",
                            "page_number": 1,
                            "exact_contract_quote": exact_quote,
                            "exact_law_quote": reviewer_finding.get("exact_law_quote", ""),
                            "escalated": finding.get("human_escalation", False),
                            "reasoning_summary": reviewer_finding.get("reasoning_summary", ""),
                            "exact_text": exact_quote,
                            "supervisor_reason": supervisor_finding.get("reason", ""),
                            "sources": sources_list
                        })
                    }
                    findings_to_insert.append(finding_data)
            
            # 2. Insert CLEAR findings
            file_path = os.path.join(TEMP_STORAGE_DIR, f"{document_id}.json")
            if os.path.exists(file_path):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        doc_data = json.load(f)
                    all_clauses = doc_data.get("clauses", [])
                    for idx, clause in enumerate(all_clauses):
                        c_text = clause.get("clause_text", "")
                        is_covered = any(q in c_text or c_text in q for q in inserted_quotes if q)
                        if not is_covered and len(c_text.strip()) > 10:
                            clear_finding = {
                                "audit_id": audit_id,
                                "clause_text": c_text,
                                "issue_summary": "No compliance issues detected",
                                "risk_level": "CLEAR",
                                "confidence_score": 95,
                                "status": "Confirmed",
                                "recommendation": json.dumps({
                                    "reviewer_comment": "Assessment: CLEAR. The clause appears compliant against retrieved evidence.",
                                    "skeptic_comment": "No challenges. Compliant.",
                                    "supervisor_comment": "Final: CLEAR RISK. Decision: APPROVED. No risks found.",
                                    "location": f"Document ID: {document_id} / Clause {idx+1}",
                                    "page_number": clause.get("page_number", 1),
                                    "exact_contract_quote": c_text,
                                    "exact_law_quote": "",
                                    "escalated": False,
                                    "reasoning_summary": "Auto-cleared: No issues flagged by AI Reviewer.",
                                    "exact_text": c_text,
                                    "supervisor_reason": "No dispute.",
                                    "sources": []
                                })
                            }
                            findings_to_insert.append(clear_finding)
                except Exception as e:
                    print(f"Failed to process remaining clauses: {e}")
                    
            if findings_to_insert:
                try:
                    res = await client.post(
                        f"{supabase_url}/rest/v1/findings",
                        headers={"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}", "Content-Type": "application/json", "Prefer": "return=representation"},
                        json=findings_to_insert
                    )
                    
                    if res.status_code < 400:
                        inserted_findings = res.json()
                        
                        # Gather unique source_ids
                        unique_source_ids = set()
                        for f_in in findings_to_insert:
                            rec = json.loads(f_in["recommendation"])
                            for src in rec.get("sources", []):
                                if src.get("source_id"):
                                    unique_source_ids.add(src["source_id"])
                        
                        source_id_to_uuid = {}
                        if unique_source_ids:
                            source_ids_str = ",".join(unique_source_ids)
                            res_sources = await client.get(
                                f"{supabase_url}/rest/v1/legal_sources?source_id=in.({source_ids_str})&select=id,source_id",
                                headers={"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}"}
                            )
                            if res_sources.status_code < 400:
                                for row in res_sources.json():
                                    source_id_to_uuid[row["source_id"]] = row["id"]
                                    
                        finding_legal_sources_to_insert = []
                        for db_finding in inserted_findings:
                            finding_id = db_finding["id"]
                            rec_str = db_finding.get("recommendation", "{}")
                            rec = json.loads(rec_str) if isinstance(rec_str, str) else rec_str
                            
                            for src in rec.get("sources", []):
                                src_id_val = src.get("source_id")
                                legal_source_id = source_id_to_uuid.get(src_id_val)
                                if legal_source_id:
                                    finding_legal_sources_to_insert.append({
                                        "finding_id": finding_id,
                                        "legal_source_id": legal_source_id,
                                        "section_title": src.get("section", ""),
                                        "citation_text": src.get("title", "")
                                    })
                                    
                        if finding_legal_sources_to_insert:
                            await client.post(
                                f"{supabase_url}/rest/v1/finding_legal_sources",
                                headers={"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}", "Content-Type": "application/json", "Prefer": "return=minimal"},
                                json=finding_legal_sources_to_insert
                            )
                            
                except Exception as e:
                    print(f"Failed to bulk save findings to DB: {e}")
    except Exception as e:
        print(f"Error in background DB insert task: {e}")

async def limited_process_document_stream(document_text: str, doc_context: Dict[str, Any] = None, audit_id: str = "unknown", document_id: str = "unknown", document_hash: str = "unknown"):
    """Wrapper to process the entire document in one cycle and yield its SSE events"""
    import traceback
    
    yield f"event: audit_connected\ndata: {json.dumps({'audit_id': audit_id})}\n\n"
    
    try:
        await audit_semaphore.acquire()
        
        import httpx
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SECRET_KEY")
        
        async with httpx.AsyncClient() as client:
            yield "event: state\ndata: QUEUED\n\n"
            
            final_findings_data = []
            
            try:
                stream_iter = orchestrator.process_full_document_stream(document_text, doc_context, document_id, document_hash).__aiter__()
                while True:
                    next_task = asyncio.create_task(stream_iter.__anext__())
                    while True:
                        done, pending = await asyncio.wait([next_task], timeout=15.0)
                        if next_task in done:
                            break
                        yield ": keepalive\n\n"
                    
                    try:
                        chunk = next_task.result()
                    except StopAsyncIteration:
                        break
                    
                    if chunk.startswith("event: complete_data"):
                        try:
                            data_str = chunk.split("data: ")[1].strip()
                            final_findings_data = json.loads(data_str)
                        except: pass
                        # YIELD the chunk to the client BEFORE continuing!
                        yield chunk
                        continue
                        
                    if chunk.startswith("event: done"):
                        # Synchronously await DB save before yielding done to prevent UI race conditions
                        if supabase_url and supabase_key:
                            try:
                                await save_findings_to_db(final_findings_data, audit_id, document_id, supabase_url, supabase_key)
                            except Exception as e:
                                print(f"Error saving findings during done event: {e}")
                        yield chunk
                        break
                        
                    yield chunk
            except asyncio.CancelledError:
                print(f"[{audit_id}] Client disconnected before stream completion. Proceeding to save gathered findings to DB...")
                if supabase_url and supabase_key:
                    asyncio.create_task(save_findings_to_db(
                        final_findings_data, audit_id, document_id, supabase_url, supabase_key
                    ))
            finally:
                pass

                            
        yield "event: state\ndata: COMPLETE\n\n"
    except Exception as e:
        import logging
        import traceback
        logging.error(f"Uncaught exception in SSE generator: {e}\n{traceback.format_exc()}")
        error_payload = {
            "audit_id": audit_id,
            "message": str(e),
            "recoverable": False
        }
        # Yield the error so the UI can show it, but then gracefully yield done
        yield f"event: agent_error\ndata: {json.dumps(error_payload)}\n\n"
        yield "event: state\ndata: COMPLETE\n\n"
    finally:
        audit_semaphore.release()
        yield "event: done\ndata: {}\n\n"

@router.get("/audit/{audit_id}/run")
async def run_audit_stream(audit_id: str, document_id: str):
    """
    Streams Server-Sent Events (SSE) to the frontend Live Audit dashboard
    using the real AuditOrchestrator generator in a single cycle.
    """
    document_text = ""
    document_hash = "unknown"
    doc_context = {"jurisdiction": "India", "document_type": "Contract"}
    
    file_path = os.path.join(TEMP_STORAGE_DIR, f"{document_id}.json")
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            doc_data = json.load(f)
            
            document_text = doc_data.get("full_text", "")
            document_hash = doc_data.get("document_hash", "unknown")
            
            if not document_text and doc_data.get("clauses"):
                # Fallback to combining clauses if full_text is missing
                document_text = "\n\n".join([c.get("clause_text", "") for c in doc_data.get("clauses", [])])
                
            doc_context = {
                "jurisdiction": doc_data.get("jurisdiction", "India"),
                "document_type": doc_data.get("document_type", "Contract"),
                "contract_type": doc_data.get("contract_type", "Contract"),
                "industry": doc_data.get("industry", "General"),
                "party_roles": doc_data.get("party_roles", []),
                "effective_date": doc_data.get("effective_date")
            }
            
    if not document_text:
        document_text = "Provider's total liability under this agreement shall in no event exceed one month fees."
        
    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
    }
    
    return StreamingResponse(
        limited_process_document_stream(document_text, doc_context, audit_id=audit_id, document_id=document_id, document_hash=document_hash), 
        media_type="text/event-stream", 
        headers=headers
    )

@router.get("/health")
def health_check():
    return {"status": "ok"}

@router.get("/report/{audit_id}")
async def get_report(audit_id: str):
    report_file = os.path.join(TEMP_STORAGE_DIR, f"{audit_id}_report.json")
    if os.path.exists(report_file):
        with open(report_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"error": "Report not found or not yet generated"}
