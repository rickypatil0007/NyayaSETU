# NyaySetu Pinecone Index Specification

**Project:** NyaySetu
**Module:** RAG Knowledge Base
**File:** `docs/rag/18-pinecone-index.md`
**Status:** Production Specification

---

# 1. Purpose

This document defines the concrete indexing requirements for NyaySetu's Pinecone vector database.

The index must provide:

* reliable vector storage;
* deterministic vector identity;
* metadata filtering;
* environment isolation;
* version awareness;
* retrieval performance;
* operational observability.

---

# 2. Index Lifecycle

```text
Create
 ↓
Configure
 ↓
Validate
 ↓
Populate
 ↓
Evaluate
 ↓
Activate
 ↓
Monitor
 ↓
Rebuild/Migrate
```

---

# 3. Index Naming

Use environment-specific names.

Example:

```text
nyayasetu-legal-dev
nyayasetu-legal-staging
nyayasetu-legal-prod
```

---

# 4. Environment Isolation

Development data must not accidentally enter production.

---

# 5. Dimension

The index dimension must exactly match the configured embedding model.

Example:

```text
embedding dimension = D
index dimension = D
```

---

# 6. Dimension Configuration

Do not hardcode the dimension in multiple application files.

Use one configuration source.

---

# 7. Startup Validation

At application startup or deployment validation:

```text
configured embedding dimension
=
Pinecone index dimension
```

must be verified.

---

# 8. Failure on Mismatch

If dimensions differ, fail fast.

Do not attempt to truncate or pad embeddings.

---

# 9. Similarity Metric

The selected metric must be documented and consistent with the embedding model.

---

# 10. Metric Consistency

Changing the metric should be treated as a new index configuration and evaluated independently.

---

# 11. Vector ID Format

Recommended:

```text
chunk:<chunk_id>
```

or another deterministic format.

---

# 12. Vector ID Requirements

IDs must be:

* unique;
* deterministic;
* stable;
* safe for provider constraints.

---

# 13. ID Source

The preferred source is the canonical chunk identity.

---

# 14. Version Identity

The vector ID should distinguish document versions where the same section exists in multiple versions.

---

# 15. Example

```text
chunk:docv_2026_section_7_chunk_02
```

---

# 16. Namespace

Namespace design must correspond to the tenancy and source architecture.

---

# 17. Public Namespace

Example:

```text
legal_public
```

---

# 18. Private Namespace

Example:

```text
org_<internal-id>
```

Only server-side trusted identifiers may be used.

---

# 19. Namespace Selection

The application should derive namespace selection from authenticated context.

---

# 20. No Client-Controlled Namespace

Never accept an arbitrary namespace from a browser request without authorization validation.

---

# 21. Metadata Schema

Minimum useful Pinecone metadata:

```text
chunk_id
document_id
document_version_id
source_type
jurisdiction
regulatory_domain
structure_type
section_number
effective_from
effective_to
organization_id
```

---

# 22. Metadata Types

Use provider-supported primitive metadata types.

Avoid unnecessarily complex nested structures.

---

# 23. Metadata Size

Keep metadata compact.

Large legal text belongs in canonical storage.

---

# 24. Chunk Text

Whether full text is stored in Pinecone metadata should be decided based on retrieval architecture and provider limits.

NyaySetu should preferably use:

```text
Pinecone → chunk_id
Supabase → canonical content
```

for authoritative retrieval.

---

# 25. Citation Fields

Useful lightweight fields:

```text
citation_anchor
page_start
page_end
```

---

# 26. Document Title

A compact `document_title` may be stored for retrieval result display.

---

# 27. Authority

A compact authority identifier/name can assist filtering and display.

---

# 28. Jurisdiction

Jurisdiction must use a normalized representation.

---

# 29. Regulatory Domain

Use controlled values.

Example:

```text
DATA_PROTECTION
CYBERSECURITY
FINANCIAL
LABOR
ENVIRONMENT
```

---

# 30. Source Type

Use controlled source categories.

---

# 31. Structure Type

Examples:

```text
SECTION
SUBSECTION
CLAUSE
DEFINITION
SCHEDULE
TABLE
```

---

# 32. Effective Date

Store machine-filterable date representations supported by the vector database.

---

# 33. Active Status

A boolean or controlled status may identify current/active material.

However, date logic should remain available for historical audits.

---

# 34. Organization ID

Required for private organizational data.

---

# 35. Visibility

Optional:

```text
PUBLIC
PRIVATE
```

---

# 36. Sensitivity

Optional controlled classification:

```text
INTERNAL
CONFIDENTIAL
RESTRICTED
```

---

# 37. Metadata Example

```json
{
  "chunk_id": "chunk_42",
  "document_id": "doc_12",
  "document_version_id": "docv_3",
  "document_title": "Example Regulation",
  "source_type": "REGULATION",
  "jurisdiction": "IN",
  "regulatory_domain": "DATA_PROTECTION",
  "structure_type": "SECTION",
  "section_number": "7",
  "citation_anchor": "Section 7",
  "page_start": 14,
  "page_end": 15,
  "effective_from": "2026-01-01",
  "organization_id": "org_7"
}
```

---

# 38. Upsert Contract

The ingestion layer should produce:

```typescript
interface PineconeUpsertRecord {
  id: string;
  values: number[];
  metadata: Record<string, string | number | boolean>;
}
```

---

# 39. Validation Before Upsert

Check:

```text
vector ID exists
vector dimension correct
metadata schema valid
organization scope valid
document version exists
chunk exists
```

---

# 40. Embedding Validation

Reject:

```text
NaN
Infinity
incorrect dimension
empty vector
```

---

# 41. Vector Numerical Integrity

Embedding values must be finite numbers.

---

# 42. Batch Size

Batch size must remain within Pinecone's current operational limits.

Do not hardcode undocumented provider limits into business logic.

---

# 43. Batch Retry

Failed batches should be retried with bounded exponential backoff.

---

# 44. Idempotency

A retry of the same upsert should produce the same logical index state.

---

# 45. Upsert State

Track:

```text
PENDING
UPSERTING
INDEXED
FAILED
```

in the ingestion system.

---

# 46. Index Verification

After indexing, verify expected vector counts or specific vector existence where appropriate.

---

# 47. Count Validation

Do not rely only on approximate provider statistics when exact reconciliation is required.

---

# 48. Reconciliation

Compare expected vectors from the canonical database with vectors indexed in Pinecone.

---

# 49. Stale Detection

Use:

```text
content_hash
embedding_input_hash
embedding_version
```

to identify stale vectors.

---

# 50. Reindex Trigger

Re-embed when:

* canonical chunk text changes;
* embedding model changes;
* embedding version changes;
* chunking changes;
* required context changes.

---

# 51. Metadata-Only Change

Some metadata changes may not require re-embedding.

However, the index metadata must still be updated.

---

# 52. Document Versioning

A new regulatory version should normally generate a distinct chunk/vector identity.

---

# 53. Do Not Overwrite Historical Law

Do not replace historical vectors merely because a newer regulation exists.

---

# 54. Historical Retrieval

Historical vectors allow an audit to reconstruct the legal environment applicable at a historical date.

---

# 55. Current Retrieval

Current compliance should select current applicable sources according to the regulatory versioning rules.

---

# 56. Namespace Migration

If namespace strategy changes:

```text
create destination namespace
 ↓
copy/reindex
 ↓
validate
 ↓
switch
 ↓
retire old namespace
```

---

# 57. Index Migration

For major schema/model changes:

```text
old index
new index
```

should coexist during validation.

---

# 58. Blue/Green Indexing

Conceptually:

```text
Active → index-A

New corpus → index-B

Validation → index-B

Switch → index-B
```

---

# 59. Rollback

Keep the old index available until the new system is verified.

---

# 60. Retrieval Query Contract

```typescript
interface VectorQuery {
  vector: number[];
  topK: number;
  namespace?: string;
  filter?: Record<string, unknown>;
}
```

---

# 61. Server-Side Query Construction

The server should construct:

```text
namespace
organization filter
effective-date filter
source filter
```

---

# 62. Client Request

The client should provide the business request, not unrestricted Pinecone query parameters.

---

# 63. Example

Instead of:

```text
client → arbitrary Pinecone filter
```

use:

```text
client → audit requirement
       ↓
server → authorized retrieval policy
       ↓
Pinecone
```

---

# 64. Query Embedding

The query embedding must belong to the same vector space as indexed vectors.

---

# 65. Top-K

Top-K should be configurable by retrieval mode.

---

# 66. Candidate Pool

The candidate pool should generally be larger than the final evidence set when reranking is used.

---

# 67. Metadata Filtering

Filtering should happen as early as practical.

---

# 68. Filter Example

Conceptual:

```text
jurisdiction = "IN"
AND
source_type = "REGULATION"
AND
regulatory_domain = "DATA_PROTECTION"
```

---

# 69. Date Filter

Conceptual:

```text
effective_from <= audit_date
AND
effective_to >= audit_date
```

with null/open-ended handling.

---

# 70. Private Evidence Filter

Conceptual:

```text
organization_id = authenticatedOrganizationId
```

---

# 71. Public Evidence

Public sources may be queried independently.

---

# 72. Combined Retrieval

If an audit requires both legal requirements and organization evidence:

```text
Legal Retrieval
       +
Evidence Retrieval
       ↓
Evidence Correlation
```

---

# 73. Retrieval Result

Return:

```typescript
interface PineconeMatch {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}
```

---

# 74. Canonical Hydration

After Pinecone results:

```text
match.id
 ↓
chunk record
 ↓
canonical source
```

---

# 75. Missing Canonical Record

If a vector points to a missing chunk:

```text
ORPHAN_VECTOR
```

should be recorded.

Do not silently use unknown text.

---

# 76. Citation Generation

Citations must be generated from canonical metadata.

---

# 77. Score Threshold

Similarity thresholds must be determined empirically.

Do not assume one universal threshold.

---

# 78. Low Similarity

Low-quality matches should not automatically be presented as evidence.

---

# 79. Insufficient Evidence

If retrieval fails to produce sufficient evidence:

```text
INSUFFICIENT_EVIDENCE
```

should be returned.

---

# 80. Security

Pinecone credentials remain server-side.

---

# 81. Logging

Never log API credentials.

---

# 82. Query Privacy

Sensitive organization queries should not be unnecessarily written to application logs.

---

# 83. Audit Trace

For every important retrieval event, retain:

```text
retrieval_id
audit_id
embedding_version
index
namespace
filters
candidate IDs
```

---

# 84. Retrieval Reproducibility

Exact reproduction may depend on provider behavior, index state, and model version.

Therefore preserve enough information to reconstruct the retrieval context.

---

# 85. Monitoring

Monitor:

```text
index availability
query latency
error rate
upsert failures
vector count
reconciliation failures
```

---

# 86. Alerting

Alert on:

* persistent query failures;
* indexing failure spikes;
* dimension mismatch;
* unexpected vector count changes;
* reconciliation failures.

---

# 87. Cost Monitoring

Track:

```text
embedding operations
upsert volume
query volume
storage
```

according to the provider's current billing model.

---

# 88. Development Dataset

Development should use non-sensitive data whenever possible.

---

# 89. Test Dataset

Maintain a controlled retrieval test corpus containing expected relevant chunks.

---

# 90. Golden Queries

Example:

```text
Query:
What records must an organization retain?

Expected:
Section 7
Section 8
```

---

# 91. Retrieval Evaluation

Measure:

```text
Recall@5
Recall@10
MRR
Precision
citation correctness
```

---

# 92. Index Acceptance

An index is production-ready only when:

* dimension is correct;
* vectors are traceable;
* filters work;
* authorization works;
* retrieval evaluation passes;
* rollback is possible.

---

# 93. Disaster Recovery

The index must be rebuildable from canonical data.

---

# 94. Backup Philosophy

Do not treat Pinecone as the only copy of legal content.

---

# 95. Delete Safety

Broad deletion operations should require explicit server-side authorization.

---

# 96. Production Checklist

* [ ] Index naming finalized.
* [ ] Dimension validated.
* [ ] Metric validated.
* [ ] Namespace strategy implemented.
* [ ] Vector ID strategy implemented.
* [ ] Metadata schema validated.
* [ ] Upsert idempotency implemented.
* [ ] Retry strategy implemented.
* [ ] Reconciliation implemented.
* [ ] Stale-vector detection implemented.
* [ ] Historical versions supported.
* [ ] Effective-date filtering supported.
* [ ] Tenant isolation verified.
* [ ] Query authorization verified.
* [ ] Retrieval evaluation completed.
* [ ] Monitoring enabled.
* [ ] Alerting enabled.
* [ ] Migration procedure documented.
* [ ] Rollback tested.
* [ ] Rebuild procedure tested.

---

# 97. Final Principle

> **A production vector index is not merely a collection of embeddings; it is a controlled, versioned, traceable representation of the legal knowledge base.**

### Code vs Architecture Drift Gap Analysis

| Area | Current | Target | Gap | Action |
|------|---------|--------|-----|--------|
| Embedding | `sentence-transformers` local pipeline verified in `embeddings.py` | External Hugging Face APIs | Code uses local processing | Update documentation to reflect local embedding strategy |
| Pinecone | Generic `nyayasetu` namespace verified in `vectorstore.py` | Isolated Legal vs Contract KBs | Code does not isolate tenants | Refactor namespace logic or update docs to reflect single namespace MVP |
