import os
import json
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load env variables from env/.env
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "env", ".env"))

try:
    import google.generativeai as genai
except ImportError:
    print("Please install google-generativeai: pip install google-generativeai")

class GeminiClient:
    def __init__(self, model_name: str = None):
        """
        Initializes the Gemini API client using the GEMINI_API_KEY environment variable.
        This uses the free tier of Google Gemini API.
        """
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if not model_name:
            model_name = os.environ.get("GEMINI_MODEL", "gemini-1.5-pro")
        if not self.api_key:
            print("WARNING: GEMINI_API_KEY environment variable not set.")
            
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(model_name)
        else:
            self.model = None
            
    def generate_json_response(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """
        Calls Gemini and expects a JSON response. 
        In production, we can use `response_mime_type="application/json"` with the newer Gemini SDK.
        """
        if not self.model:
            raise RuntimeError("Gemini model not initialized. Check your API key.")
            
        full_prompt = f"{system_prompt}\n\nUser Input:\n{user_prompt}\n\nPlease respond ONLY with valid JSON."
        
        try:
            # For Gemini 1.5 Pro, we can enforce JSON output
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                )
            )
            
            # Parse the JSON response
            text = response.text.strip()
            # Handle potential markdown code blocks if the model still includes them
            if text.startswith("```json"):
                text = text[7:-3]
            elif text.startswith("```"):
                text = text[3:-3]
                
            return json.loads(text.strip())
            
        except Exception as e:
            print(f"Error generating JSON response from Gemini: {e}")
            return {"error": str(e), "status": "FAILED"}

if __name__ == "__main__":
    # Test initialization
    client = GeminiClient()
    print("Gemini test script complete.")
