# Vector Deletion Specification

**Project:** NyaySetu
**Document:** Safe Vector Deletion and Cleanup
**Path:** `docs/rag/22-vector-deletion.md`
**Status:** Production Specification
**Version:** 1.0

---

# 1. Purpose

This document defines safe deletion of vectors from Pinecone.

Deletion is a high-risk operation because it can:

* remove evidence from retrieval;
* break citations;
* create incomplete audits;
* violate retention policies;
* accidentally delete another organization's data;
* create inconsistencies between Supabase and Pinecone.

Therefore deletion must be:

* authorized;
* explicit;
* auditable;
* idempotent;
* scoped;
* recoverable where possible;
* protected against accidental bulk operations.

---

# 2. Core Principle

Pinecone is a derived index.

Therefore:

```text
canonical lifecycle
      |
      v
Pinecone lifecycle
```

Deletion from Pinecone must normally follow a canonical database decision.

---

# 3. Deletion Types

NyaySetu supports several conceptual deletion operations:

```text
vector deletion
chunk deletion
document-version deletion
document deletion
organization deletion
namespace cleanup
orphan cleanup
index rebuild cleanup
```

Each requires different authorization and safety checks.

---

# 4. Vector-Level Deletion

Used when one logical chunk should no longer be searchable.

Example:

```text
chunk_123
```

Delete only that vector.

---

# 5. Chunk Deletion

When a chunk is removed from the canonical database:

```text
canonical chunk deleted
      |
      v
corresponding vector deleted
```

The vector must not remain indefinitely.

---

# 6. Document-Version Deletion

If a specific document version is removed:

```text
document_version_id
```

all vectors belonging to that version must be identified and deleted.

---

# 7. Document Deletion

A document may contain multiple versions.

Deleting the logical document may therefore require:

```text
version 1 vectors
version 2 vectors
version 3 vectors
...
```

to be handled according to retention policy.

---

# 8. Organization Deletion

Organization deletion is a high-risk bulk operation.

It may affect:

```text
documents
versions
chunks
vectors
audit records
reports
```

Pinecone deletion must be explicitly scoped to the organization.

---

# 9. Hard Delete vs Soft Delete

Two concepts must be distinguished.

## Soft delete

Canonical record remains but becomes unavailable for retrieval.

## Hard delete

The vector is physically removed from Pinecone.

---

# 10. Preferred Pattern

For normal operational changes:

```text
soft-delete canonical state
      |
      v
remove from active retrieval
      |
      v
hard-delete vector according to lifecycle policy
```

---

# 11. Why Soft Delete Matters

Immediate physical deletion can complicate:

* recovery;
* audit history;
* debugging;
* reconciliation;
* accidental deletion recovery.

Soft deletion provides an intermediate state.

---

# 12. Active Flag

A vector can be marked inactive at the canonical level.

However, an inactive vector should eventually be removed from Pinecone if the retention policy permits.

---

# 13. Deletion Authorization

Deletion must be performed by trusted backend services.

Never allow:

```text
client -> arbitrary Pinecone delete
```

---

# 14. Organization Authorization

For organization content:

```text
authenticated actor
      |
      v
organization membership
      |
      v
resource ownership
      |
      v
deletion permission
```

All checks must succeed.

---

# 15. Never Trust Client IDs Alone

A request containing:

```json
{
  "documentId": "doc_123"
}
```

does not prove the user owns the document.

The server must load the canonical record and verify authorization.

---

# 16. Delete by Vector ID

Preferred for known exact vectors.

Example concept:

```typescript
await vectorStore.delete({
  namespace,
  ids: [chunkId]
});
```

This is safer than broad filters when exact IDs are known.

---

# 17. Delete by Metadata Filter

Metadata-filter deletion may be useful for:

```text
document version
organization
namespace cleanup
```

but it is inherently more dangerous.

Use only when the filter is deterministic and fully validated.

---

# 18. Filter Safety

Never execute arbitrary client-provided metadata filters.

Bad:

```typescript
delete(request.body.filter);
```

Good:

```typescript
const filter = buildDocumentDeletionFilter(
  canonicalDocument
);
```

---

# 19. Dangerous Delete Protection

Bulk deletion should require:

* explicit operation type;
* validated scope;
* authorization;
* audit log;
* optional confirmation token;
* environment verification.

---

# 20. Production Protection

Development code must never accidentally target production.

Deletion services must resolve:

```text
environment
index
namespace
```

from trusted configuration.

---

# 21. Deletion Workflow

Recommended:

```text
Deletion Request
      |
      v
Authorization
      |
      v
Canonical Resource Lookup
      |
      v
Retention / Legal Hold Check
      |
      v
Create Deletion Job
      |
      v
Resolve Vector IDs
      |
      v
Delete Pinecone Vectors
      |
      v
Verify
      |
      v
Update Deletion State
      |
      v
Audit Log
```

---

# 22. Canonical-First

For most deletion workflows:

```text
canonical state changes first
```

Then the derived index is synchronized.

This prevents Pinecone from being treated as authoritative.

---

# 23. Exception

If immediate removal is required for a security or privacy incident, Pinecone deletion may happen before broader canonical cleanup.

Such cases require an explicit incident workflow.

---

# 24. Tombstones

A tombstone can record that a vector was intentionally deleted.

Example:

```typescript
interface VectorDeletionTombstone {
  vectorId: string;
  documentId: string;
  documentVersionId: string;
  deletedAt: string;
  reason: string;
}
```

Tombstones should live in the canonical system, not depend on Pinecone remaining intact.

---

# 25. Why Tombstones Matter

They help distinguish:

```text
intentionally deleted
```

from:

```text
unexpectedly missing
```

during reconciliation.

---

# 26. Deletion Job

Recommended states:

```text
PENDING
AUTHORIZED
RESOLVING
DELETING
VERIFYING
COMPLETED
FAILED
RETRYING
```

---

# 27. Idempotency

Deletion must be idempotent.

If the vector is already gone:

```text
delete(vector)
```

should not create an inconsistent application state.

The final desired state is:

```text
vector absent
```

---

# 28. Retryable Deletion Errors

Examples:

```text
network timeout
temporary Pinecone outage
rate limit
service unavailable
```

---

# 29. Non-Retryable Errors

Examples:

```text
invalid namespace
unauthorized operation
invalid resource
malformed deletion request
environment mismatch
```

---

# 30. Retry Policy

Use bounded exponential backoff.

Never use:

```text
while(true) retry
```

---

# 31. Partial Delete Failure

Suppose:

```text
100 vectors
```

are targeted.

If:

```text
93 deleted
7 failed
```

the job must remain incomplete.

Do not mark:

```text
COMPLETED
```

until the remaining seven are resolved.

---

# 32. Per-Vector Status

Track:

```text
vector_id
status
attempts
last_error
deleted_at
```

This allows recovery without repeating successful operations unnecessarily.

---

# 33. Document-Level Completion

A document deletion job is complete only when all required vectors have reached the desired state.

---

# 34. Verification

After deletion, verify through appropriate mechanisms.

For exact vectors, a fetch/check may be possible.

For large deletes, periodic reconciliation may be more appropriate.

---

# 35. Deletion Verification Goal

The goal is:

```text
expected vector absent
```

not merely:

```text
delete API returned success
```

---

# 36. Orphan Vectors

An orphan vector is a Pinecone vector with no canonical source.

Example:

```text
Pinecone:
  chunk_123

Supabase:
  no chunk_123
```

This is an orphan.

---

# 37. Orphan Cleanup

Orphans should be identified by reconciliation.

Do not immediately delete every unexplained vector in production.

First classify:

```text
active
migration
temporarily missing
orphan
```

---

# 38. Reconciliation Workflow

```text
scan Pinecone
      |
      v
collect vector IDs
      |
      v
compare canonical IDs
      |
      v
classify mismatch
      |
      +--> missing canonical
      |
      +--> stale
      |
      +--> migration
      |
      +--> valid
```

---

# 39. Stale Vectors

A stale vector may still have a canonical chunk but represent an outdated state.

Example:

```text
canonical embedding version = v2
Pinecone vector = v1
```

The vector should be reindexed or removed according to migration policy.

---

# 40. Historical Versions

Historical legal versions require special treatment.

Do not delete historical vectors merely because they are not currently active.

They may be necessary for:

* historical audits;
* regulatory timeline analysis;
* evidence reconstruction.

---

# 41. Effective-Date vs Deletion

A regulation becoming inactive does not necessarily mean it should be deleted.

Instead:

```text
active = false
```

or:

```text
effective_to = date
```

may preserve historical retrieval.

---

# 42. Legal Hold

A legal hold must override ordinary deletion schedules where applicable.

Example:

```text
legal_hold = true
```

The vector must not be physically deleted until the hold is released.

---

# 43. Retention Policy

Deletion must respect configured retention periods.

Example:

```text
retention_until
```

The deletion worker must check retention before hard deletion.

---

# 44. Privacy Deletion

If a user or organization requests deletion under an applicable policy, the system should identify all derived copies.

This may include:

```text
Supabase
Pinecone
object storage
caches
search indexes
logs
```

Only systems actually containing the data need to be acted upon.

---

# 45. Pinecone as Derived Data

Because Pinecone is derived:

```text
delete canonical
+
delete derived vector
```

are separate lifecycle steps.

Both must be observable.

---

# 46. Cache Invalidation

If retrieved chunks are cached elsewhere:

```text
delete vector
```

must not be assumed to invalidate:

```text
retrieval cache
```

Relevant caches must also be invalidated.

---

# 47. Citation Cache

If citation metadata is cached, deletion must invalidate cached citation references where appropriate.

---

# 48. Audit Reports

Deleting a source vector should not automatically delete historical audit reports.

Audit records may contain references to the source used at analysis time.

Their retention is governed separately.

---

# 49. Historical Audit Integrity

A completed audit should preserve enough provenance to explain:

```text
which document version
which chunk
which evidence
which retrieval state
```

was used.

---

# 50. Vector Deletion and Audit Integrity

Deletion from Pinecone does not mean the historical audit becomes invalid.

It means:

```text
future retrieval
```

may no longer return the source.

---

# 51. Deletion Reason

Every deletion should have a reason.

Examples:

```text
source_removed
document_updated
privacy_request
duplicate_vector
stale_embedding
orphan_cleanup
organization_deletion
security_incident
```

---

# 52. Audit Log

Record:

```text
deletion_job_id
actor
organization
resource
scope
reason
timestamp
environment
namespace
result
```

---

# 53. Actor Identity

The audit log should identify the authenticated actor or system job responsible.

Automated jobs should have a service identity.

---

# 54. No Secret Logging

Do not log:

```text
API keys
authorization headers
tokens
credentials
```

---

# 55. Bulk Deletion

Bulk operations should expose a preview.

Example:

```text
Target:
organization org_123

Estimated vectors:
4,281

Namespaces:
org_org_123

Reason:
organization deletion
```

The operation should require explicit confirmation through a trusted workflow.

---

# 56. Delete Preview

Before a dangerous operation:

```text
resolve target
count vectors
show scope
validate authorization
```

Do not immediately delete.

---

# 57. Maximum Scope

Configure safeguards such as:

```text
maximum_vectors_per_operation
```

If exceeded:

```text
require elevated workflow
```

---

# 58. Namespace Deletion

Deleting an entire namespace is extremely destructive.

Use only when:

* namespace is dedicated to the target scope;
* no unrelated vectors exist;
* migration/deletion policy explicitly permits it.

---

# 59. Namespace Verification

Before namespace deletion verify:

```text
namespace ownership
environment
organization
vector count
migration state
retention constraints
```

---

# 60. Namespace Reuse

Deleted organization namespaces should not immediately be reused without considering stale jobs.

Otherwise an old job could write vectors into a newly created organization namespace.

---

# 61. Namespace Generation

Prefer immutable organization identifiers:

```text
org_<immutableId>
```

rather than human-editable organization names.

---

# 62. Race Conditions

Deletion can race with indexing.

Example:

```text
delete document
     |
     +------> indexing worker still running
```

Without coordination, the worker may recreate the vector.

---

# 63. Deletion Fence

Use a deletion state or version check.

Example:

```text
document_version.deleted_at != null
```

Indexing workers must check this before upserting.

---

# 64. Job Cancellation

When a document enters deletion:

```text
cancel pending indexing jobs
```

where supported.

Running jobs must re-check canonical state before writing.

---

# 65. Version Check

An indexing job should verify:

```text
job_version == canonical_version
```

before upsert.

If not:

```text
abort
```

---

# 66. Delete-Then-Index Race

If deletion happens after an indexing worker reads the chunk but before it writes to Pinecone:

```text
worker reads
deletion happens
worker writes
```

The worker must perform a final canonical-state check immediately before upsert.

---

# 67. Safe Ordering

Preferred:

```text
mark canonical deletion
   ->
cancel jobs
   ->
delete vectors
   ->
verify
```

---

# 68. Recovery

If a deletion job fails:

```text
RETRYING
```

If retries are exhausted:

```text
FAILED
```

The system must not pretend deletion succeeded.

---

# 69. Manual Recovery

Operators should have a runbook for:

```text
failed deletion
partial deletion
orphan vectors
wrong namespace deletion
stale vector recreation
```

---

# 70. Wrong Deletion Incident

If vectors from the wrong scope are deleted:

1. stop related workers;
2. identify exact deletion scope;
3. inspect audit logs;
4. identify affected documents;
5. rebuild from canonical storage;
6. validate retrieval;
7. document incident.

---

# 71. Rebuild After Accidental Deletion

Because Supabase is canonical:

```text
canonical chunks
   ->
re-embed if necessary
   ->
re-upsert
```

can reconstruct the vector index.

This is one of the main reasons Pinecone must remain derived.

---

# 72. Backup

Vector backups are optional if deterministic re-indexing from canonical data is reliable.

However, production recovery procedures must explicitly define:

```text
rebuild time
embedding availability
provider availability
index recreation
```

---

# 73. Disaster Recovery

If Pinecone data is lost:

```text
recreate index
   ->
load canonical chunks
   ->
generate embeddings
   ->
upsert
   ->
reconcile
   ->
switch retrieval
```

---

# 74. Deletion and Disaster Recovery

Deletion tombstones and canonical states must survive Pinecone loss.

Otherwise a rebuild could recreate intentionally deleted vectors.

---

# 75. Tombstone Requirement

If a vector has been intentionally deleted but its canonical source still exists for historical reasons, the system must retain enough state to prevent unauthorized reindexing.

---

# 76. Reindex Eligibility

Before rebuild:

```text
if source is deleted:
    skip

if source is under legal hold:
    preserve according to policy

if source is inactive but historically retained:
    index according to version policy
```

---

# 77. Soft-Deleted Chunks

Soft-deleted chunks should normally be excluded from active retrieval.

They may remain in canonical storage for audit or recovery according to policy.

---

# 78. Hard-Deleted Chunks

Hard-deleted canonical chunks must not be re-created by normal indexing jobs.

---

# 79. Deletion and RAG

The RAG layer must treat missing vectors as normal lifecycle outcomes.

A missing vector is not necessarily a system error.

It becomes an error when:

```text
expected active source
AND
vector unexpectedly missing
```

---

# 80. Retrieval Consistency

Reconciliation should identify:

```text
canonical active chunk
+
missing Pinecone vector
```

as an indexing inconsistency.

---

# 81. Deletion Metrics

Track:

```text
deletion_jobs
vectors_requested
vectors_deleted
vectors_remaining
retry_count
deletion_latency
orphan_vectors
reconciliation_failures
```

---

# 82. Alerts

Alert on:

* repeated deletion failures;
* large unexplained orphan counts;
* deletion/reindex race conditions;
* unexpected production bulk deletion;
* namespace deletion;
* failed privacy deletion workflows.

---

# 83. Testing

Unit tests:

```text
scope resolution
authorization
deletion filter generation
idempotency
retention checks
legal-hold checks
```

Integration tests:

```text
Pinecone deletion
verification
database state synchronization
```

---

# 84. Authorization Test

Attempt:

```text
organization A
deletes organization B vector
```

Expected:

```text
DENIED
```

---

# 85. Filter Injection Test

Provide arbitrary metadata filter from client.

Expected:

```text
REJECTED
```

---

# 86. Idempotency Test

Delete the same vector twice.

Expected:

```text
desired state = absent
```

without corrupting application state.

---

# 87. Race Test

Simulate:

```text
indexing job
+
deletion
```

Expected:

```text
deleted resource remains absent
```

---

# 88. Retention Test

Attempt deletion before retention expiry.

Expected:

```text
BLOCKED
```

---

# 89. Legal Hold Test

Attempt deletion under legal hold.

Expected:

```text
BLOCKED
```

---

# 90. Orphan Cleanup Test

Create:

```text
Pinecone vector
without canonical chunk
```

Run reconciliation.

Expected:

```text
ORPHAN_DETECTED
```

followed by approved cleanup.

---

# 91. Bulk Delete Test

Attempt deletion above configured threshold.

Expected:

```text
ELEVATED_CONFIRMATION_REQUIRED
```

---

# 92. Namespace Test

Attempt deleting another organization's namespace.

Expected:

```text
DENIED
```

---

# 93. Rebuild Test

Delete vectors intentionally.

Run rebuild.

Expected:

```text
only eligible canonical sources return
```

Deleted resources must not silently reappear.

---

# 94. Operational Runbook

For a failed deletion:

```text
1. Inspect deletion job.
2. Confirm scope.
3. Confirm authorization.
4. Check Pinecone status.
5. Retry transient failures.
6. Reconcile remaining vectors.
7. Verify final state.
8. Close job.
```

---

# 95. Privacy Deletion Runbook

```text
1. Verify request.
2. Identify canonical resources.
3. Check legal/retention constraints.
4. Identify derived vectors.
5. Stop conflicting indexing jobs.
6. Delete vectors.
7. Invalidate relevant caches.
8. Verify deletion.
9. Record audit trail.
```

---

# 96. Reconciliation Runbook

```text
1. Scan canonical active chunks.
2. Scan Pinecone IDs.
3. Compare sets.
4. Identify missing vectors.
5. Identify orphan vectors.
6. Identify stale vectors.
7. Queue approved repairs.
8. Verify repaired state.
```

---

# 97. Acceptance Checklist

* [ ] Deletion is backend-controlled.
* [ ] Authorization is enforced.
* [ ] Organization scope is validated.
* [ ] Client filters are never trusted.
* [ ] Exact vector IDs are preferred.
* [ ] Bulk deletion is protected.
* [ ] Production environment is protected.
* [ ] Retention policies are respected.
* [ ] Legal holds are respected.
* [ ] Historical versions are handled separately.
* [ ] Deletion is idempotent.
* [ ] Retries are bounded.
* [ ] Partial deletion is tracked.
* [ ] Deletion jobs are observable.
* [ ] Tombstones exist where required.
* [ ] Indexing/deletion races are prevented.
* [ ] Orphan vectors are detectable.
* [ ] Rebuilds cannot resurrect deleted sources.
* [ ] Privacy deletion covers derived vectors.
* [ ] Audit logs record deletion actions.
* [ ] Recovery from accidental deletion is possible from canonical data.
* [ ] Automated tests cover destructive workflows.

---

# 98. Final Principle

> **Delete derived vectors safely, but preserve the canonical truth required to understand what was deleted and why.**

The safest architecture is:

```text
Canonical state
      |
      +--> indexing
      |
      +--> retrieval
      |
      +--> deletion
      |
      +--> reconciliation
```

Pinecone can always be rebuilt.

The system must therefore protect the canonical source, provenance, authorization boundaries, and deletion history above everything else.

### Code vs Architecture Drift Gap Analysis

| Area | Current | Target | Gap | Action |
|------|---------|--------|-----|--------|
| Embedding | `sentence-transformers` local pipeline verified in `embeddings.py` | External Hugging Face APIs | Code uses local processing | Update documentation to reflect local embedding strategy |
| Pinecone | Generic `nyayasetu` namespace verified in `vectorstore.py` | Isolated Legal vs Contract KBs | Code does not isolate tenants | Refactor namespace logic or update docs to reflect single namespace MVP |
