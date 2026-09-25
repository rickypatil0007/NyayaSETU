# NyaySetu PDF Processing Specification

**Project:** NyaySetu
**Module:** RAG Knowledge Base
**Document:** PDF Processing
**File:** `docs/rag/07-pdf-processing.md`
**Status:** Production Specification

---

# 1. Purpose

PDF is expected to be one of the primary document formats used by NyaySetu.

Legal and regulatory material frequently exists as:

* government PDFs;
* regulatory notifications;
* circulars;
* statutes;
* policy documents;
* compliance manuals;
* audit evidence;
* organizational procedures.

PDF processing must therefore preserve legal meaning, structure, page references, and provenance.

---

# 2. Core Requirement

The PDF processor must produce:

```text
PDF
 ↓
Pages
 ↓
Text
 ↓
Structure
 ↓
Sections
 ↓
Chunks
 ↓
Metadata
```

while preserving the relationship:

```text
chunk → section → page → document version
```

---

# 3. PDF Categories

The system should recognize:

### Type A — Native Text PDF

Text can be extracted directly.

### Type B — Scanned PDF

Pages contain images rather than machine-readable text.

### Type C — Hybrid PDF

Some pages contain text and others contain scanned images.

### Type D — Complex PDF

Text extraction is affected by:

* columns;
* tables;
* unusual fonts;
* multi-layer content;
* rotated pages;
* embedded objects.

---

# 4. Processing Strategy

Default:

```text
Native extraction
        ↓
Quality assessment
        ↓
OCR fallback when required
```

Do not OCR every PDF unnecessarily.

---

# 5. File Validation

Before parsing:

```text
file exists
file size > 0
valid PDF signature
parser can open file
page count > 0
```

---

# 6. PDF Signature

A PDF normally begins with a PDF header.

The system should validate file content rather than trusting:

```text
filename.endsWith(".pdf")
```

---

# 7. Page Count

Store:

```text
total_pages
```

This must be compared against extraction results.

Example:

```text
PDF reports 40 pages
Parser extracts 39 pages
```

must trigger a warning or failure depending on severity.

---

# 8. Page Identity

Each page should have:

```text
page_id
document_version_id
page_number
```

Page numbers should be zero- or one-based consistently across the entire application.

The user-facing citation layer should use human-friendly page numbering.

---

# 9. Raw Page Content

Preserve extracted page content.

Recommended:

```text
raw_text
```

This allows debugging.

---

# 10. Normalized Page Content

Create:

```text
normalized_text
```

separately.

Never destroy raw extraction output.

---

# 11. Extraction Engine

The implementation may use a reliable PDF extraction library compatible with the project runtime.

The architecture must abstract the parser behind an interface such as:

```text
extractPdf(file)
```

so the implementation can be replaced later.

---

# 12. Parser Abstraction

Conceptual interface:

```typescript
interface PdfExtractor {
  extract(file: Buffer): Promise<ExtractedPdf>;
}
```

Result:

```typescript
interface ExtractedPdf {
  pageCount: number;
  pages: ExtractedPage[];
}
```

---

# 13. Page Result

Conceptual:

```typescript
interface ExtractedPage {
  pageNumber: number;
  text: string;
  width?: number;
  height?: number;
  extractionMethod: "native" | "ocr";
}
```

---

# 14. Native Extraction

Native extraction should preserve text ordering as accurately as possible.

Potential problems include:

```text
column A
column B
```

being extracted as:

```text
A1
A2
B1
B2
```

when the intended reading order is:

```text
A1
B1
A2
B2
```

Quality checks are therefore required.

---

# 15. Reading Order

For legal documents, reading order matters.

Incorrect ordering can alter meaning.

The processor should attempt to preserve:

```text
heading
paragraph
subparagraph
list
table
footnote
```

sequence.

---

# 16. Multi-Column PDFs

Detect likely multi-column layouts when layout metadata is available.

Do not blindly concatenate all text objects.

---

# 17. Rotated Pages

Some PDFs contain rotated pages.

The processor should normalize page orientation for text extraction where possible while preserving the original page number.

---

# 18. Headers

Repeated headers may appear on every page.

Example:

```text
MINISTRY OF...
REGULATION...
```

Repeated content may be removed from normalized text if confidently identified.

---

# 19. Footers

Repeated footers may include:

```text
Page 4 of 50
Official Gazette
Confidential
```

These can interfere with semantic retrieval.

They may be removed from normalized retrieval text while retaining raw text.

---

# 20. Page Number Preservation

Even if the visible PDF footer says:

```text
Page 15
```

the system should preserve the physical PDF page index separately.

Recommended:

```text
pdf_page_number
printed_page_number
```

when detectable.

---

# 21. Printed Page Numbers

Printed page numbers can differ from PDF indexes.

Example:

```text
PDF page = 20
Printed page = 17
```

Both should be preserved if available.

---

# 22. OCR Trigger

OCR should be triggered when:

```text
extracted text is empty
```

or:

```text
extracted text quality < configured threshold
```

---

# 23. OCR Quality Heuristics

Potential indicators:

```text
characters < minimum threshold
```

```text
alphabetic_ratio < threshold
```

```text
garbled_character_ratio > threshold
```

```text
repeated_unknown_character_ratio > threshold
```

These should be configurable.

---

# 24. OCR Processing

Conceptually:

```text
PDF page
 ↓
render page image
 ↓
OCR engine
 ↓
recognized text
 ↓
OCR confidence
 ↓
normalized text
```

---

# 25. OCR Confidence

If available, store:

```text
ocr_confidence
```

Do not convert OCR confidence directly into legal confidence.

They represent different concepts.

---

# 26. OCR Language

OCR language should match the document.

Potential examples:

```text
English
Hindi
Marathi
```

depending on supported deployment configuration.

---

# 27. Hybrid OCR

For hybrid PDFs:

```text
Page 1 → native
Page 2 → native
Page 3 → OCR
Page 4 → native
```

must be supported.

Do not force the entire document through OCR.

---

# 28. OCR Cost

OCR can be computationally expensive.

Use it selectively.

Track:

```text
ocr_pages
total_pages
```

to measure OCR utilization.

---

# 29. Text Cleaning

Cleaning should be conservative.

Allowed:

* whitespace normalization;
* line-break repair;
* obvious extraction artifacts;
* repeated header removal.

Avoid:

* paraphrasing;
* summarizing;
* legal interpretation;
* changing numbers;
* removing clauses.

---

# 30. Number Preservation

Legal numbers are critical.

The processor must preserve:

```text
section numbers
dates
monetary amounts
percentages
penalty amounts
retention periods
thresholds
```

---

# 31. Legal Symbols

Preserve symbols such as:

```text
%
₹
$
>
<
≥
≤
§
```

where possible.

---

# 32. Dates

Dates should remain exactly represented in source text.

Do not automatically rewrite:

```text
01/02/2026
```

into:

```text
February 1, 2026
```

because jurisdictional date formats can be ambiguous.

---

# 33. Tables

Tables require special handling.

Example:

```text
Requirement | Frequency | Deadline
A            | Monthly   | 10 days
```

should retain relationships between columns and rows.

---

# 34. Table Extraction

Where reliable table extraction is available, store both:

```text
structured table
```

and:

```text
linearized table text
```

---

# 35. Table Linearization

Example:

```text
Requirement: Submit report
Frequency: Monthly
Deadline: 10th day
```

This form is often more useful for embedding.

---

# 36. Lists

Legal lists often contain:

```text
(a)
(b)
(c)
```

or:

```text
(i)
(ii)
(iii)
```

Preserve list markers.

---

# 37. Nested Lists

Preserve hierarchy:

```text
(a)
    (i)
    (ii)
(b)
```

Do not flatten without retaining parent relationships.

---

# 38. Headings

Headings should be identified where possible.

Example:

```text
4. Compliance Requirements
```

Store:

```text
section_number = 4
section_title = Compliance Requirements
```

---

# 39. Section Boundaries

A section may span multiple pages.

Example:

```text
Section 4 begins on page 10
Section 4 ends on page 13
```

The system must preserve this relationship.

---

# 40. Paragraph Boundaries

Paragraph boundaries should be preserved when detectable.

Potential metadata:

```text
paragraph_index
```

---

# 41. Footnotes

Footnotes should remain connected to the relevant page.

If a footnote modifies legal interpretation, it must remain retrievable.

---

# 42. Annexures

Detect:

```text
Annexure
Appendix
Schedule
Attachment
Exhibit
```

as separate structural regions where possible.

---

# 43. Schedules

Schedules can contain substantive requirements.

Do not classify them as optional metadata.

They must be indexed like other legal content.

---

# 44. References

Detect references to:

```text
Section 5
Rule 12
Schedule III
Notification No. ...
```

and preserve them.

---

# 45. Cross-Page Sentences

Avoid treating page boundaries as semantic boundaries.

Example:

```text
Page 10:
The organization shall maintain

Page 11:
records for seven years.
```

The normalized representation should preserve:

```text
The organization shall maintain records for seven years.
```

while still retaining both page references.

---

# 46. Chunking Interaction

PDF page boundaries are provenance boundaries, not necessarily chunk boundaries.

A chunk may cross a page boundary if required for semantic completeness.

---

# 47. Cross-Page Chunk Metadata

If a chunk spans pages:

```text
start_page = 10
end_page = 11
```

and optionally:

```text
pages = [10, 11]
```

---

# 48. Citation Interaction

The citation system must be able to show:

```text
Pages 10–11
Section 4.2
```

rather than only:

```text
Document XYZ
```

---

# 49. Extraction Errors

Possible errors:

```text
PDF_CORRUPT
PDF_NO_PAGES
PDF_PARSE_FAILED
PDF_TEXT_EXTRACTION_FAILED
PDF_OCR_FAILED
PDF_LAYOUT_UNCERTAIN
PDF_TABLE_EXTRACTION_FAILED
```

---

# 50. Warning Versus Failure

Not every extraction issue should fail ingestion.

Example:

```text
one table failed
```

may be a warning.

But:

```text
all pages contain unreadable text
```

should likely fail ingestion.

---

# 51. Quality Report

Each PDF should generate a processing quality report.

Example:

```json
{
  "pageCount": 50,
  "pagesExtracted": 50,
  "ocrPages": 12,
  "emptyPages": 0,
  "warnings": 2,
  "fatalErrors": 0
}
```

---

# 52. Processing Confidence

Store technical processing signals such as:

```text
extraction_quality
ocr_quality
structure_detection_quality
```

These are pipeline-quality metrics, not legal certainty.

---

# 53. Page Content Hash

Each page can have:

```text
SHA256(normalized_text)
```

This helps detect changes between document versions.

---

# 54. Version Comparison

If a new PDF is uploaded:

```text
old version
vs
new version
```

the system may compare page hashes.

This can quickly identify changed pages.

---

# 55. Amendment Detection

Page-level differences may help identify amendments.

However, automated comparison must not independently conclude legal effect.

---

# 56. Text Diff

Useful for administrative review:

```text
removed text
added text
modified text
```

The original documents must remain intact.

---

# 57. PDF Metadata

Extract standard PDF metadata when available:

```text
author
title
subject
creator
producer
creation_date
modification_date
```

Treat this metadata as informational unless independently verified.

---

# 58. Metadata Trust

PDF metadata must never automatically determine:

```text
legal authority
effective date
regulatory status
```

Those require trusted source information.

---

# 59. Security

PDF files may contain malicious or unexpected content.

The processing system should:

* sandbox parsing where possible;
* restrict resource consumption;
* limit page count;
* limit memory;
* limit execution time;
* reject suspicious files.

---

# 60. Resource Exhaustion

Protect against:

```text
decompression bombs
huge embedded images
extreme page dimensions
excessive OCR workload
```

Set processing timeouts and resource limits.

---

# 61. OCR Timeout

A single pathological page must not block the entire ingestion worker indefinitely.

Use page-level and job-level timeouts.

---

# 62. Retry

Retry only transient failures.

Example:

```text
OCR service unavailable
```

may be retryable.

Example:

```text
corrupt PDF structure
```

usually is not.

---

# 63. Observability

Record:

```text
document_id
page_count
extraction_duration
ocr_duration
table_extraction_duration
normalization_duration
```

---

# 64. Performance

Optimize:

* page extraction;
* OCR only when needed;
* batch processing;
* streaming large files;
* caching;
* avoiding repeated parsing.

---

# 65. Caching

Cache safe intermediate results:

```text
file_hash
→ extracted pages
```

or:

```text
page_hash
→ OCR result
```

when appropriate.

---

# 66. Cache Invalidation

If:

```text
parser_version
OCR version
normalization version
```

changes, cached output may no longer be valid.

Cache keys should include relevant processing versions.

---

# 67. Reproducibility

Store:

```text
parser_version
ocr_engine
ocr_version
normalization_version
```

for each processed document.

---

# 68. Manual Review

Documents with severe extraction uncertainty should be marked:

```text
REQUIRES_REVIEW
```

rather than silently becoming active.

---

# 69. Review UI

An administrator should ideally be able to inspect:

```text
Original PDF page
Extracted text
OCR text
Detected section
Processing warnings
```

side by side.

---

# 70. Legal Integrity Rule

The PDF processor must never:

```text
summarize
interpret
paraphrase
invent missing text
```

during extraction.

Its job is:

> **faithful transformation, not legal reasoning.**

---

# 71. Citation Integrity Rule

Every indexed chunk derived from a PDF must be traceable to at least:

```text
document_version_id
page_number
```

Preferably:

```text
section_number
paragraph_number
```

when available.

---

# 72. Example Processing

Input:

```text
50-page scanned regulatory PDF
```

Pipeline:

```text
Validate PDF
 ↓
50 pages detected
 ↓
Native extraction attempted
 ↓
45 pages usable
 ↓
5 pages below quality threshold
 ↓
OCR 5 pages
 ↓
Normalize text
 ↓
Detect sections
 ↓
Create page records
 ↓
Create chunks
 ↓
Generate embeddings
 ↓
Index vectors
 ↓
Verify citations
 ↓
ACTIVE
```

---

# 73. Example Hybrid Document

```text
Page 1 → native
Page 2 → native
Page 3 → OCR
Page 4 → OCR
Page 5 → native
```

Metadata:

```text
ocr_used = true
ocr_pages = [3, 4]
```

---

# 74. Example Failure

```text
100 pages expected
100 pages detected
100 pages rendered
80 pages extracted
20 pages OCR failed
```

The document should not become active if those 20 pages contain potentially substantive legal requirements.

---

# 75. Acceptance Criteria

A PDF processor is acceptable when it can:

* open valid PDFs;
* reject invalid PDFs;
* preserve page numbers;
* extract native text;
* detect poor extraction;
* invoke OCR selectively;
* preserve raw text;
* generate normalized text;
* identify headings;
* preserve lists;
* handle tables reasonably;
* preserve cross-page content;
* produce provenance;
* report warnings;
* report failures;
* operate within resource limits.

---

# 76. Testing Strategy

Test:

```text
simple text PDF
multi-column PDF
scanned PDF
hybrid PDF
table-heavy PDF
long PDF
rotated pages
footnotes
headers/footers
legal numbering
annexures
cross-page paragraphs
Unicode text
Indian-language text
corrupt PDF
empty PDF
oversized PDF
```

---

# 77. Golden Documents

Maintain a controlled test corpus.

Each document should have expected:

```text
page count
section count
important phrases
citation locations
OCR requirement
```

---

# 78. Regression Testing

When changing the parser:

```text
old extraction
vs
new extraction
```

should be compared.

Important legal phrases must not disappear unexpectedly.

---

# 79. Production Checklist

* [ ] PDF signature validation.
* [ ] Page count validation.
* [ ] Native extraction.
* [ ] OCR fallback.
* [ ] Hybrid PDF support.
* [ ] Page provenance.
* [ ] Raw text preservation.
* [ ] Normalized text preservation.
* [ ] Header/footer handling.
* [ ] Table handling.
* [ ] List handling.
* [ ] Legal heading detection.
* [ ] Annexure detection.
* [ ] Cross-page text preservation.
* [ ] Extraction quality checks.
* [ ] Resource limits.
* [ ] Timeout handling.
* [ ] Security isolation.
* [ ] Versioned parser configuration.
* [ ] Processing quality report.
* [ ] Manual review capability.
* [ ] Citation verification.
* [ ] Regression corpus.

---

# 80. Final Principle

PDF processing is not merely a technical preprocessing step.

For NyaySetu, it is part of the legal evidence chain.

Therefore:

```text
PDF
 ↓
Faithful extraction
 ↓
Preserved structure
 ↓
Preserved provenance
 ↓
Reliable chunks
 ↓
Reliable retrieval
 ↓
Defensible audit evidence
```

If extraction changes the meaning of a legal requirement, every downstream AI component becomes unreliable.

The PDF processor must therefore optimize for **fidelity first, retrieval quality second, speed third**.

### Code vs Architecture Drift Gap Analysis

| Area | Current | Target | Gap | Action |
|------|---------|--------|-----|--------|
| Embedding | `sentence-transformers` local pipeline verified in `embeddings.py` | External Hugging Face APIs | Code uses local processing | Update documentation to reflect local embedding strategy |
| Pinecone | Generic `nyayasetu` namespace verified in `vectorstore.py` | Isolated Legal vs Contract KBs | Code does not isolate tenants | Refactor namespace logic or update docs to reflect single namespace MVP |
