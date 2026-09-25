# Pinecone Metadata Specification

**Project:** NyaySetu
**Document:** Pinecone Metadata Contract
**Path:** `docs/rag/20-pinecone-metadata.md`
**Status:** Production Specification
**Version:** 1.0

---

## 1. Purpose

This document defines the metadata contract attached to every vector stored in Pinecone for the NyaySetu Retrieval-Augmented Generation system.

Metadata is not decorative information.

It is part of the retrieval correctness layer.

NyaySetu must use metadata to:

* identify the exact source chunk;
* preserve document provenance;
* enforce tenant isolation;
* filter by jurisdiction;
* filter by regulatory domain;
* filter by effective date;
* distinguish active and historical regulations;
* identify document versions;
* support citation generation;
* support auditability;
* detect stale vectors;
* support reconciliation;
* support retrieval evaluation;
* prevent accidental cross-organization retrieval.

Pinecone remains a retrieval index.

Supabase remains the canonical system of record.

---

# 2. Core Principle

The system must follow:

```text
Supabase
   |
   | canonical document/chunk identity
   v
Embedding Pipeline
   |
   v
Pinecone Vector
   |
   +--> embedding
   |
   +--> retrieval metadata
   |
   +--> provenance metadata
   |
   +--> tenant metadata
```

Pinecone metadata must never become the sole authoritative copy of legal information.

---

# 3. Metadata Responsibilities

Metadata serves five primary purposes:

1. Identity.
2. Retrieval filtering.
3. Provenance.
4. Lifecycle management.
5. Operational observability.

Metadata must not be used as an uncontrolled storage layer for arbitrary application data.

---

# 4. Metadata Design Principles

All metadata must be:

* deterministic;
* normalized;
* validated;
* minimal;
* filterable;
* auditable;
* version-aware;
* tenant-aware;
* safe to expose to retrieval infrastructure.

Metadata must not contain:

* API keys;
* passwords;
* authentication tokens;
* private credentials;
* raw secrets;
* unnecessary personally identifiable information;
* unrestricted user-generated text;
* confidential material unrelated to retrieval.

---

# 5. Canonical Metadata vs Retrieval Metadata

There are two conceptual categories.

## 5.1 Canonical metadata

Stored authoritatively in Supabase.

Examples:

```text
document_id
document_version_id
chunk_id
source_hash
publication_date
effective_from
effective_to
```

## 5.2 Retrieval metadata

Copied into Pinecone when required for efficient filtering.

Examples:

```text
jurisdiction
regulatory_domain
document_type
organization_id
effective_from
effective_to
active
```

Pinecone copies must never silently diverge from canonical metadata.

---

# 6. Identity Metadata

Every vector must have stable identity metadata.

Required fields:

```text
chunk_id
document_id
document_version_id
```

Example:

```json
{
  "chunk_id": "chunk_01JXYZ...",
  "document_id": "doc_01JABC...",
  "document_version_id": "docver_01JDEF..."
}
```

---

# 7. chunk_id

`chunk_id` uniquely identifies the logical chunk.

Requirements:

* globally unique;
* immutable;
* deterministic where practical;
* safe for Pinecone vector IDs;
* linked to Supabase.

Example:

```text
chunk_01JQ7K8D3M...
```

The system must never generate random chunk IDs during every indexing attempt.

---

# 8. document_id

`document_id` identifies the logical document.

Multiple versions may belong to the same document.

Example:

```text
document_id = "dpdp_act"
```

or:

```text
doc_01JABC...
```

The exact identifier strategy must remain consistent across the application.

---

# 9. document_version_id

A document version represents a specific legal or regulatory state.

Example:

```text
document_id:
  data_protection_law

versions:
  v1
  v2
  v3
```

Every chunk must point to exactly one document version.

---

# 10. Source Metadata

Recommended fields:

```text
source_type
source_name
source_authority
regulator
jurisdiction
regulatory_domain
document_type
```

Example:

```json
{
  "source_type": "official_regulation",
  "source_name": "Example Data Protection Regulation",
  "source_authority": "Example Authority",
  "regulator": "Example Regulator",
  "jurisdiction": "IN",
  "regulatory_domain": "data_protection",
  "document_type": "regulation"
}
```

---

# 11. Source Authority

`source_authority` identifies the organization responsible for publishing the material.

Examples:

```text
Ministry of Corporate Affairs
Reserve Bank of India
Securities and Exchange Board of India
Government of India
```

The value must be normalized.

Avoid inconsistent values such as:

```text
RBI
Reserve Bank
Reserve Bank of India
reserve bank india
```

unless a controlled vocabulary explicitly permits them.

---

# 12. Jurisdiction

Jurisdiction must use a controlled representation.

Examples:

```text
IN
IN-MH
EU
US
US-CA
```

The exact taxonomy must be documented in the database.

Avoid free-form jurisdiction strings.

---

# 13. Regulatory Domain

Examples:

```text
data_protection
cybersecurity
financial_services
employment
taxation
corporate
consumer_protection
environment
```

Regulatory domains should come from a controlled vocabulary.

---

# 14. Document Type

Examples:

```text
act
regulation
rule
notification
circular
guideline
standard
policy
order
advisory
```

The value should describe the source document, not the user's uploaded company document.

---

# 15. Structural Metadata

Legal documents contain meaningful hierarchy.

Recommended fields:

```text
chapter
part
section
subsection
clause
subclause
schedule
annexure
heading
structure_type
```

Not every field will exist for every document.

Null values should be omitted rather than replaced with meaningless strings.

---

# 16. Section Number

The original legal section identifier must be preserved.

Examples:

```text
3
3.1
12A
7(2)
Schedule II
```

Do not unnecessarily normalize legal section numbers into numerical-only representations.

---

# 17. Section Heading

Store the normalized section heading when available.

Example:

```text
"Security safeguards"
```

Headings improve retrieval explainability.

---

# 18. Structure Type

Example values:

```text
section
subsection
clause
schedule
annexure
paragraph
definition
table
```

This can support specialized retrieval.

---

# 19. Temporal Metadata

Legal correctness depends heavily on time.

Recommended fields:

```text
publication_date
effective_from
effective_to
amendment_date
active
```

---

# 20. Effective From

`effective_from` represents the date on which the source becomes applicable.

Example:

```text
2026-01-01
```

The format must be ISO 8601-compatible.

---

# 21. Effective To

`effective_to` represents the date after which the source is no longer applicable.

If still active:

```text
effective_to = null
```

or omit the field depending on implementation.

The system must use one convention consistently.

---

# 22. Active Flag

Example:

```json
{
  "active": true
}
```

The active flag is an indexing convenience.

It must not replace proper date logic.

---

# 23. Amendment Status

Recommended values:

```text
original
amended
repealed
superseded
consolidated
draft
```

Historical regulations must not accidentally appear as current law.

---

# 24. Publication Date

Publication date identifies when the source was issued or published.

This differs from:

```text
effective_from
```

A regulation can be published before it becomes effective.

---

# 25. Organization Metadata

Private company documents require tenant-aware metadata.

Example:

```json
{
  "organization_id": "org_123"
}
```

This field must never be trusted from the client during retrieval.

---

# 26. Visibility

Recommended values:

```text
public
organization
private
```

Example:

```json
{
  "visibility": "organization"
}
```

The server must determine whether the requesting user is authorized to retrieve that visibility class.

---

# 27. Sensitivity

Optional controlled field:

```text
public
internal
confidential
restricted
```

Sensitive classification must not be treated as a replacement for authorization.

---

# 28. Provenance Metadata

Every legally meaningful chunk should carry provenance.

Recommended fields:

```text
page_start
page_end
citation_anchor
source_url
source_hash
```

---

# 29. Page Range

For PDF documents:

```json
{
  "page_start": 42,
  "page_end": 43
}
```

Page numbering must clearly define whether numbering refers to:

* PDF page index;
* printed page number;
* document page number.

NyaySetu should preserve both when they differ.

---

# 30. Citation Anchor

A citation anchor provides a stable reference.

Example:

```text
section-8-clause-2
```

or:

```text
page-42-section-8
```

Anchors must be deterministic.

---

# 31. Source URL

Official source URLs may be stored when available.

Example:

```text
https://official-source.example/regulation
```

URLs must be validated and normalized.

---

# 32. Source Hash

A cryptographic source hash identifies the exact source content.

Example:

```text
sha256:abc123...
```

The hash helps detect changes.

---

# 33. Extraction Metadata

Recommended fields:

```text
parser_version
ocr_status
language
extraction_method
```

Example:

```json
{
  "parser_version": "pdf-parser-2.1.0",
  "ocr_status": "not_required",
  "language": "en",
  "extraction_method": "native_text"
}
```

---

# 34. OCR Status

Possible values:

```text
not_required
completed
partial
failed
```

A failed OCR document must not silently enter high-confidence retrieval.

---

# 35. Language

Use standardized language identifiers.

Examples:

```text
en
hi
mr
```

For multilingual material:

```text
en
```

may represent the chunk language even if the document contains several languages.

---

# 36. Chunk Position

Recommended:

```text
chunk_index
chunk_count
```

Example:

```json
{
  "chunk_index": 12,
  "chunk_count": 84
}
```

This helps debugging and reconstruction.

---

# 37. Content Statistics

Optional:

```text
token_count
character_count
```

These are useful for:

* retrieval diagnostics;
* chunk-size evaluation;
* context-budget analysis.

---

# 38. Quality Metadata

Possible fields:

```text
quality_score
extraction_quality
metadata_quality
```

Quality values must have documented semantics.

Example:

```text
0.0 <= quality_score <= 1.0
```

---

# 39. Embedding Metadata

Embedding provenance should include:

```text
embedding_model
embedding_version
embedding_dimension
embedding_input_hash
```

Example:

```json
{
  "embedding_model": "hf-model-name",
  "embedding_version": "v1",
  "embedding_dimension": 768
}
```

---

# 40. Embedding Input Hash

The embedding input hash allows the system to determine whether a chunk needs re-embedding.

Example:

```text
sha256(normalized_embedding_input)
```

If the source text changes, the hash should change.

---

# 41. Namespace Metadata

The vector's namespace must be derived by the application.

Metadata may include:

```text
index_environment
namespace_type
```

Example:

```text
namespace_type = public
```

The actual namespace should still be controlled by server-side logic.

---

# 42. Stale Metadata

Optional:

```text
stale
```

Example:

```json
{
  "stale": false
}
```

A stale vector should not normally be returned for current retrieval.

---

# 43. Conflict Metadata

Optional:

```text
conflict_group
conflict_status
```

Possible values:

```text
none
potential_conflict
confirmed_conflict
resolved
```

Conflict metadata should support investigation, not override legal reasoning.

---

# 44. Metadata Contract

Example TypeScript interface:

```typescript
export interface PineconeChunkMetadata {
  chunk_id: string;
  document_id: string;
  document_version_id: string;

  source_type: string;
  source_name?: string;
  source_authority?: string;
  regulator?: string;

  jurisdiction: string;
  regulatory_domain: string;
  document_type: string;

  chapter?: string;
  part?: string;
  section?: string;
  subsection?: string;
  clause?: string;
  schedule?: string;
  annexure?: string;
  heading?: string;
  structure_type?: string;

  section_number?: string;

  publication_date?: string;
  effective_from?: string;
  effective_to?: string;
  amendment_date?: string;
  amendment_status?: string;
  active: boolean;

  organization_id?: string;
  visibility: string;
  sensitivity?: string;

  page_start?: number;
  page_end?: number;
  citation_anchor?: string;
  source_url?: string;
  source_hash?: string;

  parser_version?: string;
  ocr_status?: string;
  language?: string;
  extraction_method?: string;

  chunk_index?: number;
  chunk_count?: number;
  token_count?: number;
  character_count?: number;

  quality_score?: number;

  embedding_model: string;
  embedding_version: string;
  embedding_dimension: number;
  embedding_input_hash: string;

  stale?: boolean;
  conflict_group?: string;
  conflict_status?: string;

  metadata_schema_version: string;
}
```

---

# 45. Required Fields

Minimum required fields:

```text
chunk_id
document_id
document_version_id
jurisdiction
regulatory_domain
document_type
active
visibility
embedding_model
embedding_version
embedding_dimension
embedding_input_hash
metadata_schema_version
```

Private chunks additionally require:

```text
organization_id
```

---

# 46. Metadata Schema Version

Every vector must declare:

```text
metadata_schema_version
```

Example:

```text
1
```

Future schema migrations can therefore identify vectors created under older contracts.

---

# 47. Metadata Normalization

Before upsert:

1. trim strings;
2. normalize controlled vocabulary;
3. validate dates;
4. validate numeric fields;
5. remove undefined values;
6. validate IDs;
7. validate organization ownership;
8. validate enum values;
9. validate embedding metadata.

---

# 48. Empty Values

Do not store meaningless values such as:

```text
""
"N/A"
"unknown"
"null"
```

unless explicitly defined by the schema.

Prefer omission or actual null semantics supported by the persistence layer.

---

# 49. Date Normalization

Dates should use:

```text
YYYY-MM-DD
```

Timestamps should use ISO 8601.

Example:

```text
2026-09-12T10:30:00Z
```

Do not mix:

```text
12/09/2026
09-12-26
September 12
```

inside filterable metadata.

---

# 50. Numeric Metadata

Numeric fields must remain numeric.

Correct:

```json
{
  "page_start": 10
}
```

Incorrect:

```json
{
  "page_start": "10"
}
```

---

# 51. Boolean Metadata

Correct:

```json
{
  "active": true
}
```

Incorrect:

```json
{
  "active": "true"
}
```

---

# 52. Metadata Security

Metadata is infrastructure-visible data.

Therefore:

```text
Never store secrets.
Never store credentials.
Never store raw authentication tokens.
Never store unnecessary PII.
```

---

# 53. Client Input

Clients must never be allowed to directly specify unrestricted Pinecone metadata.

Bad:

```typescript
pinecone.query({
  filter: request.body.filter
});
```

Better:

```typescript
const filter = buildAuthorizedRetrievalFilter({
  user,
  jurisdiction,
  domain,
  effectiveDate,
});
```

---

# 54. Tenant Isolation

Organization metadata must be enforced server-side.

Example:

```text
organization_id = authenticatedUser.organizationId
```

not:

```text
organization_id = request.body.organizationId
```

---

# 55. Retrieval Filter Example

Example:

```json
{
  "$and": [
    {
      "jurisdiction": {
        "$eq": "IN"
      }
    },
    {
      "regulatory_domain": {
        "$eq": "data_protection"
      }
    },
    {
      "active": {
        "$eq": true
      }
    }
  ]
}
```

---

# 56. Organization Filter

For organization-private retrieval:

```json
{
  "$or": [
    {
      "visibility": {
        "$eq": "public"
      }
    },
    {
      "$and": [
        {
          "visibility": {
            "$eq": "organization"
          }
        },
        {
          "organization_id": {
            "$eq": "org_123"
          }
        }
      ]
    }
  ]
}
```

The actual query must be generated by trusted server code.

---

# 57. Effective-Date Retrieval

A current-law query should conceptually require:

```text
effective_from <= target_date
AND
(
  effective_to is absent
  OR
  effective_to >= target_date
)
```

Implementation must account for the actual Pinecone metadata filtering capabilities supported by the deployed version.

---

# 58. Supabase Mapping

The canonical chunk table may contain:

```text
chunks.id
chunks.document_id
chunks.document_version_id
chunks.content
chunks.page_start
chunks.page_end
chunks.metadata
```

Pinecone receives only the subset required for retrieval and provenance.

---

# 59. Content Duplication

Do not automatically store full chunk text in Pinecone metadata if the system can hydrate content from Supabase.

Preferred pattern:

```text
Pinecone
   |
   +--> chunk_id
   |
   +--> score
   |
   +--> retrieval metadata
   |
   v
Supabase
   |
   +--> canonical chunk text
   +--> provenance
   +--> legal metadata
```

This reduces duplicated authoritative content.

---

# 60. Metadata Drift

Metadata drift occurs when:

```text
Supabase metadata != Pinecone metadata
```

Drift must be detectable.

---

# 61. Drift Detection

A reconciliation job should compare:

```text
chunk_id
document_version_id
organization_id
active
effective dates
embedding version
source hash
metadata schema version
```

---

# 62. Metadata Migration

When metadata changes:

1. increment schema version;
2. update metadata builder;
3. update validation;
4. update tests;
5. update migration strategy;
6. re-index affected vectors;
7. reconcile old vectors.

---

# 63. Backward Compatibility

Retrieval code should support known previous metadata versions during migration when necessary.

Do not assume every vector immediately upgrades.

---

# 64. Metadata Builder

Centralize construction:

```typescript
function buildPineconeMetadata(
  chunk: CanonicalChunk
): PineconeChunkMetadata {
  return {
    chunk_id: chunk.id,
    document_id: chunk.documentId,
    document_version_id: chunk.documentVersionId,
    jurisdiction: chunk.jurisdiction,
    regulatory_domain: chunk.regulatoryDomain,
    document_type: chunk.documentType,
    active: chunk.active,
    visibility: chunk.visibility,
    embedding_model: chunk.embeddingModel,
    embedding_version: chunk.embeddingVersion,
    embedding_dimension: chunk.embeddingDimension,
    embedding_input_hash: chunk.embeddingInputHash,
    metadata_schema_version: "1"
  };
}
```

No route should independently construct Pinecone metadata.

---

# 65. Validation

Validation must occur before upsert.

Example:

```typescript
validatePineconeMetadata(metadata);
```

Failures must stop the upsert.

---

# 66. Invalid Metadata

Examples:

```text
missing chunk_id
invalid jurisdiction
invalid date
negative page number
invalid embedding dimension
missing organization_id for private vector
unknown metadata schema
```

must produce explicit validation errors.

---

# 67. Metadata Testing

Tests must verify:

* required fields;
* enum validation;
* date validation;
* numeric types;
* boolean types;
* organization isolation;
* schema version;
* embedding metadata;
* source provenance.

---

# 68. Filter Testing

Each production filter must have automated tests.

Examples:

```text
jurisdiction filter
domain filter
active filter
organization filter
visibility filter
effective-date filter
document-version filter
```

---

# 69. Metadata and Citations

Retrieval metadata must be sufficient to construct a citation candidate.

At minimum:

```text
chunk_id
document_id
document_version_id
page/provenance
section identifier
source identity
```

---

# 70. Metadata and Audit Trail

Audit results should preserve references to the metadata state used during analysis.

The system should record:

```text
chunk_id
document_version_id
embedding_version
retrieval timestamp
retrieval score
```

---

# 71. Retrieval Score

Similarity scores returned by Pinecone should not be permanently embedded into source metadata.

Scores belong to retrieval events.

A chunk can receive different scores for different queries.

---

# 72. Query-Specific Metadata

Do not mutate vector metadata to store:

```text
last_query
last_score
last_user
```

These are event-level attributes.

---

# 73. Observability

Logs may include:

```text
index
namespace
chunk_id
metadata_schema_version
embedding_version
```

Never log sensitive metadata indiscriminately.

---

# 74. Cost Control

Keep metadata compact.

Avoid storing:

* duplicate paragraphs;
* large JSON objects;
* full source documents;
* arbitrary user notes.

---

# 75. Pinecone Metadata Limits

The implementation must validate metadata against the metadata constraints of the currently deployed Pinecone index/API version.

Do not assume unlimited metadata size or arbitrary nested structures.

---

# 76. Controlled Vocabulary Registry

Recommended registry:

```typescript
const DOCUMENT_TYPES = [
  "act",
  "regulation",
  "rule",
  "notification",
  "circular",
  "guideline",
  "standard",
  "policy",
  "order",
  "advisory"
] as const;
```

Equivalent registries should exist for:

```text
visibility
jurisdiction
regulatory_domain
amendment_status
ocr_status
```

---

# 77. Metadata Contract Ownership

Ownership should be split:

```text
Database:
  canonical metadata

Ingestion:
  extraction metadata

Embedding:
  embedding metadata

Pinecone adapter:
  serialized retrieval metadata

Audit engine:
  query-specific retrieval event metadata
```

---

# 78. Metadata Change Review

Changes affecting:

* filters;
* tenant isolation;
* temporal retrieval;
* provenance;
* embeddings;

must receive elevated review.

---

# 79. Failure Principle

If required metadata cannot be generated correctly:

```text
DO NOT UPSERT
```

The system should mark the indexing job failed and preserve the reason.

---

# 80. Metadata Integrity Rule

A vector without trustworthy metadata is not a trustworthy retrieval candidate.

---

# 81. Example Complete Metadata

```json
{
  "chunk_id": "chunk_123",
  "document_id": "doc_456",
  "document_version_id": "docver_789",

  "source_type": "official_regulation",
  "source_name": "Example Regulation",
  "source_authority": "Example Authority",
  "regulator": "Example Regulator",

  "jurisdiction": "IN",
  "regulatory_domain": "data_protection",
  "document_type": "regulation",

  "section": "8",
  "section_number": "8",
  "heading": "Security safeguards",
  "structure_type": "section",

  "publication_date": "2026-01-01",
  "effective_from": "2026-04-01",
  "active": true,
  "amendment_status": "original",

  "organization_id": "org_123",
  "visibility": "organization",
  "sensitivity": "internal",

  "page_start": 42,
  "page_end": 43,
  "citation_anchor": "section-8",
  "source_hash": "sha256:abc123",

  "parser_version": "2.1.0",
  "ocr_status": "not_required",
  "language": "en",

  "chunk_index": 12,
  "chunk_count": 84,
  "token_count": 410,
  "character_count": 1800,

  "quality_score": 0.96,

  "embedding_model": "huggingface-model",
  "embedding_version": "v1",
  "embedding_dimension": 768,
  "embedding_input_hash": "sha256:def456",

  "stale": false,
  "metadata_schema_version": "1"
}
```

---

# 82. Acceptance Checklist

* [ ] Every vector has a chunk ID.
* [ ] Every vector references a document.
* [ ] Every vector references a document version.
* [ ] Jurisdiction is normalized.
* [ ] Regulatory domain is normalized.
* [ ] Document type is normalized.
* [ ] Effective dates are validated.
* [ ] Organization metadata is server-controlled.
* [ ] Visibility is validated.
* [ ] Provenance is preserved.
* [ ] Source hash is available where appropriate.
* [ ] Embedding metadata is present.
* [ ] Metadata schema version is present.
* [ ] No secrets are stored.
* [ ] No unnecessary PII is stored.
* [ ] Metadata filters are tested.
* [ ] Metadata drift is detectable.
* [ ] Invalid metadata blocks upsert.
* [ ] Historical and current versions are distinguishable.
* [ ] Citation construction is supported.

---

# 83. Final Principle

> **Pinecone metadata is the retrieval map, not the legal source of truth.**

Every metadata field should exist because it improves:

```text
retrieval
filtering
provenance
security
auditability
or lifecycle management
```

Nothing else should be stored merely because the vector database permits it.

### Code vs Architecture Drift Gap Analysis

| Area | Current | Target | Gap | Action |
|------|---------|--------|-----|--------|
| Embedding | `sentence-transformers` local pipeline verified in `embeddings.py` | External Hugging Face APIs | Code uses local processing | Update documentation to reflect local embedding strategy |
| Pinecone | Generic `nyayasetu` namespace verified in `vectorstore.py` | Isolated Legal vs Contract KBs | Code does not isolate tenants | Refactor namespace logic or update docs to reflect single namespace MVP |
