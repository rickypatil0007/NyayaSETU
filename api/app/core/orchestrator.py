import json
from typing import List, Dict, Any, Generator
from supabase import create_client, Client
from app.core.config import settings
from app.core.llm import LLMProvider
from app.core.schemas import ReviewerOutput, SkepticOutput, SupervisorOutput
from app.core.prompts import REVIEWER_SYSTEM_PROMPT, SKEPTIC_SYSTEM_PROMPT, SUPERVISOR_SYSTEM_PROMPT

supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key
)

class AuditOrchestrator:
    def __init__(self, llm: LLMProvider):
        self.llm = llm
        self.max_rounds = settings.max_debate_rounds

    def run_debate_stream(self, audit_id: str, evidence: List[Dict[str, Any]]) -> Generator[str, None, None]:
        """
        Runs the multi-agent debate and yields state updates for SSE.
        """
        evidence_text = json.dumps(evidence, indent=2)
        
        # 1. Reviewer Turn
        yield self._format_sse("state", "REVIEWER_THINKING")
        reviewer_prompt = f"Evidence:\n{evidence_text}\n\nIdentify any compliance risks under Indian law."
        try:
            reviewer_output = self.llm.generate_structured(
                system_instruction=REVIEWER_SYSTEM_PROMPT,
                prompt=reviewer_prompt,
                schema=ReviewerOutput
            )
            yield self._format_sse("reviewer_findings", reviewer_output.model_dump())
        except Exception as e:
            yield self._format_sse("error", f"Reviewer failed: {str(e)}")
            return

        if not reviewer_output.findings:
            yield self._format_sse("state", "SUPERVISOR_THINKING")
            yield self._format_sse("final_verdict", "No risks identified by the Reviewer based on the evidence.")
            return

        # Debate Loop
        findings_state = reviewer_output.model_dump()
        skeptic_output = None
        
        for round_num in range(self.max_rounds):
            yield self._format_sse("state", f"SKEPTIC_CRITIQUING_ROUND_{round_num + 1}")
            skeptic_prompt = f"Evidence:\n{evidence_text}\n\nCurrent Findings:\n{json.dumps(findings_state, indent=2)}\n\nCritique the findings under Indian law."
            
            try:
                skeptic_output = self.llm.generate_structured(
                    system_instruction=SKEPTIC_SYSTEM_PROMPT,
                    prompt=skeptic_prompt,
                    schema=SkepticOutput
                )
                yield self._format_sse("skeptic_critiques", skeptic_output.model_dump())
            except Exception as e:
                yield self._format_sse("error", f"Skeptic failed: {str(e)}")
                break

            if not skeptic_output.critiques:
                break
                
            # Let Reviewer amend if not last round
            if round_num < self.max_rounds - 1:
                yield self._format_sse("state", f"REVIEWER_AMENDING_ROUND_{round_num + 1}")
                amend_prompt = f"Evidence:\n{evidence_text}\n\nYour previous findings:\n{json.dumps(findings_state, indent=2)}\n\nSkeptic's Critiques:\n{json.dumps(skeptic_output.model_dump(), indent=2)}\n\nUpdate your findings based on valid critiques. Remove findings if they were proven unsupported."
                try:
                    reviewer_output = self.llm.generate_structured(
                        system_instruction=REVIEWER_SYSTEM_PROMPT,
                        prompt=amend_prompt,
                        schema=ReviewerOutput
                    )
                    findings_state = reviewer_output.model_dump()
                    yield self._format_sse("reviewer_findings", findings_state)
                except Exception as e:
                    yield self._format_sse("error", f"Reviewer amendment failed: {str(e)}")
                    break

        # Final Supervisor Arbitration
        yield self._format_sse("state", "SUPERVISOR_ARBITRATING")
        supervisor_prompt = f"Evidence:\n{evidence_text}\n\nFinal Findings:\n{json.dumps(findings_state, indent=2)}\n\nFinal Critiques:\n{json.dumps(skeptic_output.model_dump() if skeptic_output else {}, indent=2)}\n\nArbitrate and provide final resolution under Indian law."
        
        try:
            supervisor_output = self.llm.generate_structured(
                system_instruction=SUPERVISOR_SYSTEM_PROMPT,
                prompt=supervisor_prompt,
                schema=SupervisorOutput
            )
            
            report_data = supervisor_output.model_dump()
            
            # Map Reviewer findings for quick lookup
            reviewer_findings_map = {f['finding_id']: f for f in findings_state.get('findings', [])}
            skeptic_critiques_map = {c['finding_id']: c for c in (skeptic_output.model_dump().get('critiques', []) if skeptic_output else [])}

            # Save findings into Supabase findings table
            for res in report_data.get('resolutions', []):
                fid = res.get('finding_id')
                r_find = reviewer_findings_map.get(fid, {})
                s_critique = skeptic_critiques_map.get(fid, {})
                
                try:
                    supabase.table("findings").insert({
                        "audit_id": audit_id,
                        "clause_text": r_find.get("clause_text", "Unknown Clause"),
                        "location": r_find.get("clause_location", ""),
                        "risk_level": res.get("risk_level", "LOW"),
                        "confidence_score": res.get("confidence_score", 0),
                        "issue_description": r_find.get("concern", "No description"),
                        "reviewer_comment": r_find.get("concern", ""),
                        "skeptic_comment": s_critique.get("critique", ""),
                        "supervisor_comment": res.get("resolution_note", ""),
                        "status": res.get("verdict", "ESCALATED")
                    }).execute()
                except Exception as find_err:
                    print(f"Failed to insert finding {fid}: {find_err}")

            # Save the final report to Supabase audits table
            try:
                supabase.table("audits").update({
                    "status": "COMPLETED",
                    "report": report_data,
                    "risk_level": report_data.get("final_verdict", {}).get("overall_risk", "CLEAR"),
                    "confidence_score": report_data.get("final_verdict", {}).get("overall_confidence", 0)
                }).eq("id", audit_id).execute()
            except Exception as db_err:
                yield self._format_sse("error", f"Database save failed: {str(db_err)}")
            
            yield self._format_sse("supervisor_resolution", report_data)
        except Exception as e:
            yield self._format_sse("error", f"Supervisor failed: {str(e)}")
            
        yield self._format_sse("state", "COMPLETE")

    def _format_sse(self, event: str, data: Any) -> str:
        if isinstance(data, (dict, list)):
            data_str = json.dumps(data)
        else:
            data_str = str(data)
        return f"event: {event}\ndata: {data_str}\n\n"
