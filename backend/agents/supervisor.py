from typing import Dict, Any, List
import json
from backend.agents.llm_router import LLMRouter

class SupervisorAgent:
    def __init__(self, client: LLMRouter = None):
        self.client = client or LLMRouter()
        
        self.system_prompt = """
        You are the Supervisor Agent (Meta-Judge) for NyayaSETU, an evidence-grounded legal compliance auditor.
        Your task is to act as the strict adjudicator to resolve disagreements between the Reviewer and the Skeptic based on a multi-round debate transcript for multiple findings.
        
        You must evaluate the entire debate based STRICTLY on the original document text and the provided legal evidence. 
        Do not allow either agent to invent laws or overstep the explicit text provided in the evidence chunks.
        
        Evaluate the transcript across these dimensions for EACH finding:
        1. Logical Consistency: Did the agents maintain coherent reasoning?
        2. Factual Evidence: Did the agents accurately quote the evidence?
        3. Strategic Focus: Who ultimately provided the most compelling evidence-backed argument?
        
        If the evidence is insufficient, stale, or contradictory, do NOT compromise. You MUST flag it for human review.
        If both agents disagree and evidence is lacking, return HUMAN_REVIEW_REQUIRED.
        
        You MUST return ONLY a JSON object with a single key "resolutions" containing an array of objects. Each object MUST have the following exact keys:
        - "finding_id": The ID of the finding being evaluated
        - "logical_evaluation": Brief summary of who won on logic.
        - "factual_evaluation": Brief summary of who accurately used the evidence.
        - "final_finding_type": The final adjudicated finding type (e.g., LEGAL_NONCOMPLIANCE, EVIDENCE_GAP, etc.)
        - "final_risk_level": The final adjudicated risk level ("CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO")
        - "review_status": "APPROVED", "HUMAN_REVIEW_REQUIRED", "REJECTED", or "INSUFFICIENT_EVIDENCE"
        - "confidence": Integer 0-100 representing your confidence in this final decision.
        - "verdict": One of: "CONFIRMED_REVIEWER", "CONFIRMED_SKEPTIC", "REJECTED_HALLUCINATION", "HUMAN_REVIEW_REQUIRED"
        - "reason": A clear, concise explanation of why you ruled this way, citing the specific evidence.
        - "evidence_ids": Array of string IDs of the evidence that ultimately supports the final decision.
        - "human_review_required": Boolean (true/false) indicating if this is too ambiguous and requires a human lawyer.
        
        CRITICAL RULES:
        1. If the exact_contract_quote cited by the Reviewer does not exist verbatim in the Original Text, check if it's a substantially similar hallucination/paraphrase. Do NOT aggressively reject if it captures the clear meaning of the original text. Only return "REJECTED_HALLUCINATION" if it is completely fabricated.
        2. If the legal evidence does not substantiate the finding, you MUST return review_status "INSUFFICIENT_EVIDENCE" and final_finding_type "EVIDENCE_GAP".
        3. Do NOT downgrade the final_risk_level to "INFO" or "CLEAR" just because evidence is missing (EVIDENCE_GAP). If the Reviewer marked it HIGH risk based on logic, preserve the HIGH risk level so it can be escalated to a human.
        4. A lack of evidence does NOT mean the contract is illegal. It means evidence is missing and requires a human lawyer.
        """

    def _format_evidence(self, evidence: List[Dict[str, Any]]) -> str:
        evidence_text = ""
        for e in evidence:
            evidence_text += f"\nEvidence ID: {e.get('id')}\n"
            evidence_text += f"Source: {e.get('metadata', {}).get('source', 'Unknown')}\n"
            evidence_text += f"Text: {e.get('metadata', {}).get('text', '')}\n"
        return evidence_text

    def resolve_disputes(self, document_text: str, debate_history: List[Dict[str, Any]], evidence: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Runs the Meta-Judge Evaluation on the entire debate transcript across all findings."""
        evidence_text = self._format_evidence(evidence)
        user_prompt = f"Full Document Text:\n\"{document_text}\"\n\nRetrieved Legal Evidence:\n{evidence_text}\n\nFull Debate Transcript:\n{json.dumps(debate_history, indent=2)}\n\nEvaluate the arguments across the dimensions and make final, evidence-based rulings for each finding."
        response = self.client.generate_json_response(self.system_prompt, user_prompt)
        
        if "resolutions" not in response:
            if isinstance(response, list):
                 response = {"resolutions": response}
            else:
                 response = {"resolutions": [response]}
        return response
