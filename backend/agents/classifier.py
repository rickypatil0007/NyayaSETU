import json
from typing import Dict, Any
from backend.agents.llm_router import LLMRouter

class DocumentClassifierAgent:
    def __init__(self, client: LLMRouter = None):
        self.client = client or LLMRouter()
        
        self.system_prompt = """
        You are the Document Classification Agent for NyayaSETU.
        Your task is to analyze the raw text of a legal document and determine its core properties.
        Do not hallucinate. If a property is genuinely missing or unclear, output 'UNCERTAIN'.

        You MUST return ONLY a JSON object with the following exact keys:
        - "document_type": e.g., 'Employment Terms Agreement', 'SaaS Agreement', 'NDA', 'DPA'
        - "contract_type": A broader category (e.g., 'Employment Agreement', 'Commercial Contract')
        - "jurisdiction": The explicitly stated jurisdiction (e.g., 'India', 'India / Maharashtra', 'US / California'). 
        - "governing_law": The stated governing law.
        - "industry": The relevant industry (e.g., 'Technology', 'Healthcare')
        - "party_roles": A short list or description of who the parties are (e.g., 'Employer and Employee', 'Service Provider and Client')
        - "effective_date": The stated effective date or execution date (format YYYY-MM-DD if possible).
        - "classification_confidence": Integer 0-100.
        """

    def classify_document(self, full_text: str) -> Dict[str, Any]:
        """Runs the document classification on the extracted text."""
        # We only need the first few thousand characters to determine document type usually
        sample_text = full_text[:4000] if full_text else ""
        
        user_prompt = f"Analyze the following contract text excerpt and classify it:\n\n{sample_text}"
        response = self.client.generate_json_response(self.system_prompt, user_prompt)
        
        if "error" in response:
            return {
                "document_type": "UNCERTAIN",
                "contract_type": "UNCERTAIN",
                "jurisdiction": "UNCERTAIN",
                "classification_confidence": 0,
                "error": response["error"]
            }
            
        return response

