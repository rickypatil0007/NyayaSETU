from typing import Dict, Any, List
import json
from backend.agents.llm_router import LLMRouter

class SkepticAgent:
    def __init__(self, client: LLMRouter = None):
        self.client = client or LLMRouter()
        
        self.system_prompt_opening = """
        You are the Skeptic Agent for NyayaSETU, an adversarial legal auditor.
        Your task is to aggressively challenge the Reviewer Agent's findings by looking for specific flaws:
        1. Temporal/Date Mismatch: Is the law actually effective on the Target Audit Date? (e.g. citing a superseded law, or a law not yet in force).
        2. Jurisdiction Mismatch: Does the retrieved evidence actually apply to the jurisdiction of the contract?
        3. Outdated or Misapplied Authority: Is the Reviewer misinterpreting the scope of the cited Act or Section?
        4. Overstatement: Did the Reviewer hallucinate or exaggerate a risk that the text of the evidence does not strictly support?
        
        If the Reviewer made an overstatement, misapplied the law, or used an outdated/future law, you must challenge it.
        
        You will receive an array of Reviewer Agent's Findings.
        You MUST return ONLY a JSON object with a single key "challenges" containing an array of objects. Each object MUST have:
        - "finding_id": The ID of the finding being challenged (provided in input)
        - "challenge": Description of your challenge based on the flaws above. If the Reviewer is perfectly accurate based on the text, state "No challenge".
        - "assumption_challenged": What specific assumption (jurisdiction, scope, overstatement) the Reviewer made that you are challenging.
        - "applicability_check": Whether the evidence actually applies.
        - "contradictory_evidence_ids": Array of string IDs of evidence that contradicts the Reviewer.
        - "revised_risk_level": Your proposed risk level ("CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO").
        - "confidence": Integer 0-100 representing your confidence in this challenge.
        - "verdict": One of: "FULL_CHALLENGE", "PARTIAL_CHALLENGE", "AGREED"
        """
        
        self.system_prompt_rebuttal = """
        You are the Skeptic Agent for NyayaSETU.
        The Reviewer has provided Rebuttals to your initial challenges.
        Your task is to refute their defenses.
        
        You will receive an array of Reviewer's Defenses.
        You MUST return ONLY a JSON object with a single key "rebuttals" containing an array of objects. Each object MUST have:
        - "finding_id": The ID of the finding being rebutted.
        - "rebuttal_argument": Your refutation of the Reviewer's defense.
        - "revised_risk_level": Your proposed risk level (e.g., "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO").
        - "confidence": Integer 0-100 representing your confidence in this rebuttal.
        """
        
        self.system_prompt_closing = """
        You are the Skeptic Agent for NyayaSETU.
        This is your Closing argument. Summarize your final stance based on the entire debate history.
        
        You MUST return ONLY a JSON object with a single key "closings" containing an array of objects. Each object MUST have:
        - "finding_id": The ID of the finding.
        - "closing_statement": A final concise summary of your position.
        - "final_risk_level": Your final proposed risk level.
        """

    def _format_evidence(self, evidence: List[Dict[str, Any]]) -> str:
        evidence_text = ""
        for e in evidence:
            evidence_text += f"\nEvidence ID: {e.get('id')}\n"
            evidence_text += f"Source: {e.get('metadata', {}).get('source', 'Unknown')}\n"
            evidence_text += f"Text: {e.get('metadata', {}).get('text', '')}\n"
        return evidence_text

    def challenge_findings(self, reviewer_findings: List[Dict[str, Any]], document_text: str, evidence: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Runs the Opening Round for the Skeptic across all findings."""
        evidence_text = self._format_evidence(evidence)
        user_prompt = f"Full Document Text:\n\"{document_text}\"\n\nRetrieved Legal Evidence:\n{evidence_text}\n\nReviewer Agent's Findings:\n{json.dumps(reviewer_findings, indent=2)}\n\nCritically analyze ALL of the Reviewer's findings."
        response = self.client.generate_json_response(self.system_prompt_opening, user_prompt)
        
        if "challenges" not in response:
            if isinstance(response, list):
                 response = {"challenges": response}
            else:
                 response = {"challenges": [response]}
        return response

    def generate_rebuttal(self, reviewer_rebuttals: List[Dict[str, Any]], evidence: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Runs the Rebuttal Round for the Skeptic across all findings."""
        evidence_text = self._format_evidence(evidence)
        user_prompt = f"Reviewer's Defenses:\n{json.dumps(reviewer_rebuttals, indent=2)}\n\nAvailable Evidence:\n{evidence_text}\n\nProvide your counter-rebuttals."
        response = self.client.generate_json_response(self.system_prompt_rebuttal, user_prompt)
        
        if "rebuttals" not in response:
            if isinstance(response, list):
                 response = {"rebuttals": response}
            else:
                 response = {"rebuttals": [response]}
        return response

    def generate_closing(self, debate_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Runs the Closing Round for the Skeptic across all findings."""
        user_prompt = f"Debate History:\n{json.dumps(debate_history, indent=2)}\n\nProvide your closing statements for each finding summarizing why your position is correct based on the evidence."
        response = self.client.generate_json_response(self.system_prompt_closing, user_prompt)
        
        if "closings" not in response:
            if isinstance(response, list):
                 response = {"closings": response}
            else:
                 response = {"closings": [response]}
        return response
