# NyaySetu RAG Knowledge Base Architecture

**Project:** NyaySetu
**Module:** Retrieval-Augmented Generation
**Document:** Knowledge Base Architecture
**File:** `docs/rag/05-knowledge-base-architecture.md`
**Status:** Production Specification
**Primary Stack:** PostgreSQL/Supabase + Pinecone + HuggingFace Embeddings
**Last Updated:** 2026

---

## 1. Purpose

The NyaySetu Knowledge Base is the authoritative evidence layer used by the compliance auditing system.

The knowledge base exists to ensure that regulatory conclusions are based on retrievable, traceable, version-aware legal and policy material rather than unsupported model knowledge.

The knowledge base must support:

* regulatory documents;
* statutes;
* rules;
* regulations;
* notifications;
* circulars;
* official guidance;
* compliance frameworks;
* organizational policies;
* contractual requirements;
* internal evidence;
* amendments;
* superseded documents;
* effective dates;
* source authority;
* page-level provenance;
* section-level provenance;
* semantic retrieval;
* metadata filtering;
* citation generation;
* audit reproducibility.

The knowledge base is not simply a vector database.

It is a **structured legal evidence system** consisting of:

1. source registry;
2. document registry;
3. document versions;
4. pages;
5. legal sections;
6. chunks;
7. embeddings;
8. metadata;
9. retrieval indexes;
10. provenance records;
11. authority information;
12. temporal validity;
13. audit references.

---

# 2. Design Principles

## 2.1 Evidence Before Generation

The system must retrieve evidence before generating a legal/compliance conclusion.

The model must never be treated as the primary source of regulatory truth.

---

## 2.2 Source Traceability

Every retrieved chunk must be traceable to:

```text
Knowledge Source
    ↓
Document
    ↓
Version
    ↓
Page
    ↓
Section
    ↓
Chunk
    ↓
Embedding
    ↓
Retrieved Evidence
    ↓
Audit Finding
```

---

## 2.3 Immutable Source Records

Original regulatory source records should be treated as immutable.

If a regulation changes:

```text
Old Version
    ↓
New Version
```

must be created instead of overwriting the historical record.

---

## 2.4 Temporal Awareness

Legal requirements are time-sensitive.

A regulation may be:

* published;
* effective;
* amended;
* partially repealed;
* replaced;
* suspended;
* superseded.

The knowledge base must therefore support historical reconstruction.

---

## 2.5 Authority Awareness

Not every document has equal legal authority.

For example:

```text
Primary legislation
    >
Official regulation
    >
Official notification
    >
Official circular
    >
Official guidance
    >
Internal policy
    >
Secondary commentary
```

The exact hierarchy depends on jurisdiction and regulatory context.

The system must preserve authority metadata rather than assuming all sources are equivalent.

---

# 3. High-Level Architecture

```text
                    ┌──────────────────────────┐
                    │ Official / Trusted Sources│
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Document Ingestion Layer  │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ PDF / OCR / Text Parsing  │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Legal Structure Detection │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Legal Chunking Pipeline   │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴─────────────┐
                    ▼                          ▼
          ┌──────────────────┐       ┌──────────────────┐
          │ Supabase         │       │ HuggingFace      │
          │ PostgreSQL       │       │ Embedding Model  │
          └────────┬─────────┘       └────────┬─────────┘
                   │                          │
                   │                          ▼
                   │                 ┌──────────────────┐
                   │                 │ Pinecone         │
                   │                 │ Vector Index     │
                   │                 └────────┬─────────┘
                   │                          │
                   └────────────┬─────────────┘
                                ▼
                    ┌──────────────────────────┐
                    │ Retrieval / Reranking     │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Evidence Context          │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Multi-Agent Audit System  │
                    └──────────────────────────┘
```

---

# 4. System Components

## 4.1 Source Registry

Stores information about the organization or authority responsible for a source.

Example:

```text
source_id
source_name
jurisdiction
authority_level
source_type
official_domain
verification_status
created_at
updated_at
```

---

## 4.2 Document Registry

Stores logical documents.

Example:

```text
document_id
source_id
title
document_type
jurisdiction
language
description
canonical_url
created_at
updated_at
```

---

## 4.3 Document Version Registry

Each meaningful version receives a separate version record.

Example:

```text
document_version_id
document_id
version_label
publication_date
effective_from
effective_until
amendment_status
supersedes_version_id
content_hash
retrieval_timestamp
verification_status
```

---

# 5. Document Lifecycle

Every knowledge-base document follows:

```text
DISCOVERED
    ↓
DOWNLOADED
    ↓
HASHED
    ↓
VALIDATED
    ↓
PARSED
    ↓
STRUCTURED
    ↓
CHUNKED
    ↓
EMBEDDED
    ↓
INDEXED
    ↓
VERIFIED
    ↓
AVAILABLE
```

Failure at any stage must prevent unsafe publication.

---

# 6. Document Status

Recommended statuses:

```text
DISCOVERED
PENDING_VALIDATION
VALIDATED
PROCESSING
PROCESSED
EMBEDDING
INDEXING
ACTIVE
SUPERSEDED
ARCHIVED
REJECTED
FAILED
```

---

# 7. Supabase as System of Record

Supabase PostgreSQL should maintain canonical structured records.

It should contain:

* users;
* organizations;
* documents;
* document versions;
* pages;
* sections;
* chunks;
* metadata;
* audit references;
* source authority;
* processing state.

Pinecone should not be treated as the canonical database.

---

# 8. Pinecone as Retrieval Index

Pinecone stores vectors used for semantic retrieval.

A Pinecone vector should contain:

```text
vector_id
embedding
document_id
document_version_id
chunk_id
metadata
```

The vector database is an index over canonical knowledge-base records.

---

# 9. Separation of Concerns

The architecture must preserve:

```text
PostgreSQL
=
Truth + Relationships + Provenance

Pinecone
=
Semantic Retrieval

Object Storage
=
Original Files

Embedding Model
=
Semantic Representation

LLM
=
Reasoning + Synthesis
```

The LLM must not become the source of truth.

---

# 10. Canonical Chunk Identity

Each chunk should have a deterministic identifier.

Example:

```text
chunk:{document_version_id}:{page_number}:{chunk_sequence}
```

A stronger implementation may use a content hash:

```text
chunk:{sha256(document_version_id + normalized_text + location)}
```

This allows duplicate detection and reproducible indexing.

---

# 11. Chunk Metadata

Every chunk should preserve:

```text
chunk_id
document_id
document_version_id
document_title
source_id
source_name
jurisdiction
document_type
publication_date
effective_from
effective_until
page_number
section_number
section_title
paragraph_number
authority_level
language
content_hash
embedding_model
embedding_version
created_at
```

---

# 12. Metadata Filtering

Retrieval should support filtering by:

* jurisdiction;
* regulation;
* document type;
* effective date;
* authority level;
* source;
* language;
* industry;
* organization;
* version;
* active status.

Example conceptual filter:

```json
{
  "jurisdiction": "IN",
  "effective_from": {
    "$lte": "2026-09-01"
  },
  "effective_until": {
    "$gte": "2026-09-01"
  },
  "status": "ACTIVE"
}
```

The actual Pinecone filter syntax must match the deployed SDK.

---

# 13. Multi-Tenant Knowledge

NyaySetu may contain multiple knowledge categories.

Recommended logical separation:

```text
global-regulatory
organization-policy
organization-evidence
industry-framework
internal-guidance
```

Organization-specific data must never leak into another organization's retrieval context.

---

# 14. Namespace Strategy

Possible Pinecone namespaces:

```text
global
org-{organization_id}
```

However, namespaces should not replace application-level authorization.

The application must still verify:

```text
authenticated_user
→ organization_membership
→ permitted_document
→ permitted_chunk
```

---

# 15. Global Regulatory Knowledge

Global regulatory knowledge may include verified public regulatory sources.

Example:

```text
global/
    jurisdiction/
        regulation/
            version/
                chunks
```

This content should be independently validated.

---

# 16. Organization Knowledge

Organization-specific knowledge may include:

* internal policies;
* SOPs;
* compliance manuals;
* control descriptions;
* internal evidence;
* vendor agreements.

This information must be isolated by organization.

---

# 17. Evidence Versus Regulation

The system must distinguish:

### Regulatory evidence

"What does the law require?"

from:

### Organization evidence

"What does the organization currently do?"

Example:

```text
Regulation:
"Organizations must retain records for X period."

Company Policy:
"Company retains records for Y period."

System Finding:
Potential compliance gap.
```

The two sources must never be merged into a single undifferentiated context.

---

# 18. Knowledge Graph Compatibility

Although the MVP primarily uses relational metadata plus vectors, the architecture should remain compatible with future graph relationships.

Potential relationships:

```text
REGULATION
    ├── CONTAINS → SECTION
    ├── AMENDS → REGULATION
    ├── REPLACES → REGULATION
    ├── APPLIES_TO → INDUSTRY
    ├── REQUIRES → OBLIGATION
    └── REFERENCES → OTHER_REGULATION
```

---

# 19. Obligation Mapping

A future structured obligation layer can represent:

```text
obligation_id
regulation_section_id
actor
action
object
condition
frequency
deadline
retention_period
exception
penalty
evidence_required
```

Example:

```text
Actor:
Organization

Action:
Maintain records

Condition:
For covered transactions

Frequency:
Continuous

Evidence:
Record retention policy
```

This can substantially improve audit reasoning.

---

# 20. Version Control

Version records must support:

```text
version A
    ↓ amendment
version B
    ↓ amendment
version C
```

Historical audits should retain the version used at the time of analysis.

---

# 21. Reproducibility

Every audit should be reproducible from:

```text
audit_id
knowledge_base_version
document_versions
retrieval_configuration
embedding_model
embedding_version
agent_configuration
prompt_version
model_version
```

This is essential for legal/compliance audit integrity.

---

# 22. Knowledge Base Snapshot

For high-integrity audits, create a logical snapshot:

```text
snapshot_id
created_at
regulatory_cutoff_date
document_versions[]
embedding_version
retrieval_configuration
```

The audit references the snapshot.

This prevents future regulatory updates from silently changing historical audit conclusions.

---

# 23. Knowledge Base Quality Gates

Before activation:

* document source verified;
* document integrity verified;
* text extraction validated;
* pages identified;
* legal sections identified;
* metadata validated;
* chunks generated;
* embeddings generated;
* vectors indexed;
* citations tested;
* duplicate detection completed;
* effective dates validated.

---

# 24. Duplicate Detection

Potential duplicates should be detected using:

* source URL;
* document hash;
* normalized title;
* publication metadata;
* content similarity.

Exact duplicate:

```text
SHA-256(content_A) == SHA-256(content_B)
```

should not produce unnecessary duplicate vectors.

---

# 25. Corruption Detection

The ingestion pipeline should detect:

* zero-byte files;
* invalid PDFs;
* truncated downloads;
* malformed documents;
* missing pages;
* unreadable text;
* inconsistent page counts;
* OCR failures.

A corrupted source must not become active knowledge.

---

# 26. Retrieval Architecture

Retrieval should conceptually follow:

```text
User/Audit Requirement
        ↓
Requirement Normalization
        ↓
Query Generation
        ↓
Metadata Filtering
        ↓
Vector Retrieval
        ↓
Optional Keyword Retrieval
        ↓
Candidate Merge
        ↓
Reranking
        ↓
Evidence Deduplication
        ↓
Context Selection
        ↓
Citation Packaging
```

---

# 27. Context Object

The retrieval layer should return structured evidence.

Example:

```json
{
  "chunkId": "chunk-123",
  "documentId": "doc-10",
  "versionId": "version-3",
  "text": "...",
  "page": 17,
  "section": "4.2",
  "authority": "official",
  "effectiveFrom": "2026-01-01",
  "score": 0.91
}
```

The model should receive this structured representation.

---

# 28. Evidence Confidence

Retrieval score is not legal confidence.

Do not interpret:

```text
similarity = 0.91
```

as:

```text
legal certainty = 91%
```

Similarity is a retrieval signal only.

---

# 29. Legal Confidence

Legal/compliance confidence should combine factors such as:

```text
source authority
+
retrieval relevance
+
source freshness
+
cross-source agreement
+
agent agreement
+
citation completeness
```

The exact scoring model should be defined in the audit layer.

---

# 30. Failure Handling

If no sufficiently relevant evidence is found:

```text
DO NOT:
Generate unsupported legal requirement.

DO:
Return insufficient evidence.
```

The system should allow:

```text
NEEDS_MORE_EVIDENCE
```

as a valid result.

---

# 31. Knowledge Base Security

The knowledge base must defend against:

* malicious documents;
* prompt injection;
* poisoned content;
* unauthorized uploads;
* cross-tenant retrieval;
* metadata tampering;
* vector poisoning;
* source spoofing.

Documents are data.

They are never instructions to the model.

---

# 32. Auditability

Every knowledge-base mutation should produce an event:

```text
DOCUMENT_CREATED
DOCUMENT_UPDATED
DOCUMENT_VERSION_ADDED
DOCUMENT_PROCESSED
EMBEDDING_CREATED
VECTOR_UPSERTED
VECTOR_DELETED
DOCUMENT_SUPERSEDED
DOCUMENT_ARCHIVED
```

---

# 33. Observability

Track:

```text
documents_processed
documents_failed
chunks_created
embeddings_created
vectors_upserted
retrieval_queries
retrieval_latency
reranking_latency
citation_failures
stale_sources
duplicate_sources
```

---

# 34. Performance Principles

Optimize:

1. metadata filtering;
2. embedding batching;
3. vector upserts;
4. retrieval latency;
5. reranking;
6. context size;
7. duplicate elimination;
8. caching.

Never optimize performance by removing provenance.

---

# 35. Cost Controls

Cost-sensitive operations include:

* embedding generation;
* OCR;
* LLM reasoning;
* reranking;
* document processing.

Use:

* batch embedding;
* content hashing;
* cached embeddings;
* incremental indexing;
* duplicate detection.

---

# 36. Recommended Data Ownership

```text
Original Document
    → Object Storage

Document Metadata
    → PostgreSQL

Extracted Pages
    → PostgreSQL/Object Storage

Legal Sections
    → PostgreSQL

Chunks
    → PostgreSQL

Embeddings
    → Pinecone

Retrieval Metadata
    → Pinecone + PostgreSQL

Audit References
    → PostgreSQL
```

---

# 37. Golden Rule

The Knowledge Base must always answer:

> "Where did this requirement come from?"

If the system cannot answer that question, the evidence pipeline is incomplete.

---

# 38. Production Checklist

* [ ] Canonical source registry exists.
* [ ] Document versions are immutable.
* [ ] Effective dates are stored.
* [ ] Source authority is stored.
* [ ] Page provenance exists.
* [ ] Section provenance exists.
* [ ] Chunk IDs are deterministic.
* [ ] Embedding model is versioned.
* [ ] Pinecone is treated as retrieval index.
* [ ] PostgreSQL remains system of record.
* [ ] Organization isolation is enforced.
* [ ] Duplicate detection exists.
* [ ] Corruption detection exists.
* [ ] Citation metadata is preserved.
* [ ] Historical versions remain available.
* [ ] Audit snapshots are supported.
* [ ] Retrieval failures are explicit.
* [ ] Prompt injection boundaries exist.
* [ ] Knowledge-base changes are logged.
* [ ] Reproducibility metadata is stored.

---

# 39. Final Architecture Principle

NyaySetu's knowledge base must not behave like a generic chatbot database.

It must behave like a **versioned legal evidence repository with semantic retrieval**.

The architectural contract is:

```text
SOURCE
  ↓
VERIFIED DOCUMENT
  ↓
VERSION
  ↓
PAGE
  ↓
LEGAL SECTION
  ↓
CHUNK
  ↓
EMBEDDING
  ↓
RETRIEVAL
  ↓
EVIDENCE
  ↓
CITATION
  ↓
AUDIT CONCLUSION
```

Every step must remain traceable.

### Code vs Architecture Drift Gap Analysis

| Area | Current | Target | Gap | Action |
|------|---------|--------|-----|--------|
| Embedding | `sentence-transformers` local pipeline verified in `embeddings.py` | External Hugging Face APIs | Code uses local processing | Update documentation to reflect local embedding strategy |
| Pinecone | Generic `nyayasetu` namespace verified in `vectorstore.py` | Isolated Legal vs Contract KBs | Code does not isolate tenants | Refactor namespace logic or update docs to reflect single namespace MVP |
