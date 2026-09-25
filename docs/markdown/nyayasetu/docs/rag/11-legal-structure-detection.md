# NyaySetu Legal Structure Detection Specification

**Project:** NyaySetu
**Module:** RAG Knowledge Base
**File:** `docs/rag/11-legal-structure-detection.md`
**Status:** Production Specification

---

# 1. Purpose

Legal and regulatory documents contain hierarchical structures that are significantly more meaningful than ordinary prose paragraphs.

Examples include:

* Parts;
* Chapters;
* Titles;
* Sections;
* Subsections;
* Clauses;
* Subclauses;
* Rules;
* Articles;
* Paragraphs;
* Schedules;
* Annexures;
* Appendices;
* Tables;
* Definitions;
* Footnotes.

NyaySetu must identify this structure after text extraction and cleaning so that downstream chunking, retrieval, citation, and audit reasoning operate on legally meaningful units.

The structure detector does **not** determine the legal meaning of a provision.

Its responsibility is to determine:

> **Where a legal unit begins, where it ends, what its parent is, and where it appears in the source document.**

---

# 2. Pipeline Position

Legal structure detection occurs after extraction and cleaning and before legal-aware chunking.

```text
Source Document
      ↓
PDF / OCR Processing
      ↓
Text Extraction
      ↓
Text Cleaning
      ↓
LEGAL STRUCTURE DETECTION
      ↓
Legal Chunking
      ↓
Embeddings
      ↓
Pinecone
```

---

# 3. Core Principle

The system must preserve the structure present in the original document whenever possible.

It must not invent hierarchy merely because a text pattern appears to resemble a legal heading.

---

# 4. Responsibilities

The structure detector is responsible for:

* heading detection;
* numbering detection;
* hierarchy construction;
* section boundaries;
* paragraph boundaries;
* clause boundaries;
* schedule detection;
* annexure detection;
* table boundaries;
* definition-section detection;
* continuation handling;
* cross-reference extraction;
* provenance preservation;
* structural confidence scoring.

---

# 5. Non-Responsibilities

The structure detector must not independently determine:

* whether an organization is compliant;
* whether a provision applies;
* whether an obligation has been satisfied;
* whether a legal interpretation is correct;
* whether a source is legally authoritative.

Those responsibilities belong to later stages.

---

# 6. Structural Representation

The output should represent a document as a tree.

```text
Document
│
├── Part I
│   ├── Chapter 1
│   │   ├── Section 1
│   │   │   ├── Subsection (1)
│   │   │   ├── Clause (a)
│   │   │   └── Clause (b)
│   │   └── Section 2
│
├── Part II
│   └── Chapter 2
│
└── Schedule I
```

---

# 7. Structural Node

A conceptual node:

```typescript
interface LegalStructureNode {
  id: string;
  type: LegalStructureType;
  label?: string;
  number?: string;
  title?: string;
  text: string;

  parentId?: string;
  children: string[];

  pageStart: number;
  pageEnd: number;

  sourceStartOffset?: number;
  sourceEndOffset?: number;

  confidence: number;
}
```

---

# 8. Structure Types

The initial type registry should support:

```text
DOCUMENT
TITLE
PART
CHAPTER
DIVISION
SUBDIVISION
ARTICLE
SECTION
RULE
REGULATION
SUBSECTION
PARAGRAPH
CLAUSE
SUBCLAUSE
ITEM
SCHEDULE
ANNEXURE
APPENDIX
DEFINITION
TABLE
FOOTNOTE
NOTE
```

The registry may be extended.

---

# 9. Numbering Patterns

Legal numbering can take many forms.

Examples:

```text
1
1.
1.1
1.1.1
(1)
(2)
(a)
(b)
(i)
(ii)
(A)
(B)
Article 5
Section 12
Rule 8
Schedule I
```

The parser must support configurable patterns rather than one universal regular expression.

---

# 10. Pattern Registry

Conceptually:

```typescript
interface StructurePattern {
  type: LegalStructureType;
  pattern: RegExp;
  priority: number;
  language?: string;
}
```

---

# 11. Heading Signals

A line may be considered a heading candidate based on:

* numbering;
* capitalization;
* typography metadata;
* short length;
* preceding whitespace;
* following whitespace;
* repeated structural patterns;
* page layout;
* font characteristics;
* alignment.

---

# 12. Typography Metadata

When PDF extraction provides typography information, preserve:

```text
font_family
font_size
font_weight
bold
italic
x_position
y_position
```

Typography can strengthen structural classification.

---

# 13. Text-Only Fallback

The system must still work when typography information is unavailable.

In that case, rely on:

* numbering;
* lexical patterns;
* position;
* whitespace;
* repetition;
* hierarchy consistency.

---

# 14. Confidence

Every detected structural node should have a confidence score.

Example:

```text
0.95 → highly reliable
0.75 → probable
0.50 → ambiguous
0.20 → weak
```

The exact thresholds are configurable.

---

# 15. Confidence Does Not Mean Legal Certainty

A structure confidence of `0.95` means:

> "The parser is highly confident this is a section heading."

It does not mean:

> "The legal interpretation is 95% certain."

---

# 16. Heading Detection

Heading candidates should be evaluated using multiple signals.

Conceptual score:

```text
structure_score =
  numbering_signal
+ typography_signal
+ position_signal
+ lexical_signal
+ hierarchy_signal
```

---

# 17. Numbering Signal

A recognized legal numbering pattern increases structural confidence.

---

# 18. Typography Signal

A line with larger or bold typography than surrounding body text may indicate a heading.

---

# 19. Position Signal

Headings frequently appear at consistent locations relative to surrounding text.

---

# 20. Lexical Signal

Words such as:

```text
Definitions
Scope
Application
Interpretation
Duties
Obligations
Penalties
Schedule
```

can provide supporting evidence.

They must not alone determine hierarchy.

---

# 21. Hierarchy Signal

A candidate is more reliable when it fits an existing numbering sequence.

Example:

```text
Section 4
Section 5
Section 6
```

---

# 22. Hierarchy Construction

The parser should maintain a stack of active structural nodes.

Conceptually:

```text
new node
 ↓
determine level
 ↓
pop incompatible parents
 ↓
attach to nearest valid parent
 ↓
push current node
```

---

# 23. Example

Input:

```text
PART II
GENERAL REQUIREMENTS

Chapter 3
Record Keeping

Section 7
Retention

(1) An organization shall...
```

Output:

```text
PART II
└── Chapter 3
    └── Section 7
        └── Subsection (1)
```

---

# 24. Numbering Level

The parser should map numbering to hierarchy where possible.

Example:

```text
7
7(1)
7(1)(a)
7(1)(a)(i)
```

may represent:

```text
Section
 └── Subsection
     └── Clause
         └── Subclause
```

---

# 25. Do Not Assume Universality

Different jurisdictions use different conventions.

The parser must support configurable jurisdiction/document profiles.

---

# 26. Document Profiles

A profile may define:

```typescript
interface LegalDocumentProfile {
  id: string;
  jurisdiction?: string;
  language?: string;

  structurePatterns: StructurePattern[];
  numberingRules: NumberingRule[];
}
```

---

# 27. Indian Legal Documents

For Indian legal/regulatory sources, the parser should be prepared for structures such as:

```text
Section
Sub-section
Clause
Sub-clause
Rule
Schedule
Explanation
Proviso
```

---

# 28. International Documents

The system should also support:

```text
Article
Paragraph
Subparagraph
Recital
Annex
Appendix
```

---

# 29. Definitions

Definitions are especially important in legal retrieval.

The detector should identify sections or clauses likely to contain definitions.

Examples:

```text
Definitions
Interpretation
Meaning of terms
In this Act, unless the context otherwise requires...
```

---

# 30. Definition Nodes

A definition may be represented as:

```typescript
interface DefinitionNode {
  term: string;
  definitionText: string;
  parentNodeId: string;
}
```

---

# 31. Definition Extraction

Definition extraction should remain conservative.

The system should preserve the exact definition text and source location.

---

# 32. Provisos

A proviso may modify an immediately preceding provision.

Example:

```text
Provided that...
```

The parser should attach the proviso to the appropriate parent provision where structurally identifiable.

---

# 33. Explanations

Legal texts may contain:

```text
Explanation
Explanation 1
Explanation 2
```

These should be represented as children of their relevant provision.

---

# 34. Illustrations

Some legal documents contain:

```text
Illustration
Illustrations
Example
```

These should remain structurally associated with their parent provision.

---

# 35. Exceptions

An exception may appear as:

```text
except that...
unless...
provided that...
subject to...
```

The structure detector should preserve these as part of the provision.

It should not decide their legal effect.

---

# 36. Tables

Tables must not be flattened without preserving their structure.

A table should retain:

```text
table_id
rows
columns
page
caption
```

---

# 37. Table Structure

Conceptually:

```text
TABLE
├── HEADER
├── ROW 1
├── ROW 2
└── ROW 3
```

---

# 38. Footnotes

Footnotes must remain distinguishable from primary legal text.

Do not silently merge them into a paragraph.

---

# 39. Footnote References

Preserve:

```text
footnote_number
footnote_text
page_number
reference_location
```

where available.

---

# 40. Page Continuation

A legal section may continue across pages.

Example:

```text
Page 10:
Section 7
(1) An organization...

Page 11:
shall retain...
```

The parser must not create a new section merely because a page changed.

---

# 41. Page Header Removal

Repeated page headers may be mistaken for legal headings.

The cleaning stage should identify repeated headers.

The structure detector should also detect suspicious repetition.

---

# 42. Page Footer Removal

Repeated page numbers, document identifiers, and footer text must not become structural nodes.

---

# 43. Running Headers

Example:

```text
DATA PROTECTION REGULATION
```

repeated on every page should generally not be interpreted as a new heading.

---

# 44. Continuation Detection

Signals include:

* absence of new numbering;
* sentence continuation;
* matching parent section;
* repeated page-header patterns;
* indentation continuity.

---

# 45. Broken Numbering

Documents may contain:

```text
Section 5
Section 7
```

with Section 6 missing from the extracted corpus.

Do not invent Section 6.

---

# 46. Malformed Numbering

OCR may produce:

```text
Sectlon 7
Sectlon l0
```

The parser should preserve the original text while optionally generating normalized structural metadata.

---

# 47. Original vs Normalized Text

Maintain:

```text
original_text
normalized_text
```

where normalization is performed.

---

# 48. Legal Text Preservation

Normalization must never replace the authoritative source text.

---

# 49. OCR Corrections

OCR corrections should be tracked separately.

Example:

```text
raw_ocr_text
corrected_text
correction_confidence
```

---

# 50. Ambiguous Structure

If the parser cannot confidently determine hierarchy:

```text
type = UNKNOWN
confidence = low
```

rather than inventing structure.

---

# 51. Unknown Nodes

Unknown structural nodes may still be useful for later review.

---

# 52. Human Review

Low-confidence structural classifications can be flagged for manual verification during corpus preparation.

---

# 53. Structural IDs

Each node should have a deterministic ID.

Example:

```text
docv_123_structure_00042
```

---

# 54. Deterministic Hash

Alternatively:

```text
hash(
 document_version_id
 + node_type
 + normalized_number
 + source_offset
)
```

---

# 55. Stability

IDs should remain stable when irrelevant metadata changes.

---

# 56. Source Coordinates

Where available, preserve:

```text
page
x
y
width
height
```

for visual traceability.

---

# 57. Page-Level Provenance

Every structural node must identify its page range.

---

# 58. Offset Provenance

When text extraction supports offsets, preserve:

```text
source_start_offset
source_end_offset
```

---

# 59. Cross-References

The parser should detect references such as:

```text
as provided in Section 7
under Rule 12
subject to Article 4
as specified in Schedule II
```

---

# 60. Cross-Reference Object

```typescript
interface LegalReference {
  sourceNodeId: string;
  targetText: string;
  targetType?: LegalStructureType;
  targetNumber?: string;
  confidence: number;
}
```

---

# 61. Cross-Reference Limitation

Detection of a reference does not prove that the referenced provision legally applies.

---

# 62. Reference Graph

Cross-references can later form:

```text
Section 7
   ↓
Section 12
   ↓
Schedule II
```

This graph can improve retrieval.

---

# 63. Structure Graph

The legal document can therefore be represented as:

```text
Hierarchy Tree
+
Cross-Reference Graph
```

---

# 64. Amendment Detection

Amendment documents may contain:

```text
substitution
insertion
omission
repeal
```

These should be detected as structural text patterns where possible.

---

# 65. Amendment Limitation

The structure detector does not resolve the consolidated legal text.

That belongs to regulation versioning/amendment handling.

---

# 66. Language

The detector should support language-specific pattern registries.

---

# 67. Unicode

Do not assume ASCII-only numbering or punctuation.

Support Unicode text safely.

---

# 68. Multilingual Documents

If a document contains multiple languages:

```text
language
language_confidence
```

may be attached to nodes.

---

# 69. Mixed-Language Structure

The structural hierarchy should remain independent from language.

---

# 70. Parsing Pipeline

Recommended:

```text
raw cleaned lines
 ↓
line classification
 ↓
heading candidates
 ↓
number extraction
 ↓
structure type classification
 ↓
hierarchy resolution
 ↓
continuation handling
 ↓
cross-reference detection
 ↓
provenance attachment
 ↓
validation
```

---

# 71. Line Classification

Possible classes:

```text
HEADING
BODY
NUMBERED_PARAGRAPH
TABLE
FOOTNOTE
HEADER
FOOTER
UNKNOWN
```

---

# 72. Number Extraction

Store separately:

```text
raw_number
normalized_number
```

---

# 73. Type Classification

Determine the likely structure type from:

* document profile;
* numbering;
* lexical signals;
* position;
* hierarchy.

---

# 74. Hierarchy Validation

Check for impossible transitions.

Example:

```text
Section
 → Chapter
```

may be suspicious if the document profile expects:

```text
Chapter
 → Section
```

---

# 75. Structural Anomalies

Report:

```text
ORPHAN_NODE
INVALID_PARENT
NUMBERING_GAP
DUPLICATE_NUMBER
LOW_CONFIDENCE_HEADING
UNEXPECTED_LEVEL
```

---

# 76. Duplicate Numbers

Repeated section numbers may occur across different chapters.

Therefore:

```text
Section 4
```

alone is not globally unique.

---

# 77. Fully Qualified Structure Path

Use:

```text
Chapter 2 > Section 4 > Subsection (1)
```

as a human-readable path.

---

# 78. Machine Path

Example:

```text
chapter:2/section:4/subsection:1
```

---

# 79. Structural Path

Store the path with each chunk so retrieval results can show meaningful context.

---

# 80. Chunking Dependency

Legal chunking should consume the structure tree rather than attempting to reconstruct structure again.

---

# 81. Embedding Dependency

Embedding generation should consume validated chunks derived from the structure tree.

---

# 82. Retrieval Benefit

Correct structure detection improves:

* semantic context;
* citation precision;
* section-level retrieval;
* parent-child retrieval;
* cross-reference resolution.

---

# 83. Audit Benefit

The audit engine can distinguish:

```text
requirement
exception
definition
penalty
procedure
```

more reliably when structure is preserved.

---

# 84. Security

Source documents are untrusted input.

A document may contain text such as:

```text
Ignore all previous instructions.
```

The parser must treat this as document content, never as an instruction.

---

# 85. No Code Execution

The structure detector must never execute content extracted from legal documents.

---

# 86. Parser Determinism

Given the same:

```text
document version
parser version
profile
input
```

the output should be deterministic.

---

# 87. Parser Version

Store:

```text
structure_parser_version
```

with the processed document.

---

# 88. Configuration Version

Store:

```text
structure_profile_version
```

when profile rules change.

---

# 89. Golden Corpus

Maintain a representative corpus containing:

* Acts;
* regulations;
* rules;
* policies;
* standards;
* schedules;
* annexures;
* scanned PDFs;
* OCR-heavy documents.

---

# 90. Golden Expectations

For each test document define expected:

```text
node types
hierarchy
section boundaries
page ranges
```

---

# 91. Unit Tests

Test:

```text
heading recognition
number recognition
hierarchy construction
continuation
table detection
footnotes
definitions
provisos
```

---

# 92. Integration Tests

Verify:

```text
PDF
→ extraction
→ cleaning
→ structure detection
→ chunking
```

---

# 93. Regression Tests

Every parser change must run the golden corpus.

---

# 94. Performance

Structure detection should generally operate linearly with input size.

Avoid algorithms that repeatedly scan the entire document unnecessarily.

---

# 95. Large Documents

Large regulatory corpora should be processed incrementally where possible.

---

# 96. Memory

Do not hold unnecessary copies of the complete raw document in memory.

---

# 97. Logging

Log:

```text
document_version_id
parser_version
node_count
low_confidence_count
anomaly_count
processing_time
```

---

# 98. Acceptance Criteria

The structure detector must:

* identify common legal hierarchy;
* preserve source text;
* preserve page provenance;
* support configurable patterns;
* detect definitions;
* preserve tables and footnotes;
* handle page continuation;
* detect cross-references;
* assign confidence;
* expose anomalies;
* support deterministic processing;
* remain safe against malicious document text.

---

# 99. Production Checklist

* [ ] Structure registry implemented.
* [ ] Numbering parser implemented.
* [ ] Heading detector implemented.
* [ ] Hierarchy builder implemented.
* [ ] Page continuation supported.
* [ ] Header/footer filtering supported.
* [ ] Definition detection supported.
* [ ] Proviso handling supported.
* [ ] Table handling supported.
* [ ] Footnote handling supported.
* [ ] Cross-reference detection supported.
* [ ] Provenance stored.
* [ ] Confidence stored.
* [ ] Parser version stored.
* [ ] Golden corpus created.
* [ ] Regression tests created.
* [ ] Security tests created.
* [ ] Performance tested.

---

# 100. Final Principle

> **Legal structure is evidence about how a document is organized, not permission to invent what the document means.**

NyaySetu must preserve the structure of the source faithfully and defer legal interpretation to the audit and reasoning layers.

### Code vs Architecture Drift Gap Analysis

| Area | Current | Target | Gap | Action |
|------|---------|--------|-----|--------|
| Embedding | `sentence-transformers` local pipeline verified in `embeddings.py` | External Hugging Face APIs | Code uses local processing | Update documentation to reflect local embedding strategy |
| Pinecone | Generic `nyayasetu` namespace verified in `vectorstore.py` | Isolated Legal vs Contract KBs | Code does not isolate tenants | Refactor namespace logic or update docs to reflect single namespace MVP |
