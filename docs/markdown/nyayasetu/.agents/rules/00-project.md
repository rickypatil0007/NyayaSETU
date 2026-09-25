---
trigger: always_on
---

# NyaySetu — Engineering Standards

## 1. Purpose

This document defines engineering standards for building, maintaining, testing, and deploying NyaySetu.

The goal is to produce software that is:

* maintainable
* secure
* testable
* observable
* deterministic where possible
* evidence-grounded where AI is used
* production-ready
* understandable by future developers

---

## 2. General Engineering Principles

### Principle 1 — Prefer Simple Architecture

Do not introduce infrastructure merely because it is technically impressive.

Every service MUST have a clear purpose.

Avoid unnecessary:

* microservices
* queues
* abstractions
* libraries
* AI agents
* database layers
* state-management frameworks

For MVP development, a modular monolith is preferred unless there is a demonstrated reason to split services.

---

## 3. Type Safety

TypeScript SHOULD be used throughout the application.

Avoid:

```typescript
any
```

unless there is a documented reason.

Prefer explicit types.

Example:

```typescript
interface AuditFinding {
  id: string;
  auditId: string;
  title: string;
  severity: FindingSeverity;
  confidence: number;
  status: FindingStatus;
}
```

---

## 4. Enumerations

Important domain states SHOULD use enumerations or literal unions.

Example:

```typescript
type FindingSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";
```

Avoid free-form strings for critical state fields.

---

## 5. Input Validation

All external input MUST be validated.

External input includes:

* HTTP requests
* form submissions
* query parameters
* route parameters
* uploaded files
* webhook payloads
* model output
* retrieved documents

Validation MUST occur at the server boundary.

---

## 6. Validation Strategy

A schema validation library SHOULD be used consistently.

Example conceptual schema:

```typescript
const CreateAuditSchema = z.object({
  name: z.string().min(1).max(200),
  regulationIds: z.array(z.string()).min(1),
  documentIds: z.array(z.string()).min(1),
});
```

Never assume that frontend validation protects the backend.

Frontend validation improves UX.

Backend validation provides security.

---

## 7. Error Design

Use structured errors.

Example:

```typescript
class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public retryable: boolean = false
  ) {
    super(message);
  }
}
```

Recommended error categories:

```text
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
VALIDATION_ERROR
NOT_FOUND
CONFLICT
RATE_LIMITED
RAG_ERROR
MODEL_ERROR
DATABASE_ERROR
STORAGE_ERROR
INTERNAL_ERROR
```

---

## 8. Error Exposure

Never expose stack traces to end users in production.

Bad:

```text
PrismaClientKnownRequestError:
Invalid `prisma.audit.create()` invocation...
```

Good:

```text
We couldn't create the audit right now.
Please try again.
```

Internal systems SHOULD log the diagnostic error with a correlation ID.

---

## 9. Logging

Use structured logs.

Preferred:

```json
{
  "level": "error",
  "event": "audit_execution_failed",
  "auditId": "audit_123",
  "agentRunId": "run_456",
  "errorCode": "MODEL_TIMEOUT",
  "retryable": true
}
```

Avoid unstructured debugging statements in production.

---

## 10. Correlation IDs

Every audit execution SHOULD have a correlation identifier.

Example:

```text
request_id
audit_id
agent_run_id
```

These identifiers allow developers to reconstruct what happened.

---

## 11. Database Access

Database access MUST remain centralized where practical.

Avoid scattering raw database queries throughout UI components.

Preferred structure:

```text
UI
 |
Server Action / API
 |
Service
 |
Repository / ORM
 |
Database
```

---

## 12. Business Logic

Business rules SHOULD live in service/domain layers rather than React components.

Bad:

```tsx
if (finding.score > 80 && user.role === "admin") {
  ...
}
```

Preferred:

```typescript
const decision = evaluateFindingApproval({
  finding,
  actor
});
```

This allows business logic to be tested independently.

---

## 13. API Conventions

APIs MUST have predictable structures.

Example:

```text
POST /api/audits
GET  /api/audits/:id
POST /api/audits/:id/run
GET  /api/audits/:id/findings
POST /api/findings/:id/review
GET  /api/reports/:id
```

Use HTTP methods according to operation semantics.

---

## 14. API Responses

Successful responses SHOULD have predictable shapes.

Example:

```json
{
  "data": {},
  "requestId": "req_123"
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Audit name is required."
  },
  "requestId": "req_123"
}
```

---

## 15. Authentication

Authentication MUST be verified server-side.

Never trust:

```text
Authorization: user claims
```

without verification.

A valid session establishes identity.

Authorization establishes permission.

These are separate concerns.

---

## 16. Authorization

Authorization MUST be checked for every protected resource.

For an audit:

```text
User
  |
  +-- authenticated?
        |
        +-- member of organization?
              |
              +-- authorized for audit?
                    |
                    +-- action permitted?
```

Do not rely solely on frontend route protection.

---

## 17. Resource Ownership

A user MUST NOT access another organization's resources by changing an ID.

Example attack:

```text
/api/audits/audit-company-A
```

while authenticated as a user from Company B.

The server MUST reject the request.

---

## 18. Secrets

Secrets belong exclusively in secure server-side environment variables or secret-management infrastructure.

Never expose:

```text
PINECONE_API_KEY
SUPABASE_SERVICE_ROLE_KEY
MODEL_API_KEY
HF_TOKEN
```

to client-side code.

---

## 19. Environment Variables

Use separate environments where practical:

```text
.env.local
.env.test
production environment variables
```

Never commit real secrets.

Maintain:

```text
.env.example
```

with placeholder values only.

---

## 20. Git Standards

Commits SHOULD be focused.

Good:

```text
feat: add audit finding model
fix: prevent cross-organization audit access
test: add RAG citation validation
```

Avoid:

```text
update stuff
changes
final final
working now
```

---

## 21. Branching

Use feature branches for significant work.

Example:

```text
main
  |
  +-- feature/rag-retrieval
  +-- feature/audit-engine
  +-- feature/evidence-viewer
```

Production-ready code SHOULD be merged only after validation.

---

## 22. Dependency Management

Before adding a dependency, ask:

1. Is it necessary?
2. Is the project maintained?
3. Is it secure?
4. Does it significantly increase bundle size?
5. Can the requirement be solved with existing tools?

Do not install libraries simply because they are popular.

---

## 23. Frontend Engineering

React components SHOULD be:

* focused
* reusable where appropriate
* accessible
* responsive
* predictable

Avoid extremely large components.

A component responsible for layout, data fetching, business logic, animations, and API mutation simultaneously SHOULD be split.

---

## 24. Server Components and Client Components

Use server-side execution where client interactivity is unnecessary.

Use client components when requiring:

* browser APIs
* interactive state
* event handlers
* client-side animation
* real-time interaction

Do not mark entire pages as client components unnecessarily.

---

## 25. Loading States

Every asynchronous user flow SHOULD have a loading state.

Examples:

```text
Uploading document...
Processing document...
Searching regulations...
Running Reviewer...
Running Skeptic...
Supervisor reviewing...
Generating report...
```

The interface SHOULD communicate progress without exposing misleading internal details.

---

## 26. Empty States

Empty states should explain:

1. what is missing
2. why it matters
3. what the user should do next

Example:

```text
No evidence uploaded yet.

Add policies, procedures, certificates, or audit records
to begin the compliance assessment.
```

---

## 27. Accessibility

Interactive elements MUST be keyboard accessible.

Requirements:

* visible focus
* sufficient contrast
* semantic headings
* accessible labels
* meaningful button text
* keyboard navigation
* reduced-motion support

Animations MUST NOT prevent task completion.

---

## 28. Responsive Design

The application SHOULD support:

* mobile
* tablet
* desktop
* large desktop

Critical audit workflows MUST remain usable at smaller widths.

Do not hide critical information only because the screen is narrow.

---

## 29. Animation Engineering

Animations SHOULD enhance hierarchy and orientation.

Avoid:

* continuous unnecessary motion
* excessive parallax
* distracting 3D effects
* animation on every element
* long transitions blocking interaction

Respect:

```css
prefers-reduced-motion
```

---

## 30. File Uploads

Uploaded files MUST be validated.

Validation SHOULD include:

* extension
* MIME type
* file size
* filename
* content inspection where possible

Never trust the extension alone.

Example:

```text
report.pdf.exe
```

must not be treated as a PDF merely because a string contains `.pdf`.

---

## 31. Document Processing

Document processing MUST preserve provenance.

For each extracted segment, preserve:

```text
document_id
page_number
section
paragraph
source_hash
extraction_method
```

This allows citation reconstruction.

---

## 32. AI Output Validation

Never directly persist model output into critical database fields without validation.

Model output SHOULD be parsed into a schema.

Example:

```typescript
const FindingSchema = z.object({
  requirementId: z.string(),
  status: z.enum([
    "COMPLIANT",
    "PARTIALLY_COMPLIANT",
    "NON_COMPLIANT",
    "INSUFFICIENT_EVIDENCE"
  ]),
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
  evidenceIds: z.array(z.string()),
  citationIds: z.array(z.string())
});
```

---

## 33. Deterministic Rules

Use deterministic logic whenever possible.

Examples:

* permission checks
* score range validation
* state transitions
* file-size validation
* citation existence
* organization ownership
* required-field validation

Do not ask an LLM to perform simple deterministic validation.

---

## 34. AI Model Calls

Model calls MUST have:

* timeout
* retry policy
* structured output where possible
* token limits
* logging
* failure handling

Never allow an unavailable model to indefinitely block an audit.

---

## 35. Retry Policy

Retries SHOULD only occur for transient failures.

Examples of retryable failures:

```text
timeout
temporary provider failure
rate limit
temporary network failure
```

Do not blindly retry:

```text
invalid API key
invalid request
authorization failure
malformed prompt
invalid schema
```

---

## 36. Idempotency

Operations that may be retried SHOULD be idempotent.

Examples:

```text
document ingestion
vector upsert
report generation
audit job submission
```

Use idempotency keys or deterministic operation identifiers where appropriate.

---

## 37. Background Jobs

Long-running tasks SHOULD NOT block ordinary HTTP requests.

Examples:

* PDF extraction
* OCR
* embedding generation
* vector ingestion
* large audit execution
* report generation

Jobs SHOULD expose status.

---

## 38. Job State

Recommended:

```text
PENDING
RUNNING
SUCCEEDED
FAILED
CANCELLED
```

Store:

* started_at
* completed_at
* error_code
* retry_count
* job_id

---

## 39. Testing

Minimum testing layers:

```text
Unit
Integration
API
Database
RAG
Agent
Security
E2E
Regression
```

Critical business logic MUST have automated tests.

---

## 40. Testing AI Systems

AI tests SHOULD evaluate behavior rather than exact wording.

Test:

* grounding
* citation correctness
* evidence selection
* unsupported claims
* contradiction handling
* confidence behavior
* refusal when evidence is insufficient

Avoid tests that require an exact LLM sentence.

---

## 41. RAG Testing

At minimum test:

* relevant retriev