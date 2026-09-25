# Vector Upsert Specification

**Project:** NyaySetu
**Document:** Deterministic Vector Upsert Pipeline
**Path:** `docs/rag/21-vector-upsert.md`
**Status:** Production Specification
**Version:** 1.0

---

# 1. Purpose

This document defines how NyaySetu creates and upserts vectors into Pinecone.

The upsert pipeline must be:

* deterministic;
* idempotent;
* tenant-safe;
* version-aware;
* embedding-version-aware;
* failure-tolerant;
* observable;
* recoverable.

The pipeline must prevent malformed, unauthorized, stale, or incorrectly embedded chunks from entering retrieval.

---

# 2. Core Architecture

```text
Canonical Supabase Chunk
        |
        v
Validation
        |
        v
Normalization
        |
        v
Embedding Input
        |
        v
HuggingFace Embedding
        |
        v
Vector Validation
        |
        v
Metadata Construction
        |
        v
Pinecone Upsert
        |
        v
Verification
        |
        v
Indexing State Update
```

---

# 3. Source of Truth

Supabase is authoritative.

Pinecone is a derived retrieval index.

Therefore:

```text
Supabase -> Pinecone
```

is the normal synchronization direction.

Pinecone must never become the system that defines whether a document exists.

---

# 4. Upsert Triggers

An upsert may be triggered by:

* new document ingestion;
* new document version;
* chunk creation;
* chunk correction;
* source correction;
* metadata correction;
* embedding-model migration;
* embedding-version migration;
* index rebuild;
* recovery from failed indexing.

---

# 5. Preconditions

Before upsert:

* document exists;
* document version exists;
* chunk exists;
* chunk belongs to the document version;
* chunk is authorized for indexing;
* chunk content is non-empty;
* metadata is valid;
* embedding model is available;
* target index exists;
* target namespace is resolved.

---

# 6. Indexing Eligibility

Not every extracted chunk should automatically become searchable.

Examples that may require rejection:

```text
empty chunk
OCR failure
corrupted text
unsupported language
invalid document state
missing provenance
invalid tenant association
```

The eligibility policy must be explicit.

---

# 7. Chunk Validation

Validate:

```text
chunk_id
document_id
document_version_id
content
organization
visibility
jurisdiction
domain
provenance
```

before embedding.

---

# 8. Content Validation

Reject:

```text
null
undefined
empty string
whitespace-only content
```

Example:

```typescript
if (!content || !content.trim()) {
  throw new IndexingValidationError(
    "Cannot embed empty chunk"
  );
}
```

---

# 9. Text Normalization

Embedding input should be normalized consistently.

Typical operations:

```text
Unicode normalization
whitespace normalization
control-character removal
line-break normalization
```

Do not remove legal punctuation blindly.

---

# 10. Legal Text Preservation

The normalization layer must preserve meaningful:

```text
section numbers
subclauses
exceptions
negations
definitions
dates
percentages
thresholds
conditions
```

Over-aggressive cleaning can change legal meaning.

---

# 11. Embedding Input

The embedding input should contain enough structural context.

Example:

```text
Document: Example Regulation
Section: 8
Heading: Security safeguards

[chunk text]
```

The exact template must remain stable.

---

# 12. Embedding Input Hash

Before embedding:

```text
embedding_input_hash =
SHA-256(normalized_embedding_input)
```

This hash is stored with the resulting vector metadata.

---

# 13. Why Hashing Matters

The hash allows the system to determine:

```text
same input -> same embedding requirement
changed input -> re-embedding required
```

---

# 14. Embedding Model

NyaySetu uses a HuggingFace embedding model according to the configured embedding architecture.

The exact model must be configured rather than hard-coded across application routes.

---

# 15. Embedding Configuration

Example:

```typescript
interface EmbeddingConfig {
  model: string;
  version: string;
  dimension: number;
  batchSize: number;
}
```

---

# 16. Dimension Validation

If the Pinecone index dimension is:

```text
768
```

the generated embedding must contain exactly:

```text
768
```

values.

Never rely on assumptions.

---

# 17. Vector Validation

Before upsert:

```typescript
function validateVector(vector: number[], expectedDimension: number) {
  if (vector.length !== expectedDimension) {
    throw new Error("Embedding dimension mismatch");
  }

  for (const value of vector) {
    if (!Number.isFinite(value)) {
      throw new Error("Embedding contains non-finite value");
    }
  }
}
```

---

# 18. Non-Finite Values

Reject:

```text
NaN
Infinity
-Infinity
```

Any such value indicates an embedding pipeline failure.

---

# 19. Stable Vector ID

The vector ID must be stable.

Recommended:

```text
chunk_id
```

or:

```text
document_version_id:chunk_id:embedding_version
```

The exact strategy must be consistent with migration requirements.

---

# 20. ID Determinism

Running the same indexing job twice must not create duplicate logical vectors.

Example:

```text
chunk_123
```

should remain:

```text
chunk_123
```

across retries.

---

# 21. Namespace Resolution

The namespace must be calculated server-side.

Example:

```typescript
const namespace = resolveNamespace({
  environment,
  visibility,
  organizationId
});
```

---

# 22. Never Trust Client Namespace

Do not accept:

```text
namespace
organization_id
index
```

from an untrusted client request.

The backend derives them from authenticated and canonical state.

---

# 23. Public Documents

Public legal sources may use a shared namespace.

Example:

```text
public
```

---

# 24. Organization Documents

Private organization content should be isolated.

Example:

```text
org_<organizationId>
```

or another approved deterministic strategy.

---

# 25. Namespace Consistency

The same document version must always resolve to the same namespace unless an intentional migration is occurring.

---

# 26. Metadata Construction

Metadata must be constructed by the centralized metadata builder defined in:

```text
docs/rag/20-pinecone-metadata.md
```

Do not duplicate metadata logic.

---

# 27. Upsert Record

Conceptually:

```typescript
const record = {
  id: chunk.id,
  values: embedding,
  metadata
};
```

---

# 28. Batch Upserts

Vectors should normally be batched.

Example:

```text
chunks
  -> batch 1
  -> batch 2
  -> batch 3
```

Batch size must respect:

* Pinecone limits;
* embedding-provider limits;
* memory limits;
* latency targets.

---

# 29. Adaptive Batching

If a batch fails because of payload or provider constraints:

1. record failure;
2. reduce batch size;
3. retry within configured limits.

Do not retry endlessly.

---

# 30. Idempotency

An upsert must be idempotent.

Running:

```text
upsert(chunk_123)
```

multiple times should result in one logical vector.

---

# 31. Idempotency Key

For job-level processing:

```text
document_version_id + embedding_version
```

may be used as an idempotency scope.

For vector-level processing:

```text
chunk_id + embedding_version
```

may be used.

---

# 32. Duplicate Prevention

Never use random vector IDs such as:

```typescript
crypto.randomUUID()
```

for every indexing attempt unless the system explicitly manages logical identity separately.

---

# 33. Update Semantics

If a chunk changes:

```text
same logical chunk ID
new content
new embedding_input_hash
new embedding
```

should replace the existing vector.

---

# 34. Re-Embedding Trigger

Re-embedding is required when:

* source text changes;
* chunking changes;
* embedding input template changes;
* embedding model changes;
* embedding model version changes;
* metadata required for embedding context changes.

---

# 35. Metadata-Only Update

If only retrieval metadata changes:

```text
embedding may not need regeneration
```

The system may update metadata independently if safe.

---

# 36. Embedding-Version Migration

Example:

```text
embedding_v1
    ->
embedding_v2
```

A migration must not silently overwrite production vectors unless the rollout strategy permits it.

---

# 37. Blue/Green Embedding Migration

Recommended:

```text
namespace_v1
namespace_v2
```

or separate indexes where appropriate.

Validate the new representation before switching retrieval.

---

# 38. Upsert State Machine

Recommended states:

```text
PENDING
VALIDATING
EMBEDDING
READY_TO_UPSERT
UPLOADING
VERIFYING
COMPLETED
FAILED
RETRYING
```

---

# 39. State Transitions

```text
PENDING
  |
  v
VALIDATING
  |
  v
EMBEDDING
  |
  v
READY_TO_UPSERT
  |
  v
UPLOADING
  |
  v
VERIFYING
  |
  v
COMPLETED
```

Failure can transition to:

```text
FAILED
```

or:

```text
RETRYING
```

depending on error classification.

---

# 40. Retryable Errors

Examples:

```text
temporary network failure
provider timeout
Pinecone transient error
rate limit
temporary service unavailable
```

---

# 41. Non-Retryable Errors

Examples:

```text
invalid dimension
missing chunk
invalid metadata
unauthorized organization
malformed source
unsupported embedding configuration
```

These should fail immediately.

---

# 42. Retry Policy

Use bounded exponential backoff.

Conceptually:

```text
delay = base * 2^attempt + jitter
```

Maximum retry count must be configured.

---

# 43. Retry Jitter

Randomized jitter helps avoid synchronized retries.

Do not use retry loops without a hard upper bound.

---

# 44. Partial Batch Failure

A batch can partially fail.

The system must identify which vectors were successfully indexed.

Do not mark the entire document complete simply because the request returned partially successful results.

---

# 45. Per-Vector Status

Recommended:

```typescript
interface VectorIndexStatus {
  chunkId: string;
  status: "pending" | "completed" | "failed";
  attempts: number;
  lastError?: string;
}
```

---

# 46. Database State

Supabase should track indexing state.

Example:

```text
index_status
indexed_at
index_error
embedding_version
embedding_input_hash
```

---

# 47. Transaction Boundary

Database transactions and Pinecone writes are separate systems.

There is no normal atomic transaction spanning both.

Therefore, design for eventual consistency.

---

# 48. Outbox Pattern

For larger deployments:

```text
Supabase transaction
      |
      v
Indexing Outbox
      |
      v
Worker
      |
      v
Pinecone
```

This prevents lost indexing events.

---

# 49. Simple MVP

For MVP:

```text
document saved
   ->
indexing job created
   ->
worker indexes chunks
   ->
status updated
```

The architecture must remain upgradeable to an outbox model.

---

# 50. Canonical-First Rule

Never create a Pinecone vector for data that is not successfully committed to the canonical database.

---

# 51. Orphan Vector Prevention

If Pinecone contains a vector with no corresponding canonical chunk, reconciliation must identify it.

---

# 52. Verification

After upsert, verify the operation where practical.

Possible verification:

```text
fetch vector by ID
```

or index statistics/reconciliation mechanisms.

Do not verify every vector indefinitely if the resulting cost is unreasonable.

---

# 53. Sampling Verification

For large batches, production systems may use:

```text
100% validation before upload
+
sampled post-upload verification
+
periodic reconciliation
```

---

# 54. Dry Run

Indexing should support dry-run mode.

Example:

```text
DRY_RUN=true
```

Dry run performs:

* validation;
* metadata generation;
* embedding validation;

but does not mutate Pinecone.

---

# 55. Audit Logging

Record:

```text
job_id
document_version_id
chunk_id
embedding_version
namespace
attempt
status
timestamp
error category
```

Avoid logging raw sensitive content.

---

# 56. Cost Controls

Embedding is often one of the most expensive stages.

Avoid re-embedding unchanged chunks.

Use:

```text
embedding_input_hash
```

to detect unchanged inputs.

---

# 57. Cache

If the exact same embedding input and model version already exist:

```text
reuse embedding
```

when the caching architecture allows it.

---

# 58. Cache Key

Example:

```text
hash(
  model_version +
  embedding_input_hash
)
```

---

# 59. Cache Safety

Cache entries must not cross tenant boundaries if tenant-specific content is included.

---

# 60. Rate Limiting

Embedding and Pinecone requests must respect provider limits.

Workers should use controlled concurrency.

---

# 61. Concurrency

Avoid launching thousands of embedding requests simultaneously.

Use:

```text
queue
worker pool
concurrency limit
```

---

# 62. Backpressure

When the provider slows down:

```text
queue grows
workers remain bounded
```

The system should not crash because all jobs execute concurrently.

---

# 63. Memory Management

Large documents must be processed incrementally.

Do not load an entire multi-hundred-page corpus into memory unnecessarily.

---

# 64. Large Document Strategy

```text
document
  |
  v
pages
  |
  v
chunks
  |
  v
embedding batches
  |
  v
vector batches
```

---

# 65. Security

Before indexing organization content verify:

```text
authenticated actor
organization ownership
document ownership
document visibility
```

---

# 66. Authorization Failure

If the worker receives an unauthorized indexing request:

```text
reject
audit
do not embed
do not upsert
```

---

# 67. Prompt Injection

The source text may contain malicious instructions.

Embedding does not mean the text is trusted.

The ingestion system must classify source content as:

```text
untrusted data
```

---

# 68. Retrieval Boundary

When retrieved later, document text must be treated as evidence, not instructions to the agent.

---

# 69. Metadata Validation Before Embedding

Where possible, validate metadata before expensive embedding operations.

This avoids unnecessary cost.

---

# 70. Embedding Failure

If embedding fails:

```text
do not create a Pinecone vector
```

Mark the indexing job retryable or failed according to the error.

---

# 71. Pinecone Failure

If embedding succeeds but Pinecone fails:

```text
retain embedding state
retry Pinecone upload
```

Do not regenerate embeddings unnecessarily.

---

# 72. Partial Recovery

A recovery job should be able to continue from:

```text
READY_TO_UPSERT
```

rather than repeating all previous stages.

---

# 73. Upsert Function Boundary

Recommended service:

```typescript
async function upsertChunkVector(
  chunkId: string
): Promise<UpsertResult> {
  // load canonical chunk
  // validate
  // normalize
  // embed
  // validate vector
  // construct metadata
  // resolve namespace
  // upsert
  // record status
}
```

---

# 74. Service Layer

Routes should not directly call Pinecone.

Preferred:

```text
API
 |
 v
Indexing Service
 |
 +--> Embedding Service
 |
 +--> Metadata Builder
 |
 +--> Pinecone Adapter
 |
 v
Database
```

---

# 75. Pinecone Adapter

The adapter should abstract provider-specific calls.

Example:

```typescript
interface VectorStore {
  upsert(
    namespace: string,
    records: VectorRecord[]
  ): Promise<void>;
}
```

---

# 76. Provider Independence

The audit engine should not depend directly on Pinecone SDK types.

This allows:

```text
Pinecone
   ->
another vector store
```

without rewriting the audit logic.

---

# 77. Index Configuration

The worker must verify:

```text
target index
dimension
metric
environment
```

before writing.

---

# 78. Environment Isolation

Development workers must never accidentally write production vectors.

Environment configuration should explicitly resolve:

```text
dev
staging
production
```

---

# 79. Production Guard

For destructive or high-impact production operations, require explicit environment configuration.

Example:

```text
PINECONE_ENVIRONMENT=production
```

must be deliberate.

---

# 80. Metrics

Track:

```text
vectors_attempted
vectors_succeeded
vectors_failed
embedding_latency
upsert_latency
retry_count
embedding_cache_hits
```

---

# 81. Failure Metrics

Track failure categories:

```text
validation
embedding
pinecone
authorization
timeout
rate_limit
unknown
```

---

# 82. Tracing

A job should have:

```text
job_id
trace_id
document_version_id
```

This allows end-to-end debugging.

---

# 83. Operational Alerts

Alert on:

* sustained indexing failures;
* excessive retries;
* dimension mismatch;
* Pinecone outage;
* embedding provider outage;
* growing indexing backlog;
* reconciliation drift.

---

# 84. Testing

Unit tests:

```text
normalization
hashing
metadata builder
vector validation
namespace resolution
retry classification
```

Integration tests:

```text
embedding provider
Pinecone adapter
Supabase state updates
```

---

# 85. Security Tests

Verify:

```text
tenant cannot index another tenant's document
worker cannot write unauthorized namespace
client cannot override organization metadata
```

---

# 86. Idempotency Test

Run the same upsert twice.

Expected:

```text
one logical vector
```

not:

```text
two vectors
```

---

# 87. Dimension Test

Mock an embedding with:

```text
767
```

or:

```text
769
```

dimensions.

Expected:

```text
upsert rejected
```

---

# 88. Metadata Test

Remove:

```text
chunk_id
```

Expected:

```text
validation failure
```

---

# 89. Retry Test

Simulate a transient Pinecone failure.

Expected:

```text
bounded retry
```

followed by:

```text
success
```

or:

```text
terminal failure
```

---

# 90. Permanent Failure Test

Simulate invalid metadata.

Expected:

```text
no retry storm
```

---

# 91. Reconciliation

Periodic reconciliation must compare:

```text
canonical chunks
vs
Pinecone vectors
```

It should identify:

```text
missing vectors
orphan vectors
stale vectors
wrong metadata
wrong namespace
wrong embedding version
```

---

# 92. Reconciliation Recovery

For missing vectors:

```text
enqueue indexing job
```

For stale vectors:

```text
enqueue re-indexing
```

For orphan vectors:

```text
enqueue safe deletion
```

---

# 93. Rebuild

A complete rebuild should be able to:

```text
read canonical chunks
validate
embed
upsert
verify
report
```

without modifying the canonical content.

---

# 94. Rollback

If a new embedding version causes retrieval degradation:

```text
switch retrieval configuration
```

rather than attempting to mathematically reverse embeddings.

---

# 95. Retrieval Evaluation

Every major embedding migration should be evaluated for:

```text
Recall@K
precision
groundedness
citation accuracy
retrieval latency
```

---

# 96. Legal Integrity

A successful vector upsert does not imply legal correctness.

It only means:

```text
retrieval representation successfully stored
```

Legal validity must be established through source authority, versioning, provenance, and audit logic.

---

# 97. Acceptance Checklist

* [ ] Canonical chunk exists.
* [ ] Chunk is eligible for indexing.
* [ ] Content is non-empty.
* [ ] Text normalization is deterministic.
* [ ] Embedding input hash is generated.
* [ ] Correct embedding model is used.
* [ ] Correct dimension is validated.
* [ ] All vector values are finite.
* [ ] Stable vector ID is used.
* [ ] Metadata is validated.
* [ ] Namespace is server-resolved.
* [ ] Organization isolation is enforced.
* [ ] Batch size is controlled.
* [ ] Retries are bounded.
* [ ] Partial failures are tracked.
* [ ] Indexing status is persisted.
* [ ] Pinecone errors are observable.
* [ ] Reconciliation exists.
* [ ] Duplicate logical vectors are prevented.
* [ ] Embedding cache can prevent unnecessary recomputation.
* [ ] Production environment is protected.
* [ ] Tests cover critical failure modes.

---

# 98. Final Principle

> **Indexing is a controlled transformation from canonical evidence into a searchable representation.**

NyaySetu must never treat successful storage as proof of correctness.

The correct sequence is:

```text
validate
  ->
normalize
  ->
embed
  ->
validate vector
  ->
attach provenance
  ->
upsert
  ->
verify
  ->
reconcile
```

### Code vs Architecture Drift Gap Analysis

| Area | Current | Target | Gap | Action |
|------|---------|--------|-----|--------|
| Embedding | `sentence-transformers` local pipeline verified in `embeddings.py` | External Hugging Face APIs | Code uses local processing | Update documentation to reflect local embedding strategy |
| Pinecone | Generic `nyayasetu` namespace verified in `vectorstore.py` | Isolated Legal vs Contract KBs | Code does not isolate tenants | Refactor namespace logic or update docs to reflect single namespace MVP |
