# NyaySetu HuggingFace Embedding Model Specification

**Project:** NyaySetu
**Module:** RAG Knowledge Base
**File:** `docs/rag/14-huggingface-embedding-model.md`
**Status:** Production Specification

---

# 1. Purpose

NyaySetu requires an embedding model to transform legal and regulatory text into numerical vectors for semantic retrieval.

The embedding subsystem must provide:

* semantic representation;
* reproducible vector generation;
* predictable dimensionality;
* acceptable retrieval quality;
* efficient inference;
* model version tracking.

The embedding model is a retrieval component, not a legal reasoning model.

---

# 2. Architecture

```text
Legal Document
      ↓
Text Extraction
      ↓
Text Cleaning
      ↓
Legal Chunking
      ↓
Embedding Model
      ↓
Vector
      ↓
Pinecone
```

---

# 3. Embedding Provider

The planned embedding stack uses:

```text
HuggingFace
+
sentence-transformers-compatible embedding model
+
Pinecone
```

The exact model must be configurable through environment/configuration rather than hard-coded throughout the application.

---

# 4. Model Selection Requirements

The selected model should be evaluated for:

* semantic retrieval quality;
* legal-domain performance;
* multilingual support where required;
* embedding dimension;
* inference speed;
* memory requirements;
* licensing;
* deployment feasibility;
* community maturity.

---

# 5. Important Principle

Do not select an embedding model merely because it is popular.

The final model should be selected using NyaySetu's evaluation corpus.

---

# 6. Recommended Evaluation Process

Evaluate multiple candidate models against:

```text
retrieval recall
precision
MRR
nDCG
citation accuracy
latency
memory usage
index size
```

---

# 7. Candidate Model Abstraction

The application should expose a provider-neutral interface.

```typescript
interface EmbeddingProvider {
  modelId: string;
  dimension: number;

  embed(text: string): Promise<number[]>;

  embedBatch(
    texts: string[]
  ): Promise<number[][]>;
}
```

---

# 8. Why an Abstraction Matters

The application should be able to replace:

```text
Model A
```

with:

```text
Model B
```

without rewriting:

* chunking;
* retrieval;
* agent orchestration;
* audit logic.

---

# 9. Model Configuration

Recommended configuration:

```text
EMBEDDING_PROVIDER=huggingface
EMBEDDING_MODEL=<model-id>
EMBEDDING_DIMENSION=<dimension>
EMBEDDING_VERSION=<version>
```

---

# 10. Dimension Must Match the Vector Index

If the embedding model outputs:

```text
768 dimensions
```

Pinecone must be configured for:

```text
768
```

If it outputs:

```text
1024 dimensions
```

the index must use:

```text
1024
```

---

# 11. Critical Rule

Never assume the dimension.

The application must verify the actual output dimension.

---

# 12. Startup Validation

At application startup or deployment validation:

```typescript
const vector = await embeddingProvider.embed("NyaySetu test");

if (vector.length !== configuredDimension) {
  throw new Error("Embedding dimension mismatch");
}
```

---

# 13. Dimension Mismatch Failure

A mismatch must fail explicitly.

Example:

```text
Model output:
768

Configured:
3072

Result:
FAIL FAST
```

Do not truncate or pad vectors automatically.

---

# 14. Model Identity

Every embedding operation must be attributable to a model identity.

Store:

```text
provider
model_id
model_version
dimension
```

---

# 15. Model Revision

If the model provider exposes revisions or commit hashes, preserve them.

Example:

```text
model_revision=<revision>
```

This improves reproducibility.

---

# 16. Embedding Normalization

Some embedding models recommend normalized vectors.

The implementation must follow the selected model's documented behavior.

Do not arbitrarily normalize vectors without evaluating the retrieval impact.

---

# 17. Similarity Metric

Pinecone similarity should match the embedding strategy.

Common choices include:

```text
cosine
dotproduct
euclidean
```

The chosen metric must be documented.

---

# 18. Default Recommendation

For semantic text embeddings, cosine similarity is a reasonable starting point.

However, final selection must be validated experimentally.

---

# 19. Query and Document Consistency

The same embedding model configuration must be used for:

```text
document chunks
```

and:

```text
user queries
```

unless the selected model explicitly supports a different query/document encoding strategy.

---

# 20. Asymmetric Embedding Models

If the selected model supports separate:

```text
query encoding
document encoding
```

the provider interface must expose that capability.

---

# 21. Example Interface

```typescript
interface EmbeddingProvider {
  embedDocument(text: string): Promise<number[]>;
  embedQuery(text: string): Promise<number[]>;
}
```

---

# 22. Batch Embeddings

Large ingestion jobs should use batching.

Example:

```text
500 chunks
 ↓
batch 1
batch 2
batch 3
...
```

Batch size should be configurable.

---

# 23. Batch Size

Do not assume a single batch size works for every deployment.

Factors include:

* available RAM;
* CPU;
* GPU;
* model size;
* sequence length.

---

# 24. Sequence Length

Legal chunks may exceed the model's supported input length.

The chunking subsystem must therefore respect the model's maximum sequence length.

---

# 25. Truncation

Silent truncation is dangerous.

If text exceeds the embedding model's limit:

```text
chunk
 ↓
detect overflow
 ↓
split appropriately
```

rather than silently discarding the end.

---

# 26. Chunking Dependency

Embedding configuration must be known before final chunking parameters are selected.

---

# 27. Token-Based Chunking

Where practical, chunk sizes should be defined using model tokens rather than characters alone.

---

# 28. Legal Context Preservation

Chunking must not split critical structures arbitrarily.

Examples:

```text
Section
Subsection
Exception
Condition
Penalty
```

should remain logically connected whenever possible.

---

# 29. Embedding Input

Embedding input should generally contain:

```text
document title
section identifier
section title
legal text
```

where this improves retrieval.

---

# 30. Metadata Is Not Automatically Embedded

Metadata such as:

```text
effective_date
jurisdiction
authority
document_id
```

may be stored as vector metadata rather than embedded into the text.

The choice should be evaluated.

---

# 31. Retrieval Context

Example embedding text:

```text
Regulation: Data Protection Regulation

Section 7 — Retention Requirements

Organizations shall retain records for seven years...
```

This is often more useful than embedding an isolated sentence.

---

# 32. Avoid Excessive Metadata

Do not prepend large amounts of metadata.

The embedding should primarily represent meaningful legal content.

---

# 33. Model Download

If using local HuggingFace inference, model files may need to be downloaded during deployment or build preparation.

Production deployments should avoid downloading large models unexpectedly during every request.

---

# 34. Model Caching

Cache model files where infrastructure permits.

---

# 35. Cold Starts

Large embedding models can increase cold-start latency.

For serverless deployment, evaluate:

```text
model size
startup time
memory
execution limits
```

before selecting local inference.

---

# 36. Alternative Inference

If local HuggingFace inference is unsuitable for the production runtime, use an approved inference endpoint or dedicated embedding worker while keeping the provider abstraction unchanged.

---

# 37. Free-Stack Constraint

The initial implementation should prioritize infrastructure that fits the project's free/low-cost constraints.

Avoid architecture that requires expensive always-on GPU infrastructure for the MVP.

---

# 38. CPU Inference

CPU inference may be acceptable for:

* small corpora;
* development;
* demonstrations;
* low-volume ingestion.

Performance must be measured.

---

# 39. GPU Inference

GPU inference may be introduced when:

* corpus size increases;
* ingestion throughput becomes a bottleneck;
* evaluation shows meaningful performance benefits.

---

# 40. Embedding Determinism

For a fixed:

```text
model
revision
input
configuration
```

the output should be reproducible within expected numerical tolerances.

---

# 41. Floating-Point Precision

Document the inference precision.

Examples:

```text
float32
float16
bfloat16
```

Do not mix representations without understanding the effect on retrieval.

---

# 42. Vector Storage Precision

Pinecone configuration must be compatible with the generated vectors.

---

# 43. Empty Text

Do not generate embeddings for empty or whitespace-only chunks.

---

# 44. Minimum Content

Very small chunks may provide poor semantic representations.

The chunking layer should enforce minimum meaningful content.

---

# 45. Duplicate Text

Exact duplicate chunks should be detected before unnecessary embedding generation where practical.

---

# 46. Duplicate Embeddings

Deduplication can reduce:

* inference cost;
* vector count;
* retrieval noise.

However, identical text from different authoritative documents may still require separate provenance.

---

# 47. Provenance Preservation

Even if two chunks contain identical text, their metadata may differ:

```text
source_document_A
source_document_B
```

Never merge them in a way that loses provenance.

---

# 48. Model License

Before production deployment, verify:

* model license;
* commercial-use restrictions;
* redistribution terms;
* attribution requirements.

Record the result in:

```text
docs/18-sources.md
```

---

# 49. Model Security

Do not execute arbitrary model files or code from untrusted sources.

Use trusted model repositories and pinned revisions.

---

# 50. Dependency Pinning

Pin:

```text
embedding library
model revision
runtime version
```

where practical.

---

# 51. Model Integrity

If the deployment process supports checksums, verify model artifacts.

---

# 52. Embedding Service Health

Expose a health check:

```text
GET /health/embedding
```

or an equivalent internal health mechanism.

---

# 53. Health Check Requirements

Verify:

```text
model loaded
dimension correct
inference operational
```

---

# 54. Error Handling

Possible errors:

```text
EMBEDDING_MODEL_LOAD_FAILED
EMBEDDING_DIMENSION_MISMATCH
EMBEDDING_INPUT_TOO_LARGE
EMBEDDING_PROVIDER_TIMEOUT
EMBEDDING_BATCH_FAILED
```

---

# 55. Retry Policy

Transient inference failures may be retried.

Permanent failures such as dimension mismatch must not be retried indefinitely.

---

# 56. Timeouts

Embedding operations must have bounded timeouts.

---

# 57. Observability

Track:

```text
embedding_requests
embedding_failures
embedding_latency
batch_size
tokens_processed
chunks_processed
```

---

# 58. Cost Metrics

If using a paid inference endpoint, track:

```text
estimated_embedding_cost
```

For local inference, track:

```text
processing_time
resource_usage
```

---

# 59. Evaluation Dataset

Create representative queries covering:

```text
obligations
deadlines
retention
privacy
reporting
penalties
exceptions
definitions
applicability
jurisdiction
```

---

# 60. Retrieval Evaluation

Compare candidate models using the same:

```text
corpus
queries
ground-truth relevance labels
retrieval configuration
```

---

# 61. Metrics

Recommended:

```text
Recall@k
Precision@k
MRR
nDCG
Hit Rate
```

---

# 62. Legal Retrieval Priority

For NyaySetu, retrieval should prioritize:

```text
correct authority
+
correct provision
+
correct version
+
correct jurisdiction
```

not merely semantic similarity.

---

# 63. Model Selection Score

A practical evaluation score can combine:

```text
retrieval quality
+
citation quality
+
latency
+
resource cost
```

The exact weighting must be documented.

---

# 64. Production Model

Once selected, designate one model as:

```text
PRODUCTION_EMBEDDING_MODEL
```

---

# 65. Model Change

Changing the embedding model is a migration event.

It requires:

```text
new model
→ new embeddings
→ new vector namespace/index
→ evaluation
→ migration
```

---

# 66. No Mixed Model Index

Do not mix embeddings from incompatible models in one semantic vector space.

---

# 67. Query Compatibility

After a model migration, queries must use the same embedding model as indexed documents.

---

# 68. Rollback

Maintain the previous embedding configuration long enough to support rollback.

---

# 69. Configuration Example

```env
EMBEDDING_PROVIDER=huggingface
EMBEDDING_MODEL=selected-model
EMBEDDING_DIMENSION=768
EMBEDDING_VERSION=1
EMBEDDING_METRIC=cosine
```

Values are examples and must be replaced with the evaluated production configuration.

---

# 70. Acceptance Criteria

The embedding model system must:

* use a configurable HuggingFace model;
* expose a provider abstraction;
* verify vector dimension;
* preserve model identity;
* support batching;
* handle input limits;
* support reproducible processing;
* preserve provenance;
* expose health status;
* provide bounded retries;
* support evaluation;
* support model migration.

---

# 71. Production Checklist

* [ ] Model selected through evaluation.
* [ ] License verified.
* [ ] Model revision pinned.
* [ ] Dimension verified.
* [ ] Similarity metric selected.
* [ ] Query/document strategy defined.
* [ ] Batch inference implemented.
* [ ] Sequence limits handled.
* [ ] Empty input rejected.
* [ ] Duplicate strategy defined.
* [ ] Provenance preserved.
* [ ] Model caching configured.
* [ ] Health checks exist.
* [ ] Timeouts exist.
* [ ] Retry policy exists.
* [ ] Metrics exist.
* [ ] Evaluation corpus exists.
* [ ] Migration procedure exists.
* [ ] Rollback procedure exists.

---

# 72. Final Principle

The embedding model is infrastructure for finding evidence.

It must never be treated as the source of legal truth.

> **The vector helps NyaySetu find the law; the source document establishes the law.**

### Code vs Architecture Drift Gap Analysis

| Area | Current | Target | Gap | Action |
|------|---------|--------|-----|--------|
| Embedding | `sentence-transformers` local pipeline verified in `embeddings.py` | External Hugging Face APIs | Code uses local processing | Update documentation to reflect local embedding strategy |
| Pinecone | Generic `nyayasetu` namespace verified in `vectorstore.py` | Isolated Legal vs Contract KBs | Code does not isolate tenants | Refactor namespace logic or update docs to reflect single namespace MVP |
