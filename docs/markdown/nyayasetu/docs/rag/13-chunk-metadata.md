# NyaySetu Chunk Metadata Specification

**Project:** NyaySetu
**Module:** RAG Knowledge Base
**File:** `docs/rag/13-chunk-metadata.md`
**Status:** Production Specification

---

# 1. Purpose

Chunk metadata makes every NyaySetu retrieval unit:

* identifiable;
* traceable;
* filterable;
* version-aware;
* citation-ready;
* tenant-safe;
* auditable.

The chunk text alone is insufficient for a legal compliance system.

Every retrieved chunk must be connected to its source and processing history.

---

# 2. Metadata Architecture

```text
Legal Source
     ↓
Document
     ↓
Document Version
     ↓
Structure Node
     ↓
Chunk
     ↓
Chunk Metadata
     ↓
Embedding
     ↓
Pinecone
```

---

# 3. Metadata Principles

Metadata must be:

* accurate;
* deterministic where possible;
* compact;
* versioned;
* validated;
* security-aware.

---

# 4. Identity Fields

Required identity fields:

```text
chunk_id
document_id
document_version_id
structure_node_id
```

---

# 5. Chunk ID

`chunk_id` uniquely identifies a retrieval chunk within NyaySetu.

Example:

```text
chunk_01JABC...
```

or a deterministic project-specific identifier.

---

# 6. Document ID

Identifies the logical source document.

Example:

```text
doc_data_protection_regulation
```

---

# 7. Document Version ID

Identifies the exact source version.

Example:

```text
docv_data_protection_2026_01
```

---

# 8. Structure Node ID

Links the chunk to the legal structure tree.

Example:

```text
structure_00042
```

---

# 9. Source Identity

Recommended:

```text
source_id
source_type
source_url
source_name
```

---

# 10. Source Type

Examples:

```text
STATUTE
REGULATION
RULE
NOTIFICATION
CIRCULAR
STANDARD
POLICY
GUIDANCE
COURT_DOCUMENT
CONTRACT
INTERNAL_POLICY
```

---

# 11. Authority

Store the issuing authority where known.

Examples:

```text
regulator
ministry
government department
standards body
organization
```

---

# 12. Authority Identifier

Where available:

```text
authority_id
authority_name
```

---

# 13. Jurisdiction

Example:

```text
India
```

or a more granular jurisdiction where appropriate.

---

# 14. Jurisdiction Code

Prefer standardized internal codes.

Example:

```text
IN
IN-MH
EU
```

depending on the application's jurisdiction model.

---

# 15. Regulatory Domain

Examples:

```text
DATA_PROTECTION
CYBERSECURITY
FINANCIAL
LABOR
ENVIRONMENTAL
TAX
HEALTHCARE
CORPORATE
```

---

# 16. Document Title

Store:

```text
document_title
```

---

# 17. Section Metadata

Recommended:

```text
part_number
part_title
chapter_number
chapter_title
section_number
section_title
subsection_number
clause_number
subclause_number
```

Only populate fields supported by the source.

---

# 18. Structure Type

Example:

```text
SECTION
SUBSECTION
CLAUSE
DEFINITION
SCHEDULE
TABLE
```

---

# 19. Structure Path

Human-readable:

```text
Chapter 3 > Section 7 > Subsection (2) > Clause (a)
```

---

# 20. Machine Structure Path

Example:

```text
chapter:3/section:7/subsection:2/clause:a
```

---

# 21. Parent Structure

Store:

```text
parent_structure_node_id
```

where applicable.

---

# 22. Chunk Position

Store:

```text
chunk_index
total_chunks
```

for document ordering.

---

# 23. Page Metadata

Required where available:

```text
page_start
page_end
```

---

# 24. Single-Page Chunk

If a chunk is entirely on one page:

```text
page_start = 14
page_end = 14
```

---

# 25. Multi-Page Chunk

Example:

```text
page_start = 14
page_end = 15
```

---

# 26. Source Coordinates

Where PDF layout information is available:

```text
bounding_box
```

may be stored.

---

# 27. Bounding Box

Conceptually:

```json
{
  "page": 14,
  "x": 72,
  "y": 310,
  "width": 450,
  "height": 80
}
```

---

# 28. Multiple Bounding Boxes

A chunk spanning several regions may require:

```text
source_regions[]
```

rather than one bounding box.

---

# 29. Source Offset

Store:

```text
source_start_offset
source_end_offset
```

when available.

---

# 30. Citation Anchor

Required for legal evidence display.

Example:

```text
Section 7(2)(a)
```

---

# 31. Citation Label

Human-readable:

```text
Section 7(2)(a), page 14
```

---

# 32. Citation URL

Where an official source URL exists:

```text
source_url
```

should reference the authoritative source.

---

# 33. Citation Integrity

The citation must correspond to the actual source content.

Do not generate citations that merely look plausible.

---

# 34. Effective Dates

Store:

```text
effective_from
effective_to
```

when known.

---

# 35. Effective Date Semantics

These dates describe the source version's applicability period.

They are distinct from:

```text
ingested_at
indexed_at
```

---

# 36. Amendment Status

Possible values:

```text
ORIGINAL
AMENDED
REPEALED
SUPERSEDED
CONSOLIDATED
DRAFT
UNKNOWN
```

---

# 37. Regulation Version

Store a source-specific version identifier where available.

Example:

```text
regulation_version = "2026-01"
```

---

# 38. Important Distinction

```text
regulation_version
```

is different from:

```text
embedding_version
```

---

# 39. Language

Store:

```text
language
```

Example:

```text
en
```

---

# 40. Language Confidence

Optional:

```text
language_confidence
```

---

# 41. Extraction Metadata

Track:

```text
extraction_method
extraction_version
```

---

# 42. Extraction Method

Examples:

```text
PDF_TEXT
OCR
HTML
DOCX
MANUAL
API
```

---

# 43. OCR Metadata

For OCR documents:

```text
ocr_used
ocr_engine
ocr_version
ocr_confidence
```

---

# 44. Text Cleaning Metadata

Track:

```text
cleaning_version
```

---

# 45. Chunking Metadata

Track:

```text
chunking_version
chunking_strategy
```

---

# 46. Embedding Metadata

Track:

```text
embedding_provider
embedding_model
embedding_version
embedding_dimension
```

---

# 47. Vector Metadata

Track:

```text
vector_id
index_name
namespace
indexed_at
```

---

# 48. Retrieval Filters

Metadata should support filtering by:

```text
jurisdiction
authority
document_type
regulatory_domain
effective_date
organization_id
source_type
language
```

where appropriate.

---

# 49. Tenant Isolation

Organization-specific documents must contain:

```text
organization_id
```

or an equivalent tenant identifier.

---

# 50. Public Documents

Public legal documents may use:

```text
visibility = PUBLIC
```

---

# 51. Private Documents

Private organizational documents may use:

```text
visibility = PRIVATE
```

---

# 52. Sensitivity

Recommended:

```text
PUBLIC
INTERNAL
CONFIDENTIAL
RESTRICTED
```

---

# 53. Security Rule

Sensitivity metadata must not replace actual authorization checks.

---

# 54. Access Scope

Possible:

```text
PUBLIC
ORGANIZATION
USER
AUDIT
```

depending on the application's access model.

---

# 55. Content Hash

Store:

```text
content_hash
```

computed from canonical chunk content.

---

# 56. Embedding Input Hash

Store:

```text
embedding_input_hash
```

if the embedding representation differs from canonical text.

---

# 57. Hash Purpose

Hashes support:

* duplicate detection;
* stale-vector detection;
* reproducibility;
* migration;
* integrity checks.

---

# 58. Parent Chunk

Store:

```text
parent_chunk_id
```

where a child chunk was derived from a larger provision.

---

# 59. Child Chunks

Optionally maintain:

```text
child_chunk_ids[]
```

---

# 60. Neighbor Information

Do not store excessive neighbor metadata in every vector.

Neighbor chunks can generally be resolved through:

```text
document_version_id
chunk_index
```

---

# 61. Sequence

Store:

```text
sequence_number
```

for deterministic ordering.

---

# 62. Token Count

Store:

```text
token_count
```

according to the selected embedding tokenizer where possible.

---

# 63. Character Count

Optional:

```text
character_count
```

---

# 64. Sentence Count

Optional:

```text
sentence_count
```

---

# 65. Quality Score

Store:

```text
quality_score
```

if a validated scoring mechanism exists.

---

# 66. Quality Components

Possible internal metrics:

```text
structure_completeness
provenance_completeness
text_quality
size_suitability
noise_ratio
```

---

# 67. Authority Score

If NyaySetu assigns source authority classifications, store a controlled value.

Example:

```text
PRIMARY
SECONDARY
INTERNAL
UNVERIFIED
```

---

# 68. Authority Score Limitation

Authority metadata must not be fabricated.

---

# 69. Staleness

Store:

```text
is_stale
```

or an equivalent status.

---

# 70. Conflict Flag

Store:

```text
has_source_conflict
```

when the knowledge-base process has identified conflicting versions/sources.

---

# 71. Conflict Handling

The metadata should identify that a conflict exists.

It must not silently select one source as legally correct unless an explicit source-authority policy supports that decision.

---

# 72. Definition Flag

Optional:

```text
is_definition
```

---

# 73. Obligation Candidate

Optional:

```text
contains_obligation_candidate
```

This indicates content characteristics, not final compliance classification.

---

# 74. Exception Candidate

Optional:

```text
contains_exception_candidate
```

---

# 75. Penalty Candidate

Optional:

```text
contains_penalty_candidate
```

---

# 76. Metadata Semantics

These flags are retrieval aids.

They must not be treated as authoritative legal conclusions.

---

# 77. Cross-References

Store detected references separately where practical.

Example:

```json
{
  "target_type": "SECTION",
  "target_number": "12"
}
```

---

# 78. Metadata Schema

Conceptual TypeScript model:

```typescript
interface LegalChunkMetadata {
  chunkId: string;

  documentId: string;
  documentVersionId: string;
  structureNodeId: string;

  sourceId?: string;
  sourceType: string;
  sourceName?: string;
  sourceUrl?: string;

  documentTitle: string;

  jurisdiction?: string;
  jurisdictionCode?: string;
  authorityName?: string;
  regulatoryDomain?: string;

  partNumber?: string;
  partTitle?: string;
  chapterNumber?: string;
  chapterTitle?: string;
  sectionNumber?: string;
  sectionTitle?: string;
  subsectionNumber?: string;
  clauseNumber?: string;
  subclauseNumber?: string;

  structureType: string;
  structurePath?: string;

  pageStart?: number;
  pageEnd?: number;

  sourceStartOffset?: number;
  sourceEndOffset?: number;

  citationAnchor?: string;

  effectiveFrom?: string;
  effectiveTo?: string;

  regulationVersion?: string;
  amendmentStatus?: string;

  language?: string;
  languageConfidence?: number;

  extractionMethod?: string;
  extractionVersion?: string;
  ocrUsed?: boolean;
  ocrConfidence?: number;

  cleaningVersion: string;
  chunkingVersion: string;

  embeddingProvider?: string;
  embeddingModel?: string;
  embeddingVersion?: string;
  embeddingDimension?: number;

  vectorId?: string;
  indexName?: string;
  namespace?: string;

  parentChunkId?: string;

  sequenceNumber: number;

  tokenCount?: number;
  characterCount?: number;

  contentHash: string;
  embeddingInputHash?: string;

  qualityScore?: number;

  visibility: "PUBLIC" | "PRIVATE";
  sensitivity?: string;
  organizationId?: string;

  isStale?: boolean;
  hasSourceConflict?: boolean;

  isDefinition?: boolean;
  containsObligationCandidate?: boolean;
  containsExceptionCandidate?: boolean;
  containsPenaltyCandidate?: boolean;

  createdAt: string;
  indexedAt?: string;
}
```

---

# 79. Required vs Optional Fields

Not every document provides every field.

Required fields should be limited to fields essential for:

* identity;
* provenance;
* retrieval;
* security.

---

# 80. Missing Metadata

Missing metadata should be represented explicitly.

Do not invent:

```text
unknown authority
fake page number
fake effective date
```

---

# 81. Unknown Values

Use:

```text
null
```

or an explicit controlled value such as:

```text
UNKNOWN
```

according to the database schema.

---

# 82. Metadata Validation

Before indexing:

```text
required fields present
+
types valid
+
values normalized
+
security fields valid
```

must pass.

---

# 83. Pinecone Compatibility

Pinecone metadata should contain only fields required for retrieval/filtering and lightweight display.

---

# 84. Database Compatibility

Supabase/PostgreSQL should remain the canonical metadata store when the application needs:

* relational joins;
* complex queries;
* audit history;
* integrity constraints.

---

# 85. Recommended Split

```text
Supabase
├── complete chunk metadata
├── canonical text
├── provenance
├── audit relationships
└── processing history

Pinecone
├── vector
├── chunk_id
├── document/version identifiers
├── retrieval filters
└── compact citation metadata
```

---

# 86. Pinecone Metadata Example

```json
{
  "chunk_id": "chunk_42",
  "document_id": "doc_12",
  "document_version_id": "docv_3",
  "organization_id": "org_7",
  "jurisdiction": "IN",
  "source_type": "REGULATION",
  "section_number": "7",
  "structure_type": "SECTION",
  "effective_from": "2026-01-01",
  "embedding_version": "v1"
}
```

---

# 87. Filter Example

A retrieval request may require:

```text
jurisdiction = IN
+
effective_from <= target_date
+
organization_id = current_org
```

The exact query logic belongs to the retrieval layer.

---

# 88. Date Filtering

Effective-date filtering must use structured dates, not string matching.

---

# 89. Organization Filtering

Organization filters must be derived from authenticated application context.

Never accept an arbitrary organization ID directly from an untrusted client.

---

# 90. Authorization

Metadata filtering is not a substitute for authorization.

---

# 91. RLS

Supabase tables containing organization data should use appropriate Row Level Security policies.

---

# 92. Vector Namespace Isolation

Where namespaces are used for tenant separation, the namespace must be derived from trusted server-side authorization context.

---

# 93. Metadata Injection

User-provided metadata must be validated against a strict schema.

---

# 94. Source URL Validation

URLs should be validated and normalized before storage.

---

# 95. Metadata Size Limits

Set practical limits on:

```text
title length
section title length
source name length
metadata arrays
cross-reference count
```

---

# 96. Arbitrary JSON

Do not permit unrestricted arbitrary JSON metadata in Pinecone.

---

# 97. Metadata Version

If the schema changes materially:

```text
metadata_schema_version
```

should be incremented.

---

# 98. Migration

Metadata migrations should be backward-compatible where practical.

---

# 99. Example

```text
metadata_schema_version = 1
```

---

# 100. Migration Rule

Changing a field name requires:

```text
schema update
+
application update
+
index update if required
+
migration
```

---

# 101. Backfill

Existing chunks may require metadata backfill after schema changes.

---

# 102. Validation Job

A scheduled validation job may scan for:

```text
missing metadata
invalid dates
invalid IDs
missing provenance
stale vectors
wrong namespace
```

---

# 103. Orphan Detection

Detect:

```text
Pinecone vector
without
Supabase chunk
```

and:

```text
Supabase chunk
without
Pinecone vector
```

---

# 104. Metadata Integrity

A vector must never become permanently detached from its source record.

---

# 105. Citation Retrieval

When a Pinecone match is returned:

```text
vector match
 ↓
chunk_id
 ↓
canonical database record
 ↓
citation
```

---

# 106. Citation Display

The UI may show:

```text
Section 7(2)(a)
Data Protection Regulation
Page 14
```

with an evidence viewer linking to the source location.

---

# 107. Source Highlighting

If coordinates exist, the frontend can highlight the exact source region.

---

# 108. Audit Provenance

When an agent uses a chunk, record:

```text
chunk_id
document_version_id
retrieval_run_id
```

---

# 109. Evidence Record

Conceptually:

```typescript
interface EvidenceReference {
  chunkId: string;
  documentVersionId: string;
  retrievalRunId: string;
  citationAnchor?: string;
}
```

---

# 110. Agent Boundary

Agents should receive structured evidence metadata rather than trusting arbitrary source claims.

---

# 111. Hallucination Prevention

Every legal claim generated by the audit workflow should be linked to retrieved evidence where evidence is required.

---

# 112. Insufficient Evidence

If no appropriate chunk is retrieved:

```text
evidence_status = INSUFFICIENT
```

rather than fabricating a source.

---

# 113. Metadata and Confidence

Metadata confidence fields must describe metadata extraction quality only.

They must not be confused with:

```text
legal conclusion confidence
```

---

# 114. Version Traceability

For every chunk, the system should be able to answer:

```text
Which document?
Which version?
Which page?
Which section?
Which parser?
Which chunking version?
Which embedding model?
Which vector?
```

---

# 115. Reproducibility

This enables reconstruction of the retrieval path used during an audit.

---

# 116. Processing Timestamps

Store:

```text
created_at
processed_at
indexed_at
```

where operationally useful.

---

# 117. Processing Duration

Optional:

```text
processing_duration_ms
```

for performance diagnostics.

---

# 118. Failure Metadata

Failed indexing operations should record:

```text
failure_code
failure_message
retry_count
```

outside the core Pinecone metadata where possible.

---

# 119. No Sensitive Logs

Do not log full confidential chunk contents simply to diagnose metadata failures.

---

# 120. Data Retention

Metadata retention must follow the project's legal, security, and operational retention policies.

---

# 121. Deletion

Deleting a private document must propagate to:

```text
canonical chunk
+
vector
+
associated metadata
```

according to the retention policy.

---

# 122. Version Deletion

Deleting an old regulation version must not accidentally delete the active version.

---

# 123. Audit Preservation

If a historical audit requires the old source, deletion policies must account for audit-retention requirements.

---

# 124. Testing

Metadata tests must verify:

```text
identity
provenance
versioning
dates
tenant isolation
citation
vector mapping
```

---

# 125. Schema Tests

Validate required fields and types.

---

# 126. Provenance Tests

Every indexed chunk must resolve to:

```text
document
+
document version
+
source location
```

---

# 127. Tenant Tests

Verify that:

```text
Org A query
```

cannot retrieve:

```text
Org B private chunk
```

---

# 128. Version Tests

Verify:

```text
regulation v1
≠
regulation v2
```

and:

```text
embedding v1
≠
embedding v2
```

---

# 129. Citation Tests

Every evidence result should generate a valid citation anchor where source information exists.

---

# 130. Stale Tests

Modify canonical chunk text and verify that:

```text
embedding_input_hash
```

no longer matches.

---

# 131. Index Tests

Verify every expected indexed chunk has:

```text
vector_id
index_name
namespace
```

when required.

---

# 132. Performance

Metadata creation should add negligible processing overhead compared with extraction and embedding.

---

# 133. Acceptance Criteria

The metadata system must:

* uniquely identify every chunk;
* preserve document/version identity;
* preserve legal hierarchy;
* preserve page/source provenance;
* support citation;
* support effective-date filtering;
* support tenant isolation;
* support Pinecone retrieval;
* map back to Supabase;
* track processing versions;
* support stale detection;
* support audit reproducibility;
* validate metadata before indexing.

---

# 134. Production Checklist

* [ ] Chunk ID.
* [ ] Document ID.
* [ ] Document version ID.
* [ ] Structure node ID.
* [ ] Source identity.
* [ ] Authority.
* [ ] Jurisdiction.
* [ ] Document type.
* [ ] Section hierarchy.
* [ ] Page provenance.
* [ ] Citation anchor.
* [ ] Effective dates.
* [ ] Amendment status.
* [ ] Language.
* [ ] Extraction version.
* [ ] Cleaning version.
* [ ] Chunking version.
* [ ] Embedding version.
* [ ] Vector ID.
* [ ] Index/namespace.
* [ ] Content hash.
* [ ] Embedding input hash.
* [ ] Parent/sequence information.
* [ ] Token statistics.
* [ ] Quality metadata.
* [ ] Sensitivity.
* [ ] Organization isolation.
* [ ] Staleness detection.
* [ ] Conflict detection.
* [ ] Schema validation.
* [ ] RLS/authorization.
* [ ] Citation testing.
* [ ] Migration strategy.
* [ ] Deletion strategy.

---

# 135. Final Principle

> **Metadata is the chain connecting a vector back to the law from which it came.**

A NyaySetu vector without reliable provenance is merely a number.

A NyaySetu vector with complete provenance becomes auditable evidence.

### Code vs Architecture Drift Gap Analysis

| Area | Current | Target | Gap | Action |
|------|---------|--------|-----|--------|
| Embedding | `sentence-transformers` local pipeline verified in `embeddings.py` | External Hugging Face APIs | Code uses local processing | Update documentation to reflect local embedding strategy |
| Pinecone | Generic `nyayasetu` namespace verified in `vectorstore.py` | Isolated Legal vs Contract KBs | Code does not isolate tenants | Refactor namespace logic or update docs to reflect single namespace MVP |
