# NyaySetu Text Cleaning Specification

**Project:** NyaySetu
**Module:** RAG Knowledge Base
**Document:** Text Cleaning
**File:** `docs/rag/10-text-cleaning.md`
**Status:** Production Specification

---

# 1. Purpose

Text cleaning converts extracted text into a consistent representation suitable for:

* legal structure detection;
* chunking;
* embedding;
* retrieval;
* citation generation.

Cleaning must improve machine readability without changing substantive meaning.

---

# 2. Core Principle

The cleaning pipeline must be:

```text
CONSERVATIVE
REVERSIBLE
TRACEABLE
DETERMINISTIC
```

The system must never clean legal text by rewriting its meaning.

---

# 3. Three Text Layers

Maintain:

```text
RAW TEXT
    ↓
NORMALIZED TEXT
    ↓
RETRIEVAL TEXT
```

Where possible:

### Raw text

Exactly what the parser/OCR produced.

### Normalized text

Formatting artifacts corrected.

### Retrieval text

Optimized for semantic retrieval while preserving legal meaning.

---

# 4. Raw Text

Raw text must never be modified.

Example:

```text
raw_text =
parser output
```

This is the debugging and provenance layer.

---

# 5. Normalization

Allowed normalization may include:

* Unicode normalization;
* repeated whitespace cleanup;
* line-break normalization;
* safe hyphenation repair;
* repeated header/footer handling;
* obvious parser artifacts.

---

# 6. Prohibited Transformations

Do not:

* summarize;
* paraphrase;
* translate;
* simplify;
* remove legal exceptions;
* remove conditions;
* alter numbers;
* alter dates;
* change legal terminology.

---

# 7. Whitespace

Multiple spaces can generally be normalized.

Example:

```text
"The    organization"
```

may become:

```text
"The organization"
```

---

# 8. Tabs

Tabs may be converted to spaces when layout semantics are not lost.

Tables require special handling.

---

# 9. Newlines

PDF extraction frequently produces arbitrary line breaks.

Example:

```text
The organization shall
maintain records.
```

may become:

```text
The organization shall maintain records.
```

when the break is clearly caused by page layout.

---

# 10. Paragraph Boundaries

Do not remove meaningful paragraph boundaries.

Paragraphs may represent distinct legal obligations.

---

# 11. Hyphenation

PDF extraction may produce:

```text
compli-
ance
```

If the split is clearly caused by line wrapping:

```text
compliance
```

may be reconstructed.

---

# 12. Real Hyphens

Do not remove genuine hyphens.

Examples:

```text
risk-based
long-term
state-owned
```

must remain unchanged.

---

# 13. Hyphenation Safety

A correction should occur only when:

```text
line ends with hyphen
+
next line begins with lowercase continuation
+
pattern is consistent with word splitting
```

The original representation remains preserved.

---

# 14. Unicode Normalization

Normalize Unicode consistently.

This prevents visually equivalent characters from being treated as different strings.

---

# 15. Non-ASCII Characters

Preserve:

```text
₹
€
£
§
©
™
≥
≤
```

where relevant.

---

# 16. Currency Preservation

Do not convert:

```text
₹ 5,00,000
```

into:

```text
500000
```

without retaining the original form.

---

# 17. Percentage Preservation

Preserve:

```text
10%
```

rather than:

```text
10
```

---

# 18. Units

Preserve units:

```text
7 years
30 days
10 MB
5%
```

Units can be legally significant.

---

# 19. Dates

Preserve source date representation.

Do not silently normalize ambiguous dates.

---

# 20. Numbers

Numbers require special protection.

Never apply aggressive cleanup to:

```text
1,000
10.50
7.5%
₹10,000
Section 12A
```

---

# 21. Legal References

Preserve:

```text
Section 4
Rule 7
Article 21
Schedule II
Annexure A
```

---

# 22. Parentheses

Parentheses can indicate conditions and exceptions.

Never remove them automatically.

Example:

```text
(subject to Section 5)
```

must remain.

---

# 23. Brackets

Preserve:

```text
[...]
(...)
{...}
```

when they are part of source text.

---

# 24. Quotation Marks

Quotation marks can identify defined terms.

Preserve them.

---

# 25. Defined Terms

Example:

```text
"Personal Data" means...
```

The cleaning layer must preserve the quotation and capitalization.

---

# 26. Capitalization

Do not convert all text to lowercase.

Legal capitalization may indicate defined terms.

---

# 27. Headers

Repeated headers can reduce retrieval quality.

The pipeline may detect repeated header text.

Example:

```text
REGULATORY COMPLIANCE MANUAL
```

appearing on 100 pages.

---

# 28. Header Removal

Only remove a header from retrieval text when repetition is confidently established.

Keep it in raw text.

---

# 29. Footers

Repeated footers such as:

```text
Page 10 of 100
```

may be removed from retrieval text.

Again, preserve the raw form.

---

# 30. Page Numbers

Page markers should remain available as metadata.

Example:

```text
page_number = 10
```

---

# 31. Printed Page Numbers

If detected:

```text
printed_page_number = 7
```

should remain separate.

---

# 32. Boilerplate

Repeated boilerplate may include:

```text
Confidential
Official Copy
Generated on...
```

The system may suppress it from retrieval text if it has no semantic value.

---

# 33. Boilerplate Detection

A candidate repeated block can be detected by frequency.

Example:

```text
same text appears on >80% of pages
```

may be considered a repeated header/footer candidate.

Thresholds must be configurable.

---

# 34. Do Not Delete Unique Content

A block appearing once must not be classified as boilerplate simply because it resembles a header.

---

# 35. Lists

Preserve list markers.

Example:

```text
(a)
(b)
(c)
```

must remain.

---

# 36. Nested Lists

Preserve:

```text
(a)
    (i)
    (ii)
(b)
```

---

# 37. Bullets

Preserve meaningful bullet points.

Example:

```text
•
-
*
```

---

# 38. Bullet Normalization

Different bullet characters may be normalized to a consistent internal marker if the original is preserved.

Example:

```text
•
○
▪
```

may map internally to:

```text
-
```

but raw text remains unchanged.

---

# 39. Tables

Do not blindly flatten tables.

Tables should retain semantic relationships.

---

# 40. Table Cleaning

Clean:

* spacing;
* line breaks;
* repeated column headers.

Do not change:

* values;
* units;
* row relationships;
* column meaning.

---

# 41. Table Linearization

A table can be transformed into:

```text
Requirement: Record retention
Period: Seven years
Evidence: Retention policy
```

for retrieval.

---

# 42. Table Provenance

The linearized text must still reference:

```text
page
table_id
document_version
```

---

# 43. Footnote Cleaning

Footnote markers such as:

```text
¹
²
[1]
```

must remain associated with their footnotes.

---

# 44. Cross-Reference Cleaning

Do not remove:

```text
see Section 7
as defined under Rule 5
subject to Schedule III
```

These references are semantically important.

---

# 45. OCR Cleanup

OCR may introduce obvious errors.

Potential examples:

```text
Sectlon
compiiance
```

Corrections may be suggested but should preserve raw output.

---

# 46. Conservative OCR Correction

Only high-confidence mechanical corrections should be automated.

Never automatically change uncertain legal numbers.

---

# 47. Number Review

Flag uncertain patterns involving:

```text
dates
percentages
currency
section numbers
penalties
retention periods
thresholds
```

---

# 48. Character Replacement

Do not blindly remove unusual characters.

Some may be legitimate legal symbols.

---

# 49. Repeated Characters

OCR may produce:

```text
"coooompliance"
```

Such anomalies should be flagged rather than aggressively rewritten.

---

# 50. Broken Words

A broken word may result from:

* line wrapping;
* OCR;
* layout extraction.

Repair only when confidence is high.

---

# 51. Sentence Joining

Lines can be joined when they clearly belong to the same paragraph.

Example:

```text
The company shall
retain all records
for seven years.
```

becomes:

```text
The company shall retain all records for seven years.
```

---

# 52. Sentence Separation

Do not join separate legal clauses merely because they are adjacent.

---

# 53. Clause Preservation

Legal clauses often contain:

```text
provided that
except where
unless
subject to
notwithstanding
```

These words must never be accidentally removed.

---

# 54. Exceptions

Exceptions are particularly important for compliance analysis.

Cleaning must preserve them exactly.

---

# 55. Negative Language

Do not remove:

```text
not
no
unless
without
prohibited
shall not
```

Negation changes legal meaning.

---

# 56. Conditional Language

Preserve:

```text
if
where
when
provided that
subject to
only if
```

---

# 57. Modal Verbs

Preserve:

```text
shall
must
may
should
can
cannot
```

These can materially change obligation strength.

---

# 58. Legal Obligation Integrity

The cleaning pipeline must preserve:

```text
actor
action
condition
exception
deadline
frequency
threshold
```

---

# 59. Semantic Diff

When normalization changes text, the system may calculate:

```text
raw_text
vs
normalized_text
```

to detect unexpected modifications.

---

# 60. Cleaning Audit

Store:

```text
cleaning_version
cleaning_rules_version
cleaning_timestamp
```

---

# 61. Determinism

The same:

```text
raw text
+
cleaning version
+
configuration
```

should produce the same normalized text.

---

# 62. Cleaning Configuration

Potential settings:

```text
removeRepeatedHeaders
removeRepeatedFooters
repairHyphenation
normalizeWhitespace
normalizeUnicode
preservePageMarkers
```

---

# 63. Safe Defaults

Recommended defaults:

```text
normalizeWhitespace = true
normalizeUnicode = true
repairSafeHyphenation = true
removeRepeatedHeaders = cautious
removeRepeatedFooters = cautious
rewriteLegalText = false
```

---

# 64. No LLM by Default

Text cleaning should not require an LLM.

Deterministic processing is preferable for:

* reproducibility;
* cost;
* latency;
* legal integrity.

---

# 65. Optional LLM Assistance

If an LLM is ever used for cleaning:

* raw text must remain;
* changes must be diffable;
* output must be validated;
* legal numbers must be protected;
* the operation must be versioned;
* the LLM must not infer missing text.

For MVP, deterministic cleaning is preferred.

---

# 66. Prompt Injection

Cleaning must treat all document text as data.

Text such as:

```text
Ignore all previous instructions.
```

must not influence the cleaner's system behavior.

---

# 67. Security Boundary

The document can contain arbitrary instructions.

Those instructions must never become:

```text
application configuration
system prompts
tool commands
```

---

# 68. Cleaning Failure

If normalization fails:

```text
CLEANING_FAILED
```

must be returned.

The system should not silently use partially transformed output.

---

# 69. Fallback

A safe fallback is:

```text
raw extracted text
```

rather than fabricated or aggressively transformed text.

---

# 70. Cleaning Metrics

Track:

```text
characters_before
characters_after
lines_before
lines_after
headers_removed
footers_removed
hyphenations_repaired
warnings
```

---

# 71. Anomaly Detection

Flag:

```text
unexpected character deletion
large text reduction
large numeric change
large paragraph change
```

---

# 72. Maximum Change Threshold

If normalization changes an unexpectedly large proportion of a document:

```text
change_ratio > configured_threshold
```

mark:

```text
REQUIRES_REVIEW
```

---

# 73. Numeric Diff

Compare numeric tokens before and after cleaning.

Example:

```text
Before: 7 years
After: 7 years
```

valid.

But:

```text
Before: 7 years
After: 1 years
```

must trigger a critical warning.

---

# 74. Date Diff

Compare date-like expressions before and after cleaning.

Unexpected changes require review.

---

# 75. Currency Diff

Compare monetary expressions before and after cleaning.

Currency changes must never occur silently.

---

# 76. Legal-Term Diff

Important legal terms can be monitored:

```text
shall
must
may
not
unless
subject
except
```

Unexpected removal should fail validation.

---

# 77. Retrieval Text

The final retrieval representation may include:

```text
section title
section number
paragraph
table context
page marker
```

to improve retrieval.

---

# 78. Retrieval Context Example

Instead of embedding only:

```text
Organizations shall retain records...
```

the retrieval text may include:

```text
Document: Record Retention Regulation
Section: 7 — Retention Requirements
Page: 14

Organizations shall retain records...
```

This improves contextual understanding.

---

# 79. Citation Separation

Retrieval enrichment must not replace original text.

Store:

```text
original_text
retrieval_text
```

separately.

---

# 80. Chunking Interface

Cleaning outputs:

```text
CleanDocument
    ↓
Legal Structure Detection
    ↓
Chunking
```

---

# 81. Example Data Model

```typescript
interface CleanedText {
  rawText: string;
  normalizedText: string;
  retrievalText: string;
  cleaningVersion: string;
  warnings: CleaningWarning[];
}
```

---

# 82. Warning Model

```typescript
interface CleaningWarning {
  code: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  page?: number;
}
```

---

# 83. High-Risk Warnings

Examples:

```text
NUMERIC_CHANGED
DATE_CHANGED
LEGAL_TERM_REMOVED
LARGE_TEXT_LOSS
SECTION_NUMBER_CHANGED
```

These should normally require review.

---

# 84. Testing

Test:

```text
normal PDF extraction
OCR text
legal numbering
tables
footnotes
hyphenation
headers
footers
Unicode
currency
percentages
dates
negative statements
exceptions
```

---

# 85. Golden Tests

Expected outputs should verify:

```text
critical phrases preserved
numbers preserved
dates preserved
legal terms preserved
section identifiers preserved
```

---

# 86. Property-Based Tests

Useful properties:

```text
normalized text must not introduce new legal numbers
normalized text must not delete all negations
normalized text must preserve section identifiers
```

---

# 87. Regression Tests

Any cleaning-rule modification must run against the entire golden corpus.

---

# 88. Human Review

Documents producing critical cleaning warnings should be reviewable.

Reviewer should see:

```text
Original
Normalized
Diff
Warning
Page
```

---

# 89. Versioning

Cleaning rules must be versioned.

Example:

```text
cleaning_version = 1.3.0
```

---

# 90. Reprocessing

A document can be reprocessed with a newer cleaning version without modifying the original source.

---

# 91. Audit Reproducibility

An audit should retain:

```text
cleaning_version
```

used to create its evidence.

---

# 92. Storage

Recommended:

```text
Raw extraction
→ durable storage/database

Normalized text
→ database

Retrieval text
→ chunk storage/vector metadata
```

---

# 93. Privacy

Cleaning logs should not expose sensitive document contents unnecessarily.

---

# 94. Logging

Log:

```text
document_id
version_id
cleaning_version
duration
warnings
status
```

Avoid logging entire documents.

---

# 95. Performance

Cleaning should be deterministic and inexpensive compared with:

* OCR;
* embedding;
* LLM inference.

---

# 96. Batch Processing

Multiple pages should be processed efficiently while preserving page boundaries.

---

# 97. Failure Isolation

A malformed page should not corrupt the entire document.

However, if the malformed page contains substantive content, the document must not be marked fully verified.

---

# 98. Production Checklist

* [ ] Raw text preserved.
* [ ] Normalized text separate.
* [ ] Retrieval text separate.
* [ ] Whitespace normalization.
* [ ] Unicode normalization.
* [ ] Safe hyphenation repair.
* [ ] Header handling.
* [ ] Footer handling.
* [ ] Number preservation.
* [ ] Date preservation.
* [ ] Currency preservation.
* [ ] Legal numbering preservation.
* [ ] Negation preservation.
* [ ] Exception preservation.
* [ ] Table preservation.
* [ ] Footnote preservation.
* [ ] Cross-reference preservation.
* [ ] Numeric diff validation.
* [ ] Cleaning versioning.
* [ ] Deterministic behavior.
* [ ] Prompt-injection boundary.
* [ ] Regression tests.
* [ ] Human review.
* [ ] Audit reproducibility.

---

# 99. Final Principle

Text cleaning exists to remove **formatting noise**, not **legal meaning**.

The system should always prefer:

```text
slightly messy but faithful text
```

over:

```text
beautifully formatted but legally altered text
```

Therefore:

> **Clean the representation, never clean away the law.**

### Code vs Architecture Drift Gap Analysis

| Area | Current | Target | Gap | Action |
|------|---------|--------|-----|--------|
| Embedding | `sentence-transformers` local pipeline verified in `embeddings.py` | External Hugging Face APIs | Code uses local processing | Update documentation to reflect local embedding strategy |
| Pinecone | Generic `nyayasetu` namespace verified in `vectorstore.py` | Isolated Legal vs Contract KBs | Code does not isolate tenants | Refactor namespace logic or update docs to reflect single namespace MVP |
