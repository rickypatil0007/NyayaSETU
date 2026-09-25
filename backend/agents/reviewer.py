from typing import Dict, Any, List
import json
import uuid
from backend.agents.llm_router import LLMRouter

class ReviewerAgent:
    def __init__(self, client: LLMRouter = None):
        self.client = client or LLMRouter()
        
        self.system_prompt_opening = """
        You are the Reviewer Agent for NyayaSETU, an evidence-grounded legal compliance auditor.
        Your task is to analyze an ENTIRE contract STRICTLY against retrieved legal evidence.
        Do not use outside knowledge. Do not assume facts.
        
        You will receive Provenance Data (including Target Audit Date) and the Full Document Text.
        Identify if there are any potential compliance concerns based *only* on the evidence.
        
        Even if the document appears largely compliant or "strong", you MUST critically analyze it and identify AT LEAST ONE potential concern, missing protection, drafting ambiguity, or edge case risk where the protection could be stronger.
        
        Compare CONTRACTUAL TERMS vs LEGAL REQUIREMENTS.
        
        You MUST return ONLY a JSON object with a single key "findings" containing an array of objects. Each object MUST have the following exact keys:
        - "finding_id": A generated unique ID (e.g., F-12345)
        - "issue": Short string describing the potential issue.
        - "finding_type": MUST be one of: "LEGAL_NONCOMPLIANCE", "POTENTIAL_NONCOMPLIANCE", "MISSING_PROTECTION", "DRAFTING_AMBIGUITY", "CONTRACTUAL_INCONSISTENCY", "CROSS_REFERENCE_ERROR", "MISSING_DEFINITION", "OUTDATED_REFERENCE", "JURISDICTION_MISMATCH", "OPERATIONAL_RISK", "COMMERCIAL_RISK", "EVIDENCE_GAP", "LEGAL_AUTHORITY_GAP", "HUMAN_REVIEW", "INFORMATION_ONLY".
        - "risk_level": "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"
        - "review_status": "APPROVED", "HUMAN_REVIEW_REQUIRED", "REJECTED", or "INSUFFICIENT_EVIDENCE". IF NO EVIDENCE IS PROVIDED, this MUST be "INSUFFICIENT_EVIDENCE" and finding_type MUST be "EVIDENCE_GAP".
        - "exact_contract_quote": Exact text from the contract document that is at risk. Must be a direct verbatim substring.
        - "legal_proposition": What the applicable legal authority requires. If no evidence, state "NONE_ESTABLISHED".
        - "exact_law_quote": Exact text from the retrieved legal evidence. ALWAYS prefix with the Source Document name (e.g., "Digital Personal Data Protection Act, 2023: ...")
        - "reasoning_summary": Brief explanation of the Contract vs Law comparison. MUST mention the name of the Source Document that the law comes from.
        - "evidence_ids": Array of string IDs of the evidence used (from the Evidence ID fields provided to you).
        - "confidence": Integer 0-100 based on extraction quality and legal applicability. Must be at least 50 if evidence was found, 85+ if strong match.
        - "recommendation": Brief suggested action.
        - "verdict": Always set to "REVIEW"
        """
        
        self.system_prompt_rebuttal = """
        You are the Reviewer Agent for NyayaSETU.
        The Skeptic has challenged your initial findings. 
        Your task is to provide a Rebuttal. 
        
        You will receive an array of your Original Findings and an array of Skeptic Challenges.
        
        You MUST return ONLY a JSON object with a single key "rebuttals" containing an array of objects. Each object MUST have:
        - "finding_id": The ID of the finding being rebutted.
        - "rebuttal_argument": Your defense against the Skeptic's challenge.
        - "revised_risk_level": If you agree to lower the risk, state it here (e.g., "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"). Otherwise keep it the same.
        - "concession_made": Boolean (true/false) indicating if you conceded any point to the Skeptic.
        - "confidence": Integer 0-100 representing your confidence in this rebuttal.
        """
        
        self.system_prompt_closing = """
        You are the Reviewer Agent for NyayaSETU.
        This is your Closing argument. Summarize your final stance based on the entire debate history for all findings.
        
        You MUST return ONLY a JSON object with a single key "closings" containing an array of objects. Each object MUST have:
        - "finding_id": The ID of the finding.
        - "closing_statement": A final concise summary of your position.
        - "final_risk_level": Your final proposed risk level.
        """

    def _format_evidence(self, evidence: List[Dict[str, Any]]) -> str:
        evidence_text = ""
        for e in evidence:
            meta = e.get('metadata', {})
            evidence_text += f"\nEvidence ID: {e.get('id')}\n"
            evidence_text += f"Source Document: {meta.get('source', 'Unknown')}\n"
            if meta.get('filename'):
                evidence_text += f"Knowledge Base File: {meta.get('filename')}\n"
            if meta.get('jurisdiction'):
                evidence_text += f"Jurisdiction: {meta.get('jurisdiction')}\n"
            if meta.get('effective_from'):
                evidence_text += f"Effective From: {meta.get('effective_from')}\n"
            evidence_text += f"Legal Text: {meta.get('text', '')}\n"
        return evidence_text

    def review_document(self, document_text: str, evidence: List[Dict[str, Any]], provenance_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Runs the Opening Round for the Reviewer analyzing the entire document."""
        
        def attempt_review():
            evidence_text = self._format_evidence(evidence)
            prov_text = json.dumps(provenance_data, indent=2) if provenance_data else "{}"
            user_prompt = (
                f"Full Document Text:\n\"{document_text}\"\n\nProvenance:\n{prov_text}\n\n"
                f"Retrieved Legal Evidence:\n{evidence_text}\n\n"
                "Analyze the ENTIRE document based ONLY on the provided evidence. Perform a structured comparison.\n"
                "Identify ALL non-compliant clauses or risks. If the document is flawless, you MUST point out an area where the protection could be stronger or an ambiguity exists, outputting at least 1 finding.\n"
                "CRITICAL: exact_contract_quote may ONLY originate from the Full Document Text. Never quote Retrieved Legal Evidence in that field. "
                "Never paraphrase. The quote must be a contiguous source span."
            )
            
            response = self.client.generate_json_response(self.system_prompt_opening, user_prompt)
            return response

        response = attempt_review()
        
        if response.get("status") == "FAILED" or "error" in response:
            return response
            
        if "findings" not in response:
            if isinstance(response, list):
                 response = {"findings": response}
            else:
                 response = {"findings": [response]}

        # Validate quotes for all findings
        validated_findings = []
        for finding in response.get("findings", []):
            if "finding_id" not in finding:
                finding["finding_id"] = f"F-{str(uuid.uuid4())[:8]}"
            validated_finding = self._validate_and_recover_quote(finding, document_text)
            validated_findings.append(validated_finding)
            
        response["findings"] = validated_findings
        return response

    def _validate_and_recover_quote(self, response: Dict[str, Any], canonical_text: str) -> Dict[str, Any]:
        exact_quote = response.get("exact_contract_quote")
        if not exact_quote or not str(exact_quote).strip() or str(exact_quote).lower() == "null":
            response["grounding_status"] = "UNRESOLVED"
            return response
            
        exact_quote = str(exact_quote).strip()
        
        # 1. Exact Substring match
        if exact_quote in canonical_text:
            response["grounding_status"] = "VERIFIED"
            return response
            
        # 2. Deterministic recovery (Safe reconstruction via normalization)
        import re
        clean_q = re.sub(r'[^\w]', '', exact_quote).lower()
        clean_c = re.sub(r'[^\w]', '', canonical_text).lower()
        
        if clean_q and clean_q in clean_c:
            response["grounding_status"] = "RECOVERED"
            return response
            
        # 3. Rejected (Hallucination or completely unrelated)
        response["grounding_status"] = "REJECTED"
        return response

    def generate_rebuttal(self, original_findings: List[Dict[str, Any]], skeptic_challenges: List[Dict[str, Any]], evidence: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Runs the Rebuttal Round for the Reviewer for all findings."""
        evidence_text = self._format_evidence(evidence)
        user_prompt = f"Your Original Findings:\n{json.dumps(original_findings, indent=2)}\n\nSkeptic's Challenges:\n{json.dumps(skeptic_challenges, indent=2)}\n\nAvailable Evidence:\n{evidence_text}\n\nProvide your rebuttals for each finding."
        response = self.client.generate_json_response(self.system_prompt_rebuttal, user_prompt)
        
        if "rebuttals" not in response:
            if isinstance(response, list):
                 response = {"rebuttals": response}
            else:
                 response = {"rebuttals": [response]}
        return response

    def generate_closing(self, debate_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Runs the Closing Round for the Reviewer for all findings."""
        user_prompt = f"Debate History:\n{json.dumps(debate_history, indent=2)}\n\nProvide your closing statements for each finding summarizing why your position is correct based on the evidence."
        response = self.client.generate_json_response(self.system_prompt_closing, user_prompt)
        
        if "closings" not in response:
            if isinstance(response, list):
                 response = {"closings": response}
            else:
                 response = {"closings": [response]}
        return response
