# NyaySetu RAG — Data Flow

## 1. Purpose

This document defines how data moves through the NyaySetu RAG subsystem from source ingestion to final audit evidence.

The data flow MUST preserve:

* source identity
* content integrity
* legal structure
* metadata
* temporal information
* embedding version
* retrieval information
* citation provenance

---

## 2. Complete Data Flow

```text
Authoritative Source
        |
        v
Source Registration
        |
        v
Document Acquisition
        |
        v
File Validation
        |
        v
Content Hash
        |
        v
Secure Storage
        |
        v
Text Extraction
        |
        +----> OCR if required
        |
        v
Text Cleaning
        |
        v
Legal Structure Detection
        |
        v
Legal Chunking
        |
        v
Metadata Generation
        |
        v
Embedding Generation
        |
        v
Pinecone Upsert
        |
        v
Index Verification
        |
        v
Knowledge Base Ready
```

---

## 3. Query Data Flow

```text
Audit Requirement
        |
        v
Query Builder
        |
        v
Query Normalization
        |
        v
Context Enrichment
        |
        +---- jurisdiction
        +---- audit date
        +---- regulation
        +---- source type
        |
        v
Embedding
        |
        v
Pinecone Search
        |
        v
Metadata Filtering
        |
        v
Candidate Results
        |
        v
Reranking
        |
        v
Context Selection
        |
        v
Citation Mapping
        |
        v
Agent Context
```

---

## 4. Source Registration

Before ingestion, register the source.

Required information SHOULD include:

```text
source_id
title
publisher
authority
jurisdiction
source_type
publication_date
effective_from
effective_until
version
source_url
```

A source SHOULD NOT enter the production knowledge base without sufficient provenance.

---

## 5. Document Acquisition

The acquisition layer obtains the source document.

Possible sources:

* official government website
* regulatory repository
* uploaded file
* licensed legal database
* approved internal corpus

The system MUST record where the document came from.

---

## 6. File Validation

Validate:

* file size
* file type
* MIME type
* file integrity
* supported format

Reject unsupported files.

---

## 7. Hash Generation

Generate a content hash before processing.

Example:

```text
SHA-256(document_bytes)
```

The hash allows:

* duplicate detection
* change detection
* reproducibility
* integrity verification

---

## 8. Secure Storage

The original document SHOULD be stored before transformation.

This creates an immutable source of truth for processing.

The processed text is derived data.

The original document is the authoritative ingestion artifact.

---

## 9. Extraction

The extraction layer attempts normal text extraction first.

For each page, retain:

```text
page_number
raw_text
extraction_method
extraction_quality
```

---

## 10. OCR Decision

If extracted text is empty or below a configured quality threshold, OCR MAY be invoked.

Example:

```text
IF extracted_text_quality < threshold
THEN OCR
```

The threshold MUST be configurable.

---

## 11. OCR Provenance

OCR-generated text MUST be marked as OCR-derived.

Example:

```json
{
  "extractionMethod": "OCR",
  "ocrConfidence": 0.91
}
```

OCR confidence MUST NOT be interpreted as legal confidence.

---

## 12. Text Cleaning

Cleaning SHOULD normalize:

* whitespace
* broken lines
* repeated headers
* repeated footers
* encoding artifacts

Cleaning MUST preserve legal meaning.

The cleaner MUST NOT remove words such as:

```text
not
unless
except
shall
may
must
only
```

---

## 13. Legal Structure Detection

The structure detector identifies patterns such as:

```text
Chapter I
Part A
Section 12
12(1)
12(1)(a)
Schedule I
Appendix A
```

The detected hierarchy SHOULD be stored with each chunk.

---

## 14. Chunk Creation

The chunker converts structured text into retrieval units.

A chunk SHOULD represent one coherent legal concept.

Example:

```text
Section 12
  |
  +-- 12(1)
  |
  +-- 12(2)
        |
        +-- 12(2)(a)
        +-- 12(2)(b)
```

---

## 15. Chunk Metadata

Every chunk SHOULD include:

```text
chunk_id
document_id
source_id
page
section
subsection
title
jurisdiction
authority
source_version
effective_from
effective_until
```

---

## 16. Embedding

Each chunk is transformed into a vector.

Conceptually:

```text
Legal Chunk
    |
    v
Embedding Model
    |
    v
Vector[dimension]
```

The embedding model version MUST be recorded.

---

## 17. Embedding Validation

Before storage:

```text
vector exists
vector dimension correct
vector contains valid numeric values
embedding model recorded
```

Invalid vectors MUST NOT be inserted.

---

## 18. Pinecone Upsert

Each vector receives a deterministic ID.

Example:

```text
doc_001:chunk_014:embed_v1
```

Metadata travels with the vector.

---

## 19. Index Verification

After ingestion, verify:

* expected vector count
* index availability
* metadata presence
* deterministic IDs
* sample retrieval

A document SHOULD NOT be marked `READY` until verification succeeds.

---

## 20. Audit Query

When an audit begins, the audit engine creates a requirement query.

Example:

```text
Requirement:
Organizations must perform periodic access reviews.
```

The query builder may produce:

```text
access review
periodic access review
user access review
access recertification
privilege review
```

---

## 21. Context Enrichment

The query should be enriched with trusted audit context.

Example:

```json
{
  "jurisdiction": "India",
  "auditDate": "2026-08-01",
  "organizationType": "enterprise"
}
```

Only known context should be added.

Do not invent organization attributes.

---

## 22. Metadata Filtering

Apply filters where appropriate.

Example:

```text
jurisdiction = India
AND effective_from <= auditDate
AND (
  effective_until IS NULL
  OR effective_until >= auditDate
)
```

---

## 23. Initial Retrieval

Retrieve a candidate set larger than the final context.

Example:

```text
Top 20 candidates
```

The exact value MUST be determined through evaluation.

---

## 24. Candidate Normalization

Normalize returned candidates into a common structure.

```typescript
interface RetrievalCandidate {
  chunkId: string;
  documentId: string;
  sourceId: string;
  content: string;
  score: number;
  page?: number;
  section?: string;
  metadata: Record<string, unknown>;
}
```

---

## 25. Candidate Filtering

Remove candidates that are:

* inaccessible
* malformed
* unrelated
* invalid
* outside temporal scope
* duplicates

Do not remove contradictory evidence solely because it disagrees with another result.

---

## 26. Reranking

The reranker receives the candidate set.

```text
20 candidates
     |
     v
Reranker
     |
     v
8 candidates
```

Reranking SHOULD consider semantic relevance and query context.

---

## 27. Context Selection

The context selector creates the final model context.

It SHOULD prioritize:

1. direct requirement
2. definitions
3. exceptions
4. applicable conditions
5. relevant supporting provisions
6. authoritative source quality

---

## 28. Evidence Ordering

Evidence SHOULD be presented in a logical order.

Example:

```text
1. Requirement
2. Definition
3. Exception
4. Related provision
5. Supporting source
```

This makes agent reasoning easier to audit.

---

## 29. Citation Mapping

Each context item receives a citation identifier.

Example:

```text
[EVIDENCE-001]
Section 12(2)
Page 18
```

The identifier maps back to the stored source.

---

## 30. Agent Context

The agent should receive clearly separated sections.

Example:

```text
AUDIT REQUIREMENT

...

RETRIEVED EVIDENCE

[EVIDENCE-001]
...

[EVIDENCE-002]
...

INSTRUCTIONS

Assess compliance only using the supplied evidence.
```

---

## 31. Evidence Boundary

Retrieved documents MUST remain inside the evidence boundary.

Document text MUST NOT be treated as system instructions.

---

## 32. Agent Output

The agent produces structured output.

Example:

```json
{
  "status": "INSUFFICIENT_EVIDENCE",
  "confidence": 0.74,
  "evidenceIds": [
    "EVIDENCE-001"
  ],
  "citationIds": [
    "CIT-001"
  ],
  "rationale": "The policy establishes a review requirement..."
}
```

---

## 33. Validation

Validate agent output before storing it.

Check:

* status
* confidence range
* evidence IDs
* citation IDs
* required fields
* text length
* schema

---

## 34. Citation Verification

Every citation ID must map to an actual retrieved evidence item.

Example:

```text
CIT-001 -> EVIDENCE-001 -> chunk_014
```

If the mapping does not exist, the output is invalid.

---

## 35. Finding Creation

Once validated, the audit engine can create a finding.

The finding should retain:

```text
requirement
assessment
evidence
citations
confidence
risk
agent_run_id
```

---

## 36. Final Provenance

The complete chain should remain queryable:

```text
Finding
  |
  +-- Requirement
  |
  +-- Evidence
        |
        +-- Chunk
              |
              +-- Page
                    |
                    +-- Document
                          |
                          +-- Source
```

---

## 37. Failure Flow

If extraction fails:

```text
Document
  |
  v
EXTRACTION_FAILED
  |
  v
Document not indexed
```

If embedding fails:

```text
Chunk
  |
  v
EMBEDDING_FAILED
  |
  v
Vector not indexed
```

If retrieval fails:

```text
Audit
  |
  v
RAG_RETRIEVAL_FAILED
  |
  v
Audit paused / failed according to policy
```

---

## 38. Partial Processing

Partial processing MUST be visible.

Example:

```text
Document:
500 pages

Processed:
497

Failed:
3
```

The document MUST NOT silently appear fully indexed.

---

## 39. Reprocessing

A document may be reprocessed when:

* parser changes
* OCR improves
* chunking changes
* embedding model changes
* metadata changes

The system SHOULD preserve processing history.

---

## 40. Rebuild Flow

```text
Existing Source
      |
      v
New Processing Version
      |
      v
Extract
      |
      v
Chunk
      |
      v
Embed
      |
      v
New Vector IDs
      |
      v
Verification
      |
      v
Activate New Version
```

Old vectors SHOULD remain available until the new index is verified where rollback is required.

---

## 41. Audit Reproducibility

A completed audit should record:

```text
source versions
document hashes
embedding model
embedding version
retrieval configuration
reranker
prompt versions
model version
agent outputs
```

---

## 42. Security Flow

Every retrieval request follows:

```text
User
 |
Authentication
 |
Authorization
 |
Audit Ownership
 |
Retrieval Scope
 |
Pinecone Query
```

A vector query MUST NOT bypass authorization.

---

## 43. Performance Flow

Track:

```text
query preprocessing
embedding
Pinecone retrieval
reranking
context construction
```

This allows bottlenecks to be identified.

---

## 44. Observability

Each retrieval should have a unique query ID.

Example:

```text
query_01J...
```

Log:

```text
query_id
audit_id
retrieval_count
latency
filters
embedding_version
index_version
```

Avoid logging full confidential evidence.

---

## 45. Data Integrity Rules

Never:

* overwrite source content without versioning
* delete provenance accidentally
* change chunk IDs unpredictably
* mix embedding dimensions
* silently change source versions
* discard contradictions
* fabricate citations

---

## 46. Data Flow Invariants

The following MUST always remain true:

```text
Every chunk -> valid document
Every document -> valid source
Every vector -> valid chunk
Every citation -> valid evidence
Every finding -> valid requirement
Every audit -> authorized organization
```

---

## 47. Final Data Flow Rule

NyaySetu must maintain an unbroken chain from:

```text
Authoritative Source
        ↓
Evidence
        ↓
Retrieval
        ↓
Agent
        ↓
Finding
        ↓
Report
```

Any broken link MUST be visible rather than silently repaired by the model.

### Code vs Architecture Drift Gap Analysis

| Area | Current | Target | Gap | Action |
|------|---------|--------|-----|--------|
| Embedding | `sentence-transformers` local pipeline verified in `embeddings.py` | External Hugging Face APIs | Code uses local processing | Update documentation to reflect local embedding strategy |
| Pinecone | Generic `nyayasetu` namespace verified in `vectorstore.py` | Isolated Legal vs Contract KBs | Code does not isolate tenants | Refactor namespace logic or update docs to reflect single namespace MVP |
