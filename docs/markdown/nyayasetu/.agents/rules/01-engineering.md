---
trigger: always_on
---

# NyaySetu — Engineering Rules

**File:** `.agents/rules/01-engineering.md`
**Project:** NyaySetu
**Purpose:** Engineering standards, implementation discipline, architecture hygiene, and development workflow
**Status:** Authoritative
**Version:** 1.0.0

---

# 1. Engineering Mission

NyaySetu must be engineered as a production-oriented compliance platform, not as a disposable prototype.

The engineering system must prioritize:

1. correctness;
2. security;
3. traceability;
4. maintainability;
5. testability;
6. performance;
7. usability;
8. visual quality.

The platform may be demonstrated as a hackathon project, but the implementation should maintain a production-grade architectural direction.

---

# 2. Engineering Hierarchy

When engineering priorities conflict, use:

```text
Security
    ↓
Data integrity
    ↓
Legal evidence integrity
    ↓
Correctness
    ↓
Reliability
    ↓
Performance
    ↓
Maintainability
    ↓
UX
    ↓
Visual polish
```

Visual polish must never override security.

Performance must never justify incorrect legal reasoning.

Convenience must never justify bypassing authorization.

---

# 3. Repository Awareness

Before changing code, inspect the repository.

Determine:

* framework;
* language;
* package manager;
* database;
* authentication;
* existing API routes;
* existing server actions;
* existing components;
* current RAG implementation;
* current model provider;
* current embedding provider;
* environment configuration;
* testing setup;
* deployment configuration.

Never assume the repository matches documentation.

---

# 4. Documentation vs Code

The actual repository is the implementation source of truth.

Documentation describes intended architecture.

If documentation and implementation disagree:

1. identify the discrepancy;
2. determine which is intended;
3. avoid silently choosing;
4. update the appropriate artifact.

Do not pretend the repository already implements undocumented architecture.

---

# 5. Change Classification

Every change should be classified conceptually as:

```text
BUG_FIX
FEATURE
REFACTOR
SECURITY
PERFORMANCE
DOCUMENTATION
INFRASTRUCTURE
DATABASE
RAG
AI
UI
```

This helps determine required validation.

---

# 6. Minimal Change Principle

Prefer the smallest safe change that satisfies the requirement.

Do not rewrite entire files when changing one function.

Do not replace working components unnecessarily.

Do not change unrelated APIs.

---

# 7. Refactoring Rule

Refactor only when there is a clear benefit.

Good reasons:

* duplicated logic;
* security weakness;
* unmaintainable abstraction;
* performance bottleneck;
* incorrect architecture;
* difficult testing.

Bad reason:

> I prefer a different coding style.

---

# 8. No Unnecessary Rewrites

A rewrite must have explicit justification.

Before rewriting a subsystem, determine:

* what currently works;
* what is broken;
* what must be preserved;
* what dependencies exist;
* migration risk;
* rollback strategy.

---

# 9. Dependency Rule

Before installing a dependency:

1. verify that the functionality is actually needed;
2. check whether existing dependencies already provide it;
3. evaluate package quality;
4. evaluate compatibility;
5. evaluate security;
6. evaluate bundle/runtime impact.

---

# 10. Package Locking

Use the repository's existing package manager.

Do not introduce a second package manager.

Lock dependency versions appropriately.

---

# 11. Version Awareness

Record important framework versions.

Examples:

```text
Next.js
React
TypeScript
Prisma
Supabase client
Pinecone SDK
embedding model
LLM SDK
```

Avoid mixing incompatible major versions.

---

# 12. TypeScript Standards

Use strict TypeScript where possible.

Avoid unnecessary:

```typescript
any
```

Prefer:

```typescript
unknown
```

followed by validation.

---

# 13. Runtime Validation

TypeScript types disappear at runtime.

External data must still be validated.

Validate:

* API requests;
* database responses when crossing boundaries;
* uploaded metadata;
* AI output;
* webhook payloads;
* query parameters.

---

# 14. Schema-First Design

Critical data contracts should have explicit schemas.

Examples:

```text
CreateAuditInput
CreateFindingInput
AgentAssessment
RetrievedEvidence
Citation
Report
```

---

# 15. Validation Location

Validate as close as possible to the trust boundary.

For example:

```text
browser
 ↓
API validation
 ↓
authorization
 ↓
business logic
 ↓
database
```

---

# 16. Authorization Before Mutation

For sensitive operations:

```text
authenticate
 ↓
authorize
 ↓
validate
 ↓
execute
```

Authorization must not happen after the mutation.

---

# 17. Resource Ownership

For any resource ID received from a client:

```text
resourceId
```

the server must verify that the authenticated user is allowed to access that resource.

---

# 18. Organization Context

Do not accept an organization ID as authoritative from the client.

Determine organization membership server-side.

---

# 19. Role Context

Do not trust:

```text
role=admin
```

from a client request.

Derive role from trusted membership data.

---

# 20. Database Boundary

Database access should happen through controlled server-side paths.

Do not expose privileged database credentials to browsers.

---

# 21. Service Role Protection

Supabase service-role credentials are privileged.

They must:

* exist only server-side;
* never be bundled into client JavaScript;
* never be returned through API responses;
* never appear in logs.

---

# 22. RLS

RLS should remain enabled for tenant-sensitive tables.

If an implementation requires bypassing RLS, document why and ensure the bypass is server-controlled.

---

# 23. Query Safety

Use parameterized queries or ORM query mechanisms.

Never construct SQL using untrusted string concatenation.

---

# 24. Transaction Rule

Use transactions when multiple changes must succeed or fail together.

Example:

```text
create audit
create audit requirements
create audit log
```

may require transactional behavior.

---

# 25. Transaction Scope

Do not keep database transactions open while waiting for slow external services.

Bad:

```text
BEGIN
call LLM
wait 30 seconds
write database
COMMIT
```

Prefer:

```text
prepare state
COMMIT
call LLM
write result
COMMIT
```

where consistency allows.

---

# 26. External Service Isolation

External services include:

* Pinecone;
* model providers;
* HuggingFace;
* storage providers;
* email providers;
* monitoring systems.

Isolate provider calls behind service modules.

---

# 27. Provider Abstraction

Avoid scattering provider-specific SDK calls across the application.

Prefer:

```text
services/
  ai/
  embeddings/
  retrieval/
```

or equivalent project architecture.

---

# 28. Error Translation

Provider-specific errors should be translated into application-level errors.

For example:

```text
PineconeTimeoutError
```

may become:

```text
RETRIEVAL_TIMEOUT
```

while preserving internal diagnostic information.

---

# 29. Error Codes

Critical APIs should use predictable error categories.

Example:

```text
AUTH_REQUIRED
FORBIDDEN
VALIDATION_FAILED
NOT_FOUND
RATE_LIMITED
UPSTREAM_TIMEOUT
MODEL_FAILURE
RETRIEVAL_FAILURE
INTERNAL_ERROR
```

---

# 30. User Error Messages

User-facing messages should be understandable.

Avoid exposing:

```text
PrismaClientKnownRequestError: ...
```

directly to users.

---

# 31. Developer Error Information

Internal logs may contain more diagnostic detail, but must still avoid secrets and unnecessary sensitive content.

---

# 32. Error Boundaries

Frontend applications should have error boundaries around major application surfaces.

A single component failure should not necessarily crash the entire dashboard.

---

# 33. Loading State Standards

Every asynchronous UI operation should have an intentional state.

Possible states:

```text
idle
loading
success
error
empty
```

Long-running operations may additionally use:

```text
processing
queued
retrying
cancelled
```

---

# 34. No Infinite Loading

Any asynchronous operation that can fail must have a timeout or failure path.

A spinner that never ends is a defect.

---

# 35. Skeletons

Use skeleton loading where layout preservation matters.

Do not show skeletons for every tiny interaction.

---

# 36. Optimistic Updates

Use optimistic updates only when rollback is safe.

Do not optimistically mark:

* compliance findings as verified;
* reports as approved;
* audit as completed.

unless backend confirmation is immediate and reliable.

---

# 37. API Design

APIs should be:

* predictable;
* versionable;
* typed;
* authenticated;
* authorized;
* validated.

---

# 38. HTTP Semantics

Use appropriate HTTP statuses.

Examples:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

---

# 39. Response Shape

Prefer consistent response structures.

Do not randomly return:

```json
{"data": ...}
```

from one endpoint and:

```json
{"result": ...}
```

from another without reason.

---

# 40. Pagination

For large collections, use pagination.

Return enough metadata for clients to navigate results.

---

# 41. Cursor Pagination

Cursor pagination may be preferred for large changing datasets.

---

# 42. Search APIs

Search endpoints must validate:

* query length;
* filter values;
* pagination;
* sort fields.

Never allow arbitrary database columns to become SQL expressions.

---

# 43. File APIs

File endpoints must enforce:

* authentication;
* authorization;
* file-size limits;
* file-type validation;
* secure storage;
* safe processing.

---

# 44. Upload Workflow

Recommended conceptual flow:

```text
request upload
 ↓
authorize
 ↓
issue controlled upload permission
 ↓
upload
 ↓
register document
 ↓
queue processing
```

---

# 45. Document Processing

Document processing should not block the user's HTTP request for large documents.

---

# 46. Job Queue

Long-running processing should use background jobs or an equivalent architecture.

Potential jobs:

```text
document_ingestion
ocr
text_extraction
chunking
embedding
indexing
audit_execution
report_generation
```

---

# 47. Job State

Each job should have a lifecycle.

Example:

```text
QUEUED
RUNNING
SUCCEEDED
FAILED
CANCELLED
```

---

# 48. Job Retry

Retries must be bounded.

Example conceptual policy:

```text
attempt 1
 ↓
failure
 ↓
backoff
 ↓
attempt 2
 ↓
failure
 ↓
backoff
 ↓
attempt 3
 ↓
FAILED
```

---

# 49. Idempotent Jobs

Jobs must be safe to retry where possible.

Example:

```text
embedDocument(documentId, embeddingVersion)
```

should not create duplicate vectors on every retry.

---

# 50. Job Locks

Where duplicate execution could cause corruption, use a lock or idempotency mechanism.

---

# 51. Job Observability

Record:

* job ID;
* audit ID;
* document ID where relevant;
* attempt;
* started;
* completed;
* status;
* error code.

---

# 52. AI Calls

Every AI call should have:

* model;
* prompt version;
* input context;
* timeout;
* retry policy;
* output schema;
* usage tracking where available.

---

# 53. AI Timeout

Never assume the model responds quickly.

Set explicit timeout boundaries.

---

# 54. AI Retry

Retry transient provider failures.

Do not endlessly retry invalid prompts.

---

# 55. AI Output

Never directly trust:

```typescript
const result = await model.generate(...)
```

as application state.

Parse and validate first.

---

