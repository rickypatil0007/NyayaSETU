# NyaySetu Pinecone Architecture Specification

**Project:** NyaySetu
**Module:** RAG Knowledge Base
**File:** `docs/rag/17-pinecone-architecture.md`
**Status:** Production Specification

---

# 1. Purpose

Pinecone is the vector retrieval layer of the NyaySetu RAG system.

Its primary responsibility is to store embeddings generated from validated legal chunks and return semantically relevant evidence for compliance audits.

Pinecone is not the canonical legal database.

The canonical source and complete metadata remain associated with the application's persistent database and source documents.

---

# 2. RAG Architecture

```text
Legal Source
    ↓
Document Processing
    ↓
Legal Structure Detection
    ↓
Legal Chunking
    ↓
Chunk Metadata
    ↓
Embedding Model
    ↓
Pinecone
    ↓
Semantic Retrieval
    ↓
Evidence Selection
    ↓
Agents
```

---

# 3. Core Principle

Pinecone stores vectors for retrieval.

It does not become the authoritative source of legal truth.

---

# 4. Responsibilities

Pinecone is responsible for:

* vector storage;
* approximate nearest-neighbor search;
* metadata filtering;
* namespace isolation where configured;
* similarity retrieval;
* vector lifecycle operations.

---

# 5. Non-Responsibilities

Pinecone should not be responsible for:

* legal interpretation;
* compliance classification;
* final citations;
* document authority decisions;
* amendment resolution;
* audit conclusions.

---

# 6. Canonical Data Ownership

The recommended ownership model is:

```text
Supabase/PostgreSQL
    ↓
Canonical application records

Pinecone
    ↓
Retrieval index
```

---

# 7. Source of Truth

For any retrieved vector:

```text
vector
 ↓
chunk_id
 ↓
canonical chunk
 ↓
document version
 ↓
source
```

The final evidence should be reconstructed from the canonical record.

---

# 8. Embedding Compatibility

Every Pinecone index must be configured for the exact embedding dimensionality produced by the selected embedding model.

Example:

```text
Embedding Model
      ↓
Dimension = D
      ↓
Pinecone Index
      ↓
Dimension = D
```

`D` must match exactly.

---

# 9. Embedding Model Contract

The embedding layer must expose:

```typescript
interface EmbeddingProvider {
  modelName: string;
  dimension: number;
  version: string;

  embed(text: string): Promise<number[]>;
}
```

---

# 10. Dimension Validation

Before ingestion:

```typescript
if (embedding.length !== configuredDimension) {
  throw new Error("Embedding dimension mismatch");
}
```

---

# 11. Index Configuration

The index configuration should define:

```text
index_name
dimension
metric
region/cloud
embedding_version
```

---

# 12. Similarity Metric

The similarity metric must be selected according to the embedding model and retrieval strategy.

Common choices include:

```text
cosine
dotproduct
euclidean
```

Do not choose a metric arbitrarily.

---

# 13. Production Rule

Once a production corpus has been indexed, changing embedding dimensions or fundamental vector configuration should be treated as a migration event.

---

# 14. Index Naming

Use predictable names.

Example:

```text
nyayasetu-legal-prod
nyayasetu-legal-staging
```

Avoid embedding secrets or sensitive user information in index names.

---

# 15. Environment Separation

Development, staging, and production indexes should not unintentionally share data.

---

# 16. Recommended Environment Model

```text
Development
    ↓
nyayasetu-legal-dev

Staging
    ↓
nyayasetu-legal-staging

Production
    ↓
nyayasetu-legal-prod
```

---

# 17. Namespace Strategy

Namespaces provide an additional logical partitioning mechanism.

Possible strategy:

```text
public
org_<organization_id>
```

However, namespace strategy must be consistent with the application's authorization model.

---

# 18. Public Legal Knowledge

Public regulatory material can use a controlled namespace such as:

```text
legal_public
```

---

# 19. Organization Knowledge

Private organizational policies can use an organization-specific namespace where appropriate.

---

# 20. Namespace Security

A client must never be allowed to select an arbitrary namespace.

Namespace selection should be derived from trusted server-side authorization context.

---

# 21. Multi-Tenant Retrieval

A retrieval request should conceptually become:

```text
authenticated_user
        ↓
organization
        ↓
authorized namespace/filter
        ↓
Pinecone query
```

---

# 22. Public + Private Retrieval

Some audits may require both:

```text
Public Law
+
Organization Evidence
```

The retrieval architecture should support combining these sources without violating isolation.

---

# 23. Separate Source Classes

Recommended conceptual distinction:

```text
LEGAL_SOURCE
ORGANIZATION_SOURCE
```

---

# 24. Legal Source

Examples:

* statutes;
* regulations;
* rules;
* government notifications;
* official guidance.

---

# 25. Organization Source

Examples:

* internal policies;
* procedures;
* contracts;
* evidence documents;
* compliance records.

---

# 26. Retrieval Isolation

Private organization evidence must never become globally searchable.

---

# 27. Vector Record

A Pinecone vector should conceptually contain:

```typescript
interface VectorRecord {
  id: string;
  values: number[];
  metadata: PineconeMetadata;
}
```

---

# 28. Vector ID

The vector ID should map directly to the application chunk.

Example:

```text
chunk_<stable-id>
```

---

# 29. Stable IDs

Vector IDs should not be random if deterministic identity is possible.

Stable IDs simplify:

* updates;
* deletion;
* reconciliation;
* debugging.

---

# 30. Upsert

When a chunk is created:

```text
chunk
 ↓
embedding
 ↓
vector
 ↓
upsert
```

---

# 31. Idempotency

Repeated ingestion of the same chunk version should not create duplicate vectors.

---

# 32. Idempotent Key

A deterministic vector ID enables:

```text
upsert(vector_id)
```

to replace the previous vector.

---

# 33. Metadata

Pinecone metadata should remain compact.

Recommended fields include:

```text
chunk_id
document_id
document_version_id
organization_id
source_type
jurisdiction
regulatory_domain
structure_type
section_number
effective_from
effective_to
```

---

# 34. Canonical Text

Do not rely on Pinecone metadata as the sole storage location for full legal text.

---

# 35. Database Retrieval

After vector search:

```text
Pinecone
 ↓
chunk IDs
 ↓
Supabase
 ↓
canonical chunks
```

---

# 36. Retrieval Result

A result should contain:

```typescript
interface RetrievalMatch {
  chunkId: string;
  score: number;
  metadata: PineconeMetadata;
}
```

---

# 37. Score Interpretation

Similarity score indicates retrieval similarity.

It is not:

```text
legal confidence
compliance confidence
truth probability
```

---

# 38. Top-K

The number of candidates retrieved should be configurable.

Example:

```text
candidate_k
```

should be tuned through evaluation.

---

# 39. Candidate Retrieval

A practical flow:

```text
User/Audit Requirement
        ↓
Query Embedding
        ↓
Pinecone Top-K
        ↓
Metadata Filtering
        ↓
Reranking
        ↓
Evidence Selection
```

---

# 40. Filtering

Metadata filters should narrow retrieval to appropriate sources.

Potential filters:

```text
jurisdiction
document_type
authority
effective date
organization
language
```

---

# 41. Effective Date

Historical audits may require retrieval of the legal version applicable at the audit date.

Therefore effective-date metadata is critical.

---

# 42. Historical Query

Conceptually:

```text
effective_from <= audit_date
AND
(effective_to IS NULL OR effective_to >= audit_date)
```

The actual Pinecone filter syntax must match the SDK/API version in use.

---

# 43. Current Query

For current compliance:

```text
active/current source version
```

should be selected according to the application's versioning policy.

---

# 44. Conflicting Sources

If multiple sources retrieve:

```text
same topic
different requirements
```

do not silently merge them.

---

# 45. Authority Metadata

The retrieval layer should preserve source authority information.

---

# 46. Source Ranking

Retrieval ranking may combine:

```text
semantic similarity
+
authority
+
effective date
+
document relevance
```

but the legal authority policy must remain explicit.

---

# 47. Reranking

Pinecone should provide candidates.

A reranking layer may subsequently determine which candidates are most relevant to the exact audit requirement.

---

# 48. Hybrid Retrieval

Where necessary, Pinecone semantic retrieval can be combined with keyword or database search.

---

# 49. Exact Legal Terms

Exact terms may be important when querying:

```text
section numbers
regulation identifiers
defined terms
specific obligations
```

---

# 50. Hybrid Architecture

```text
             Query
               ↓
       ┌───────┴───────┐
       ↓               ↓
Semantic Search    Keyword Search
       ↓               ↓
       └───────┬───────┘
               ↓
          Fusion/Rerank
               ↓
            Evidence
```

---

# 51. Query Embedding

The same embedding model family/version used for indexing should normally be used for queries.

---

# 52. Model Consistency

Do not index with one embedding space and query using an incompatible embedding space.

---

# 53. Embedding Version

Store:

```text
embedding_model
embedding_version
embedding_dimension
```

with the corpus.

---

# 54. Re-Embedding

Changing the embedding model generally requires rebuilding or reindexing the affected corpus.

---

# 55. Index Migration

Recommended process:

```text
Create new index
      ↓
Index new corpus
      ↓
Run evaluation
      ↓
Verify retrieval
      ↓
Switch application
      ↓
Retire old index
```

---

# 56. Zero-Downtime Migration

Use separate indexes where the infrastructure permits controlled migration.

---

# 57. Rollback

The previous index should remain available until the new index has been validated.

---

# 58. Deletion

When a document version is deleted:

```text
document
 ↓
chunks
 ↓
vector IDs
 ↓
Pinecone deletion
```

must occur according to the retention policy.

---

# 59. Selective Deletion

Prefer deleting by deterministic vector IDs or controlled metadata filters rather than broad destructive operations.

---

# 60. Reconciliation

A scheduled job should compare:

```text
Supabase chunks
vs
Pinecone vectors
```

---

# 61. Orphan Vector

An orphan vector is a Pinecone record without a valid canonical chunk.

---

# 62. Missing Vector

A missing vector occurs when a valid indexed chunk expected in Pinecone has no corresponding vector.

---

# 63. Reconciliation Status

Track:

```text
SYNCED
MISSING_VECTOR
ORPHAN_VECTOR
STALE_VECTOR
METADATA_MISMATCH
```

---

# 64. Stale Vector

A vector becomes stale when the canonical chunk changes without a corresponding re-embedding.

---

# 65. Hash Detection

Compare:

```text
canonical content hash
+
embedding input hash
```

to detect stale records.

---

# 66. Ingestion Job

Recommended ingestion state:

```text
RECEIVED
PROCESSING
CHUNKED
EMBEDDING
INDEXING
COMPLETED
FAILED
```

---

# 67. Failure Handling

Transient Pinecone errors should be retried with bounded exponential backoff.

---

# 68. Retry Limits

Never retry indefinitely.

---

# 69. Dead-Letter State

Repeatedly failing vectors should be moved to a reviewable failed state.

---

# 70. Batch Upsert

Batching can improve ingestion performance.

Batch sizes should be tuned against:

* provider limits;
* payload size;
* network performance;
* failure recovery.

---

# 71. Partial Failure

A failed batch must not be assumed to have completely failed.

The ingestion system should verify the final state where required.

---

# 72. Rate Limiting

Respect provider limits.

Do not create uncontrolled concurrent indexing workers.

---

# 73. Cost Control

Embedding generation is often more expensive than vector storage.

Avoid re-embedding unchanged chunks.

---

# 74. Cache

Cache embeddings using a deterministic:

```text
content hash
+
embedding model/version
```

key.

---

# 75. Query Caching

Frequently repeated retrieval queries may be cached when safe.

Private organization results must not leak through shared caches.

---

# 76. Security

Pinecone credentials must exist only on trusted server infrastructure.

---

# 77. Client Security

The browser should not receive unrestricted Pinecone credentials.

---

# 78. Environment Variables

Secrets should be loaded through server-side environment configuration.

Example:

```text
PINECONE_API_KEY
PINECONE_INDEX_NAME
PINECONE_NAMESPACE
```

Exact names should match the project implementation.

---

# 79. Secret Logging

Never log:

```text
API keys
tokens
authorization headers
```

---

# 80. Query Authorization

Authorization must happen before retrieval.

---

# 81. Metadata Authorization

Metadata filters must be constructed server-side.

---

# 82. Prompt Injection

Pinecone retrieval does not make documents trustworthy.

Retrieved text remains untrusted source data.

---

# 83. Agent Boundary

Agents must receive:

```text
retrieved evidence
+
source metadata
```

under a controlled prompt contract.

---

# 84. Citation Boundary

An agent cannot invent a citation that does not correspond to a retrieved chunk.

---

# 85. Observability

Record:

```text
retrieval_request_id
query_hash
index
namespace
top_k
filters
latency
result_count
```

Avoid logging sensitive query content unnecessarily.

---

# 86. Retrieval Trace

For every audit, it should be possible to identify:

```text
query
→ embedding version
→ Pinecone index
→ filter
→ retrieved chunks
→ reranking
→ final evidence
```

---

# 87. Audit Reproducibility

Historical audit records should preserve enough retrieval metadata to explain how evidence was selected.

---

# 88. Performance Metrics

Track:

```text
query_latency
p50
p95
p99
```

where operationally useful.

---

# 89. Retrieval Metrics

Evaluate:

```text
Recall@K
Precision@K
MRR
NDCG
citation accuracy
```

---

# 90. Availability

If Pinecone becomes unavailable, the system must fail safely.

---

# 91. Safe Failure

Do not produce unsupported legal conclusions when retrieval is unavailable.

---

# 92. Error State

Example:

```text
Evidence retrieval unavailable.
The audit cannot safely continue without verified legal sources.
```

---

# 93. Degraded Mode

A read-only cached evidence mode may exist only if its provenance and freshness can be guaranteed.

---

# 94. Backup

The canonical database and source corpus must remain recoverable independently of Pinecone.

---

# 95. Pinecone Is Rebuildable

The architecture should make it possible to recreate the vector index from:

```text
source documents
+
processing configuration
+
embedding model/version
```

---

# 96. Rebuild Procedure

```text
Restore source
 ↓
Extract
 ↓
Clean
 ↓
Structure
 ↓
Chunk
 ↓
Embed
 ↓
Create index
 ↓
Upsert
 ↓
Evaluate
```

---

# 97. Production Acceptance

The architecture is acceptable when:

* vectors map to canonical chunks;
* embedding dimensions match;
* tenant boundaries are enforced;
* version metadata exists;
* deletion is deterministic;
* stale vectors can be detected;
* index rebuild is possible;
* retrieval is measurable;
* credentials remain server-side.

---

# 98. Production Checklist

* [ ] Correct embedding dimension.
* [ ] Correct similarity metric.
* [ ] Environment-separated indexes.
* [ ] Namespace strategy.
* [ ] Tenant isolation.
* [ ] Stable vector IDs.
* [ ] Compact metadata.
* [ ] Supabase mapping.
* [ ] Effective-date filtering.
* [ ] Source authority metadata.
* [ ] Idempotent upsert.
* [ ] Deterministic deletion.
* [ ] Reconciliation.
* [ ] Stale-vector detection.
* [ ] Retry policy.
* [ ] Rate limiting.
* [ ] Secret management.
* [ ] Retrieval observability.
* [ ] Evaluation metrics.
* [ ] Disaster recovery.
* [ ] Rebuild procedure.

---

# 99. Final Principle

> **Pinecone accelerates discovery of legal evidence; it does not become the legal authority itself.**

### Code vs Architecture Drift Gap Analysis

| Area | Current | Target | Gap | Action |
|------|---------|--------|-----|--------|
| Embedding | `sentence-transformers` local pipeline verified in `embeddings.py` | External Hugging Face APIs | Code uses local processing | Update documentation to reflect local embedding strategy |
| Pinecone | Generic `nyayasetu` namespace verified in `vectorstore.py` | Isolated Legal vs Contract KBs | Code does not isolate tenants | Refactor namespace logic or update docs to reflect single namespace MVP |
