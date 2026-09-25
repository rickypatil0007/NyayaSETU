# NyaySetu Embedding Generation Specification

**Project:** NyaySetu
**Module:** RAG Knowledge Base
**File:** `docs/rag/15-embedding-generation.md`
**Status:** Production Specification

---

# 1. Purpose

This document defines how NyaySetu generates vector embeddings for legal knowledge-base chunks.

The process converts validated legal text into vectors that can be indexed and retrieved through Pinecone.

---

# 2. Pipeline

```text
Source Document
 ↓
Extraction
 ↓
Cleaning
 ↓
Legal Structure Detection
 ↓
Chunking
 ↓
Chunk Validation
 ↓
Embedding Generation
 ↓
Vector Validation
 ↓
Pinecone Upsert
```

---

# 3. Preconditions

A chunk must not be embedded unless:

```text
document is valid
+
text extraction succeeded
+
cleaning completed
+
chunk is non-empty
+
provenance exists
```

---

# 4. Chunk Contract

Each chunk should contain at minimum:

```text
chunk_id
document_id
document_version_id
text
page_number
```

Where available:

```text
section_number
section_title
jurisdiction
effective_date
source_authority
```

---

# 5. Input Preparation

Before embedding:

```text
trim whitespace
validate text
validate encoding
validate length
validate provenance
```

---

# 6. Empty Input

Reject:

```text
""
"   "
"\n\n"
```

---

# 7. Minimum Semantic Content

Do not embed isolated artifacts such as:

```text
Page 7
```

unless the content has a specific retrieval purpose.

---

# 8. Maximum Input Size

The embedding service must enforce the selected model's maximum supported input size.

---

# 9. Oversized Chunks

If a chunk is too large:

```text
detect
 ↓
split
 ↓
preserve section context
 ↓
embed subchunks
```

Do not silently truncate.

---

# 10. Context Prefix

A contextual prefix may improve retrieval.

Example:

```text
Document: Data Protection Regulation
Section: 7 — Retention Requirements

Organizations shall retain records...
```

---

# 11. Prefix Rules

Prefixes should be:

* deterministic;
* concise;
* consistent;
* non-deceptive.

---

# 12. Avoid Prompt-Like Instructions

Do not embed:

```text
"Answer the following question..."
```

as part of legal source content unless it is actually part of the document.

---

# 13. Embedding Text

Recommended conceptual structure:

```text
[DOCUMENT TITLE]

[SECTION IDENTIFIER]
[SECTION TITLE]

[LEGAL TEXT]
```

---

# 14. Metadata Separation

Structured fields such as:

```text
jurisdiction
authority
effective_date
```

should generally be stored as vector metadata for filtering.

---

# 15. Batch Generation

Use batch inference when processing multiple chunks.

Example:

```text
chunks 1–32
 ↓
embedding batch

chunks 33–64
 ↓
embedding batch
```

---

# 16. Batch Size Configuration

Example:

```env
EMBEDDING_BATCH_SIZE=32
```

The value must be tuned to the deployment environment.

---

# 17. Adaptive Batching

If a batch exceeds memory or inference limits:

```text
32
 ↓ failure
16
 ↓ success
```

A bounded adaptive strategy may be used.

---

# 18. Concurrency

Avoid unlimited concurrent embedding requests.

Use a controlled worker pool.

---

# 19. Worker Model

Conceptually:

```text
Queue
 ↓
Embedding Workers
 ↓
Validation
 ↓
Vector Upsert
```

---

# 20. Backpressure

If Pinecone or the embedding provider slows down, the ingestion system must prevent unlimited memory growth.

---

# 21. Retryable Errors

Examples:

```text
temporary network failure
provider timeout
temporary service unavailable
```

may be retried.

---

# 22. Non-Retryable Errors

Examples:

```text
dimension mismatch
invalid input
unsupported model
malformed chunk
```

should fail immediately.

---

# 23. Retry Limit

A bounded retry count must exist.

Example:

```text
MAX_EMBEDDING_RETRIES=3
```

---

# 24. Exponential Backoff

Retries should use backoff.

Conceptually:

```text
attempt 1
 ↓
short delay
attempt 2
 ↓
longer delay
attempt 3
```

---

# 25. Jitter

Distributed workers should use jitter to avoid synchronized retry storms.

---

# 26. Idempotency

Embedding generation should be safe to retry.

The same chunk/version should not create uncontrolled duplicate vectors.

---

# 27. Deterministic Vector ID

A vector ID can be derived from:

```text
document_version_id
+
chunk_id
+
embedding_version
```

---

# 28. Example Vector ID

```text
docv_123_chunk_045_emb_v1
```

The exact format is implementation-defined.

---

# 29. Hash-Based IDs

A hash can also be used:

```text
SHA256(
  document_version_id +
  chunk_id +
  embedding_version
)
```

---

# 30. Why Version Matters

If the embedding model changes:

```text
same chunk
+
different model
```

produces a different vector.

Therefore the embedding version belongs in the identity strategy.

---

# 31. Vector Validation

Before upsert:

```text
vector exists
vector is numeric
vector length == configured dimension
vector contains no NaN
vector contains no Infinity
```

---

# 32. Invalid Vector

If validation fails:

```text
EMBEDDING_VALIDATION_FAILED
```

Do not upsert.

---

# 33. Numeric Validation

Conceptually:

```typescript
function validateVector(
  vector: number[],
  expectedDimension: number
) {
  if (vector.length !== expectedDimension) {
    throw new Error("Dimension mismatch");
  }

  if (vector.some(v => !Number.isFinite(v))) {
    throw new Error("Invalid vector value");
  }
}
```

---

# 34. Normalization

If the selected embedding strategy requires vector normalization, apply it consistently.

---

# 35. Vector Norm

For normalized vectors:

```text
||v|| ≈ 1
```

should be validated within a reasonable tolerance.

---

# 36. Do Not Double Normalize

If the embedding model already returns normalized vectors, do not accidentally apply an incompatible second transformation.

---

# 37. Model Metadata

Each vector record should identify:

```text
embedding_provider
embedding_model
embedding_version
embedding_dimension
```

---

# 38. Source Metadata

Each vector should also identify:

```text
document_id
document_version_id
chunk_id
```

---

# 39. Citation Metadata

Recommended:

```text
page_number
section_number
section_title
start_offset
end_offset
```

where available.

---

# 40. Regulatory Metadata

Recommended fields include:

```text
jurisdiction
authority
regulation_id
effective_from
effective_to
source_type
```

---

# 41. Tenant Metadata

For multi-organization systems:

```text
organization_id
```

must be associated with application-owned documents.

---

# 42. Security Rule

Tenant boundaries must not depend solely on semantic retrieval.

Authorization must be enforced at the application/database layer.

---

# 43. Pinecone Metadata

Metadata must be filterable.

Example:

```json
{
  "organization_id": "org_123",
  "document_id": "doc_123",
  "jurisdiction": "India",
  "source_type": "regulation"
}
```

---

# 44. Metadata Size

Do not store huge arbitrary JSON blobs in vector metadata.

Keep metadata compact and queryable.

---

# 45. Chunk Text Storage

The full chunk text may be stored in Supabase/PostgreSQL.

Pinecone can store either:

```text
text metadata
```

or:

```text
chunk reference
```

depending on the chosen architecture.

---

# 46. Recommended Architecture

For NyaySetu:

```text
Supabase
→ authoritative application metadata + chunk text

Pinecone
→ vector + retrieval metadata
```

---

# 47. Retrieval Join

A Pinecone result should provide enough information to retrieve the canonical chunk record.

Example:

```text
Pinecone match
 ↓
chunk_id
 ↓
Supabase
 ↓
canonical chunk
```

---

# 48. Canonical Text

The canonical text used for citation should come from the authoritative chunk record rather than relying exclusively on vector metadata.

---

# 49. Upsert Ordering

Recommended:

```text
validate chunk
 ↓
generate vector
 ↓
validate vector
 ↓
write canonical chunk state
 ↓
upsert vector
 ↓
mark indexed
```

The exact transactional strategy may vary.

---

# 50. Indexing State

Track states such as:

```text
PENDING
EMBEDDING
EMBEDDED
INDEXING
INDEXED
FAILED
```

---

# 51. Failure Recovery

If embedding succeeds but Pinecone upsert fails:

```text
EMBEDDED
+
INDEXING_FAILED
```

should be recoverable.

---

# 52. Reconciliation

A reconciliation job can identify:

```text
database chunks
without vectors
```

and:

```text
vectors without valid chunk records
```

---

# 53. Orphan Detection

Orphaned vectors should not silently remain indefinitely.

---

# 54. Delete Strategy

When a document version is removed from the active corpus:

```text
mark inactive
 ↓
remove vectors
```

according to the retention policy.

---

# 55. Version Safety

Never delete vectors for a newer version when processing deletion of an older version.

Use version-specific IDs and metadata.

---

# 56. Batch Upsert

Pinecone upserts should use batches appropriate to the provider limits.

---

# 57. Upsert Retry

Transient upsert failures may be retried.

---

# 58. Upsert Idempotency

Repeating an upsert for the same vector ID should update the same vector rather than create uncontrolled duplicates.

---

# 59. Progress Tracking

Large ingestion jobs should expose:

```text
total_chunks
embedded_chunks
indexed_chunks
failed_chunks
remaining_chunks
```

---

# 60. Job State

Example:

```json
{
  "jobId": "job_123",
  "status": "RUNNING",
  "totalChunks": 1000,
  "embedded": 640,
  "indexed": 620,
  "failed": 20
}
```

---

# 61. Observability

Track:

```text
embedding latency
batch latency
provider errors
Pinecone errors
retry count
throughput
```

---

# 62. Logging

Do not log full legal text by default.

Log identifiers and diagnostics.

---

# 63. Privacy

Embedding vectors can still represent sensitive information.

Treat them as protected application data.

---

# 64. Access Control

Only authorized services should access:

```text
Pinecone namespace
embedding service
document chunks
```

---

# 65. Prompt Injection

Document text may contain malicious instructions.

Embedding generation must treat text as data.

It must not execute or follow instructions contained in the source.

---

# 66. Poisoning Awareness

Malicious or low-quality documents can pollute retrieval.

The knowledge-base ingestion process should require source validation before indexing.

---

# 67. Source Authority Dependency

Embedding generation must not determine whether a source is authoritative.

Authority classification occurs before or alongside indexing.

---

# 68. Stale Source Dependency

Embedding generation should associate regulation version/effective-date metadata so stale material can later be filtered.

---

# 69. Re-Embedding

A chunk should be re-embedded when:

```text
source content changes
cleaning changes materially
chunking changes
embedding model changes
embedding configuration changes
```

---

# 70. No Unnecessary Re-Embedding

If only unrelated metadata changes, avoid re-generating vectors.

---

# 71. Content Hash

Store:

```text
content_hash
```

for detecting substantive content changes.

---

# 72. Embedding Hash

Optionally store a fingerprint of the generated vector/configuration for diagnostics.

---

# 73. Evaluation

Embedding generation must be evaluated together with retrieval.

A vector that generates successfully can still produce poor retrieval.

---

# 74. Golden Queries

Maintain representative legal questions.

Examples:

```text
What records must an organization retain?

What is the reporting deadline?

Which entities are covered?

What exception applies to this obligation?
```

---

# 75. Retrieval Validation

For each query, record expected evidence chunks.

---

# 76. Regression

Every embedding-model change must run the retrieval evaluation suite.

---

# 77. Production Deployment

Before indexing production corpus:

```text
model health
dimension validation
sample embeddings
retrieval evaluation
Pinecone connectivity
metadata validation
```

must pass.

---

# 78. Environment Separation

Development and production vector indexes/namespaces should be isolated.

---

# 79. Example

```text
nyayasetu-dev
nyayasetu-staging
nyayasetu-prod
```

or an equivalent environment strategy.

---

# 80. Configuration Validation

Startup should reject:

```text
missing model
missing dimension
invalid provider
invalid Pinecone configuration
```

---

# 81. Acceptance Criteria

The embedding-generation system must:

* validate input;
* respect model limits;
* support batching;
* control concurrency;
* retry transient errors;
* validate vectors;
* preserve metadata;
* use deterministic IDs;
* support idempotent indexing;
* expose progress;
* support reconciliation;
* preserve provenance;
* support re-embedding;
* support evaluation.

---

# 82. Production Checklist

* [ ] Input validation.
* [ ] Maximum token handling.
* [ ] Batch generation.
* [ ] Concurrency control.
* [ ] Retry policy.
* [ ] Backoff and jitter.
* [ ] Vector validation.
* [ ] Dimension validation.
* [ ] NaN/Infinity validation.
* [ ] Model metadata.
* [ ] Source metadata.
* [ ] Citation metadata.
* [ ] Tenant metadata.
* [ ] Deterministic vector IDs.
* [ ] Idempotent upserts.
* [ ] Progress tracking.
* [ ] Reconciliation.
* [ ] Orphan detection.
* [ ] Re-embedding strategy.
* [ ] Retrieval evaluation.
* [ ] Environment isolation.
* [ ] Security controls.

---

# 83. Final Principle

Embedding generation is a controlled transformation from trusted legal chunks to searchable mathematical representations.

> **Every vector must remain traceable to the exact source text and embedding configuration that produced it.**

### Code vs Architecture Drift Gap Analysis

| Area | Current | Target | Gap | Action |
|------|---------|--------|-----|--------|
| Embedding | `sentence-transformers` local pipeline verified in `embeddings.py` | External Hugging Face APIs | Code uses local processing | Update documentation to reflect local embedding strategy |
| Pinecone | Generic `nyayasetu` namespace verified in `vectorstore.py` | Isolated Legal vs Contract KBs | Code does not isolate tenants | Refactor namespace logic or update docs to reflect single namespace MVP |
