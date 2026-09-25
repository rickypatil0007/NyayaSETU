import json
import google.generativeai as genai
from app.core.config import settings
from pydantic import BaseModel
from typing import Type, TypeVar

T = TypeVar("T", bound=BaseModel)

class LLMProvider:
    def __init__(self):
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel(settings.gemini_model_id)

    def generate_structured(self, system_instruction: str, prompt: str, schema: Type[T]) -> T:
        """
        Generate structured output using Gemini, parsed into a Pydantic model.
        """
        schema_json = json.dumps(schema.model_json_schema(), indent=2)
        full_prompt = f"""{system_instruction}

You MUST respond with valid JSON matching this exact schema:
{schema_json}

---
{prompt}
---

Respond ONLY with valid JSON. No markdown, no explanation, no code fences."""

        response = self.model.generate_content(full_prompt)
        text = response.text.strip()
        
        # Strip markdown code fences if present
        if text.startswith("```"):
            lines = text.split("\n")
            # Remove first and last lines (```json and ```)
            text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
        
        parsed = json.loads(text)
        return schema.model_validate(parsed)

    def generate_text(self, system_instruction: str, prompt: str) -> str:
        """Simple text generation."""
        full_prompt = f"{system_instruction}\n\n{prompt}"
        response = self.model.generate_content(full_prompt)
        return response.text.strip()
