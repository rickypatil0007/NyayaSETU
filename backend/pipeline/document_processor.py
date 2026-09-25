import os
import tempfile
import re
from typing import Dict, Any, List

class DocumentProcessor:
    @staticmethod
    def extract_pdf(file_path: str) -> Dict[str, Any]:
        """
        Extracts text from PDF page by page using pdfplumber.
        Detects structural boundaries, exact clauses, and extracts effective dates.
        Provides robust page-aware tracking for provenance.
        """
        import pdfplumber
        import logging
        
        clauses = []
        full_text = ""
        effective_date = None
        
        # Regex for date detection (e.g. "Effective Date: 2026-01-01", "entered into on [Date]")
        date_pattern = re.compile(r"(?:effective date|entered into on|dated this|made on)[\s:]{1,4}([0-9]{1,2}(?:st|nd|rd|th)?\s+[a-zA-Z]+\s+[0-9]{4}|[a-zA-Z]+\s+[0-9]{1,2},?\s+[0-9]{4}|[0-9]{4}-[0-9]{2}-[0-9]{2})", re.IGNORECASE)

        try:
            with pdfplumber.open(file_path) as pdf:
                pages = len(pdf.pages)
                for i, page in enumerate(pdf.pages):
                    text = page.extract_text(layout=True)  # Use layout to preserve spacing better
                    if not text:
                        text = page.extract_text() # fallback
                        if not text:
                            logging.warning(f"Failed to extract text on page {i+1}. May require OCR.")
                            continue
                        
                    full_text += text + "\n"
                    
                    if not effective_date:
                        match = date_pattern.search(text)
                        if match:
                            effective_date = match.group(1)
                    
                    # Split logic: Combine lines into paragraphs. 
                    # Instead of trusting \n\n, we look at line endings (e.g. if a line ends in ., ;, or : it might be a break)
                    # For legal documents, clauses are often numbered.
                    raw_lines = text.split("\n")
                    
                    paragraphs = []
                    current_para = []
                    
                    for line in raw_lines:
                        line_s = line.strip()
                        if not line_s:
                            if current_para:
                                paragraphs.append(" ".join(current_para))
                                current_para = []
                        else:
                            current_para.append(line_s)
                    
                    if current_para:
                        paragraphs.append(" ".join(current_para))
                    
                    # Filter out tiny artifacts
                    paragraphs = [p for p in paragraphs if len(p) > 30]
                    
                    # Two-pass processing for clauses vs structural elements
                    for p in paragraphs:
                        heading = ""
                        is_candidate = True
                        
                        # Check if it looks like a document title or preamble (all caps, short)
                        if (p.isupper() and len(p) < 100) or re.search(r"^(This Employment Agreement|This Agreement|Parties|Background|Recitals)", p, re.IGNORECASE):
                            heading = "PREAMBLE_OR_TITLE"
                            is_candidate = False
                            
                        clause_match = re.match(r"^(\d+(\.\d+)*\s*[A-Z][\w\s]+)", p)
                        if clause_match:
                            heading = clause_match.group(1).strip()
                        else:
                            # Try alphanumeric like "1. ", "a) "
                            alt_match = re.match(r"^([0-9a-zA-Z]+\.?[\)\.]\s+)", p)
                            if alt_match:
                                heading = alt_match.group(1).strip()
                            elif not heading:
                                # Not a clear clause number, might be preamble or schedule
                                if len(p) < 150 or re.search(r"entered into|between|hereinafter referred to as", p, re.IGNORECASE):
                                    is_candidate = False
                                    heading = "BOILERPLATE"
                                    
                        # Legal Issue Signal Detection (Critical Bug 7)
                        has_legal_signal = False
                        if is_candidate:
                            signal_pattern = r"(%|\b(?:percent|days|months|years|hours|statutory rate|applicable law|instead of|notwithstanding|liability|shall|must|minimum|maximum|cap|not less than|not more than)\b|[0-9]+)"
                            if re.search(signal_pattern, p, re.IGNORECASE):
                                has_legal_signal = True
                            
                        clauses.append({
                            "clause_text": p,
                            "page_number": i + 1,
                            "heading": heading,
                            "extraction_confidence": 0.95,
                            "extraction_method": "pdfplumber_layout",
                            "is_candidate": is_candidate,
                            "has_legal_signal": has_legal_signal
                        })
                        
        except Exception as e:
            logging.error(f"Error extracting PDF: {str(e)}")
            return {
                "pages": 0,
                "effective_date": None,
                "clauses": [],
                "full_text": "",
                "status": "EXTRACTION_FAILED"
            }
                        
        return {
            "pages": pages,
            "effective_date": effective_date,
            "clauses": clauses,
            "full_text": full_text,
            "status": "SUCCESS"
        }
