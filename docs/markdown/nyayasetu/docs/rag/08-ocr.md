# NyaySetu OCR Specification

**Project:** NyaySetu
**Module:** RAG Knowledge Base
**Document:** OCR
**File:** `docs/rag/08-ocr.md`
**Status:** Production Specification

---

# 1. Purpose

Optical Character Recognition (OCR) enables NyaySetu to process scanned and image-based legal documents.

OCR is a recovery mechanism for documents where reliable machine-readable text is unavailable.

The OCR subsystem must prioritize:

1. textual fidelity;
2. page provenance;
3. legal-number preservation;
4. extraction confidence;
5. reproducibility;
6. controlled resource usage.

OCR output must never be treated as automatically authoritative merely because it was successfully extracted.

---

# 2. OCR Architecture

```text
PDF
 ↓
Page Detection
 ↓
Native Text Extraction
 ↓
Quality Assessment
 ↓
 ┌───────────────────────┐
 │ Text quality adequate │
 └───────────┬───────────┘
             │
             ▼
       Use native text

OR

 ┌───────────────────────┐
 │ Text quality poor     │
 └───────────┬───────────┘
             ▼
        Render page
             ↓
            OCR
             ↓
      Quality assessment
             ↓
       Normalization
             ↓
       Structure detection
```

---

# 3. OCR Trigger Conditions

OCR should be considered when:

* extracted text is empty;
* extracted text is extremely short;
* extracted text contains excessive garbage characters;
* text extraction produces abnormal character ratios;
* a page is identified as image-only;
* the native parser reports extraction failure.

---

# 4. OCR Must Be Selective

Do not automatically OCR every document.

Example:

```text
100-page PDF
97 pages have good native text
3 pages are scanned
```

Process:

```text
97 pages → native extraction
3 pages → OCR
```

This reduces processing cost and latency.

---

# 5. OCR Decision Function

Conceptually:

```typescript
function shouldUseOCR(page: PageExtraction): boolean {
  if (!page.text) return true;
  if (page.text.length < MIN_TEXT_LENGTH) return true;
  if (page.qualityScore < OCR_THRESHOLD) return true;

  return false;
}
```

Thresholds must be configurable.

---

# 6. Quality Score

A technical OCR decision score may consider:

```text
text_length
alphabetic_ratio
numeric_ratio
garbage_character_ratio
whitespace_ratio
repeated_character_ratio
```

Example:

```text
qualityScore =
  weighted(textLength)
  +
  weighted(alphabeticRatio)
  -
  weighted(garbageRatio)
```

This is an engineering heuristic, not legal confidence.

---

# 7. OCR Rendering

For OCR, PDF pages are typically rendered into images.

Conceptual pipeline:

```text
PDF Page
 ↓
Rasterization
 ↓
Image
 ↓
OCR Engine
```

---

# 8. Resolution

OCR accuracy depends partly on rendering resolution.

A configurable DPI should be used.

A practical starting point may be:

```text
200–300 DPI
```

The exact value should be evaluated against:

* accuracy;
* processing time;
* memory usage;
* document type.

---

# 9. Adaptive Resolution

If OCR quality is poor, the system may retry using a higher resolution.

Example:

```text
250 DPI
 ↓
poor confidence
 ↓
300 DPI
 ↓
retry
```

Avoid unlimited retries.

---

# 10. OCR Languages

OCR configuration should support language selection.

Initial supported languages may include:

```text
English
Hindi
Marathi
```

Additional languages can be added later.

---

# 11. Language Detection

Where practical:

```text
PDF
 ↓
language detection
 ↓
OCR language selection
```

However, automatic language detection must not prevent manual override.

---

# 12. Mixed-Language Documents

A legal document may contain:

```text
English text
+
Hindi text
+
numeric references
```

OCR must support multilingual pages where the selected OCR engine allows it.

---

# 13. OCR Output

Store:

```text
ocr_text
ocr_confidence
ocr_engine
ocr_engine_version
ocr_language
ocr_timestamp
```

---

# 14. Raw OCR Preservation

Never overwrite:

```text
raw_text
```

with OCR output.

Recommended:

```text
raw_native_text
raw_ocr_text
normalized_text
```

---

# 15. OCR Provenance

Each OCR result must identify:

```text
document_version_id
page_id
page_number
```

This is mandatory for citations.

---

# 16. OCR Confidence

If word-level or page-level confidence is available, preserve it.

Example:

```text
page_confidence = 0.94
```

This means OCR quality is estimated at 94%.

It does not mean:

```text
legal confidence = 94%
```

---

# 17. Word-Level Confidence

If supported, store confidence for individual tokens or regions.

This is useful for detecting:

* uncertain numbers;
* dates;
* section identifiers;
* monetary amounts.

---

# 18. Legal Number Protection

OCR errors in numbers can be especially dangerous.

Examples:

```text
7 years
```

being incorrectly recognized as:

```text
1 years
```

or:

```text
₹10,000
```

being recognized as:

```text
₹1000
```

must be treated as high-risk extraction errors.

---

# 19. Numeric Validation

The pipeline should flag pages containing:

* dates;
* percentages;
* monetary amounts;
* retention periods;
* thresholds;
* section numbers.

for additional quality checks where practical.

---

# 20. Date Detection

Potential date patterns:

```text
01/09/2026
01-09-2026
1 September 2026
September 1, 2026
```

The system should preserve the source representation.

It should not silently reinterpret ambiguous dates.

---

# 21. Section Number Detection

OCR should preserve legal numbering such as:

```text
Section 7
Section 7A
Rule 12
Article 14
Schedule III
```

If OCR produces suspicious variants, flag them for validation.

---

# 22. Character Confusion

Common OCR confusions include:

```text
O ↔ 0
I ↔ 1
l ↔ 1
S ↔ 5
B ↔ 8
```

The system must not blindly autocorrect them.

Legal text requires conservative correction.

---

# 23. Context-Aware Correction

Potential corrections may be suggested using context.

Example:

```text
Sectlon 5
```

may likely be:

```text
Section 5
```

But automated corrections must preserve the original OCR text.

---

# 24. Dual Representation

Recommended:

```text
raw_ocr_text
normalized_ocr_text
```

If corrections are made:

```text
raw_ocr_text
    ↓
normalized_ocr_text
```

must remain reversible.

---

# 25. OCR Quality Warnings

Potential warnings:

```text
LOW_OCR_CONFIDENCE
NUMERIC_UNCERTAINTY
LAYOUT_UNCERTAINTY
LANGUAGE_UNCERTAINTY
TABLE_OCR_UNCERTAINTY
```

---

# 26. Tables and OCR

Tables are difficult for OCR.

The system should attempt to preserve:

```text
rows
columns
headers
cell relationships
```

where supported.

If table reconstruction is unreliable, preserve a linearized representation and flag the uncertainty.

---

# 27. Legal Tables

Example:

```text
Requirement | Deadline | Penalty
```

must not become:

```text
Requirement Deadline Penalty
```

without retaining enough structure to understand which value belongs to which column.

---

# 28. Multi-Column OCR

OCR output must respect reading order.

Potential page:

```text
Column A | Column B
```

must not produce arbitrary interleaving.

---

# 29. Reading Order Validation

Potential checks:

* heading appears before body;
* paragraph ordering is plausible;
* columns are not interleaved;
* list numbering remains sequential.

---

# 30. Header/Footer Detection

OCR frequently recognizes repeated headers and footers.

Repeated boilerplate may be removed from normalized retrieval text.

Original OCR output must remain available.

---

# 31. Page Number Detection

OCR may identify printed page numbers.

Store separately:

```text
pdf_page_number
printed_page_number
```

when reliably detected.

---

# 32. OCR on Annexures

Annexures and schedules must receive the same processing treatment as the primary document.

They can contain substantive legal requirements.

---

# 33. OCR on Signatures

Signature regions may not contain useful semantic text.

However, signature text or dates may be relevant evidence.

The system should not automatically delete them.

---

# 34. OCR on Stamps

Official stamps can contain:

* dates;
* authority names;
* approval information;
* registration information.

Where OCR can recover meaningful text, preserve it.

---

# 35. OCR on Handwriting

Handwritten content should not be assumed to be accurately recognized.

If handwriting OCR is unsupported or unreliable:

```text
HANDWRITING_UNCERTAIN
```

should be recorded.

---

# 36. OCR and Legal Fidelity

OCR is an extraction technology.

It must not:

* summarize;
* interpret;
* rewrite;
* simplify;
* infer missing legal text.

---

# 37. Missing Text

If OCR cannot recover a section:

```text
MISSING_TEXT
```

must be represented explicitly.

The model must not fill the missing section from its own knowledge.

---

# 38. Partial OCR

If only part of a page is readable:

```text
readable region
+
unreadable region
```

should be represented accordingly.

---

# 39. OCR Retry Policy

Recommended:

```text
Attempt 1:
default DPI + default OCR configuration

Attempt 2:
alternative OCR configuration

Attempt 3:
higher DPI or alternate engine
```

Then stop.

---

# 40. OCR Failure

Example:

```text
OCR engine failed
```

should produce:

```text
OCR_FAILED
```

and should not produce fabricated text.

---

# 41. Resource Limits

OCR workers must have:

* memory limits;
* CPU limits;
* page limits;
* timeout limits;
* concurrency limits.

---

# 42. Worker Isolation

OCR processing should ideally occur in an isolated worker environment.

The parser should not have unnecessary access to:

* application secrets;
* database credentials;
* unrelated user data.

---

# 43. Security

Treat the PDF and rendered images as untrusted input.

Defend against:

* malformed PDFs;
* oversized images;
* decompression attacks;
* resource exhaustion;
* malicious embedded content.

---

# 44. Temporary Files

Rendered page images should use controlled temporary storage.

After processing:

```text
temporary image
 ↓
delete securely
```

unless retention is explicitly required.

---

# 45. OCR Caching

OCR results may be cached using:

```text
document_hash
+
page_hash
+
ocr_engine_version
+
ocr_configuration
```

This prevents unnecessary repeated OCR.

---

# 46. Cache Invalidation

Invalidate OCR cache when:

```text
OCR engine changes
OCR configuration changes
page content changes
```

---

# 47. OCR Versioning

Store:

```text
ocr_engine
ocr_engine_version
ocr_configuration_version
```

This allows future reproducibility.

---

# 48. OCR Metrics

Track:

```text
ocr_pages
ocr_success_pages
ocr_failed_pages
average_confidence
average_processing_time
retry_count
```

---

# 49. Quality Thresholds

The system should define configurable thresholds such as:

```text
OCR_MIN_CONFIDENCE
OCR_MIN_TEXT_LENGTH
OCR_MAX_GARBAGE_RATIO
OCR_MAX_RETRY_COUNT
```

Exact values should be determined empirically using the evaluation corpus.

---

# 50. Manual Verification

High-risk OCR output should support human verification.

Particularly:

```text
dates
numbers
penalties
thresholds
section numbers
effective dates
```

---

# 51. Human Review Queue

Potential state:

```text
OCR_REVIEW_REQUIRED
```

Reviewers should be able to compare:

```text
original page image
OCR text
normalized text
```

---

# 52. OCR Audit Trail

Record:

```text
who initiated processing
when processing occurred
engine version
configuration
result
warnings
```

---

# 53. OCR Reprocessing

An administrator should be able to trigger:

```text
re-run OCR
```

without replacing the original source.

---

# 54. Native Versus OCR Selection

If both native and OCR text are available:

```text
native quality high
→ prefer native

native quality poor
→ prefer OCR

both uncertain
→ flag review
```

---

# 55. Hybrid Page Example

```text
Page 1:
native text

Page 2:
OCR

Page 3:
native text

Page 4:
OCR
```

The final document representation must preserve the extraction method per page.

---

# 56. OCR and Embeddings

Only validated normalized text should be embedded.

Do not embed:

```text
garbled OCR output
```

without quality checks.

---

# 57. OCR and Citations

Every OCR-derived chunk must retain:

```text
page_number
document_version_id
```

so the final finding can cite the original PDF page.

---

# 58. OCR and Agents

Agents must be informed when evidence is OCR-derived if that metadata is available.

Example:

```json
{
  "extractionMethod": "ocr",
  "ocrConfidence": 0.82
}
```

This allows agents to account for extraction uncertainty.

---

# 59. OCR and Confidence

The system should distinguish:

```text
retrieval confidence
OCR confidence
agent confidence
legal confidence
```

These must never be represented as the same score.

---

# 60. Testing

OCR must be tested against:

```text
clean scans
low-resolution scans
rotated scans
multi-column scans
tables
legal numbering
small fonts
mixed languages
stamps
footnotes
annexures
```

---

# 61. Golden OCR Tests

Each golden document should have expected text fragments.

Example:

```text
Expected:
"Section 7"

Expected:
"seven years"

Expected:
"10%"
```

The regression suite should verify their preservation.

---

# 62. Numeric Regression

Special tests should verify that:

```text
₹10,000
10%
7 years
2026
Section 12A
```

are not corrupted by OCR processing.

---

# 63. OCR Acceptance Criteria

OCR processing is acceptable when:

* scanned pages can be processed;
* page provenance is preserved;
* extraction method is recorded;
* confidence is retained where available;
* raw output is preserved;
* normalized output is separate;
* legal numbers receive quality checks;
* failures are explicit;
* resource limits exist;
* results are reproducible.

---

# 64. Production Checklist

* [ ] OCR trigger logic exists.
* [ ] OCR is selective.
* [ ] Page rendering is controlled.
* [ ] OCR language is configurable.
* [ ] OCR confidence is stored.
* [ ] Raw OCR text is preserved.
* [ ] Normalized OCR text is separate.
* [ ] Numeric validation exists.
* [ ] Legal numbering is preserved.
* [ ] Table handling exists.
* [ ] Multi-column handling exists.
* [ ] Header/footer detection exists.
* [ ] OCR failures are explicit.
* [ ] Retry limits exist.
* [ ] Resource limits exist.
* [ ] Temporary files are controlled.
* [ ] OCR results are versioned.
* [ ] OCR caching is safe.
* [ ] Human review is supported.
* [ ] Regression tests exist.
* [ ] Citation provenance is preserved.

---

# 65. Final Principle

OCR should never hide uncertainty.

The system should prefer:

```text
"I could not reliably extract this page."
```

over:

```text
a plausible but incorrect legal sentence
```

For NyaySetu:

> **An explicit extraction failure is safer than a fabricated legal fact.**

### Code vs Architecture Drift Gap Analysis

| Area | Current | Target | Gap | Action |
|------|---------|--------|-----|--------|
| Embedding | `sentence-transformers` local pipeline verified in `embeddings.py` | External Hugging Face APIs | Code uses local processing | Update documentation to reflect local embedding strategy |
| Pinecone | Generic `nyayasetu` namespace verified in `vectorstore.py` | Isolated Legal vs Contract KBs | Code does not isolate tenants | Refactor namespace logic or update docs to reflect single namespace MVP |
