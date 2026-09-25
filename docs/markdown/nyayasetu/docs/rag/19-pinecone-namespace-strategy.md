# NyaySetu Pinecone Namespace Strategy

**Project:** NyaySetu
**Module:** RAG Knowledge Base
**File:** `docs/rag/19-pinecone-namespace-strategy.md`
**Status:** Production Specification

---

# 1. Purpose

Namespaces provide logical separation inside the Pinecone retrieval architecture.

NyaySetu must use namespaces deliberately because the platform may contain:

* public legal sources;
* organization-specific policies;
* audit evidence;
* private documents;
* development datasets.

---

# 2. Primary Goal

A namespace strategy must provide:

```text
Isolation
+
Predictability
+
Security
+
Operational simplicity
```

---

# 3. Recommended Conceptual Model

```text
Pinecone Index
│
├── legal_public
│
├── organization_A
│
├── organization_B
│
└── controlled_test
```

The exact production layout may vary depending on scale and operational requirements.

---

# 4. Public Legal Namespace

Public legal and regulatory sources may be placed in:

```text
legal_public
```

---

# 5. Organization Namespace

Private organization material may use:

```text
org_<internal_identifier>
```

---

# 6. Internal Identifier

The namespace identifier must use a stable internal organization identifier.

Do not use:

* organization names;
* email addresses;
* user names;
* sensitive identifiers.

---

# 7. Security Principle

Namespace selection must never be controlled directly by an untrusted client.

---

# 8. Authentication Flow

```text
User
 ↓
Authentication
 ↓
Session
 ↓
Organization Membership
 ↓
Authorization
 ↓
Namespace Selection
 ↓
Pinecone
```

---

# 9. Authorization

The application must verify that the authenticated user belongs to the requested organization.

---

# 10. Client API

A client may send:

```json
{
  "auditId": "audit_123",
  "query": "What records must be retained?"
}
```

The client should not need to send:

```json
{
  "namespace": "org_other_company"
}
```

---

# 11. Server Resolution

The server determines the correct namespace from:

```text
authenticated user
+
audit
+
organization membership
```

---

# 12. Public Retrieval

Public legal retrieval can use:

```text
legal_public
```

without exposing private organization data.

---

# 13. Private Retrieval

Private retrieval must be restricted to the current organization's authorized namespace.

---

# 14. Mixed Retrieval

An audit may need:

```text
legal_public
+
organization_private
```

---

# 15. Mixed Retrieval Architecture

```text
                  Audit Requirement
                         ↓
              ┌──────────┴──────────┐
              ↓                     ↓
       Legal Retrieval       Organization Retrieval
              ↓                     ↓
        legal_public             org_X
              ↓                     ↓
              └──────────┬──────────┘
                         ↓
                   Evidence Layer
```

---

# 16. Why Separate Queries

Separate queries make source boundaries explicit.

---

# 17. Why Not One Global Namespace

A single unrestricted namespace makes accidental cross-tenant retrieval easier.

---

# 18. Alternative Strategy

At larger scale, tenant separation may also use:

* separate indexes;
* metadata filters;
* database authorization;
* application-level policies.

---

# 19. Namespace vs Authorization

A namespace is not an authorization system.

It is one technical isolation mechanism.

---

# 20. Defense in Depth

NyaySetu should combine:

```text
Authentication
+
Authorization
+
Namespace isolation
+
Metadata filtering
+
Database RLS
```

where appropriate.

---

# 21. Organization RLS

Supabase organization records should enforce appropriate Row Level Security.

---

# 22. Pinecone Filter

Private vectors can additionally contain:

```text
organization_id
```

---

# 23. Double Boundary

For private retrieval:

```text
namespace = org_X
AND
organization_id = org_X
```

where this is compatible with the selected architecture.

---

# 24. Mismatch Detection

If namespace says:

```text
org_A
```

but metadata says:

```text
organization_id = org_B
```

the ingestion/reconciliation process should flag the vector.

---

# 25. Public Data

Public data should not contain private organization identifiers unless there is a legitimate reason.

---

# 26. Internal Policies

Internal policies belong in organization-specific scope.

---

# 27. Audit Evidence

Audit evidence must remain within the organization that owns it unless explicit sharing is supported.

---

# 28. Shared Sources

A source intentionally shared across organizations should be modeled as a separate controlled source class rather than copied casually between tenants.

---

# 29. Source Ownership

Every private chunk must have clear ownership.

---

# 30. Namespace Naming

Use lowercase predictable naming.

Example:

```text
legal_public
org_01jabc...
```

---

# 31. No Sensitive Names

Avoid:

```text
org_tata_motors
org_ricky
org_user@email.com
```

---

# 32. Environment Separation

Development namespaces should not overlap with production namespaces.

---

# 33. Environment Prefix

Possible:

```text
dev_legal_public
staging_legal_public
prod_legal_public
```

If separate indexes are used, environment prefixes may be unnecessary.

---

# 34. Recommended Simplicity

Prefer separate indexes for major environments where practical.

Then:

```text
production index
    ↓
legal_public
org_X
```

is easier to reason about.

---

# 35. Testing Namespace

Use a dedicated test namespace.

Example:

```text
test_rag
```

---

# 36. Test Data

Never place real confidential organization data into a shared test namespace without authorization.

---

# 37. Namespace Lifecycle

A namespace may move through:

```text
CREATED
ACTIVE
MIGRATING
DEPRECATED
DELETED
```

---

# 38. Namespace Creation

Namespace creation should be triggered by trusted application workflows.

---

# 39. Namespace Deletion

Deletion must require strong authorization and confirmation.

---

# 40. Deletion Safety

Deleting an organization namespace may remove all indexed private vectors.

The application should verify:

```text
organization
+
retention policy
+
active audits
```

before destructive operations.

---

# 41. Historical Audits

Historical audit evidence may require retaining old vectors even if the organization changes its current policies.

---

# 42. Retention

Namespace deletion should respect document and audit retention policies.

---

# 43. Organization Deactivation

Deactivating an organization must not automatically imply immediate deletion unless policy explicitly requires it.

---

# 44. Offboarding

Organization offboarding should trigger a controlled process:

```text
disable access
 ↓
freeze writes
 ↓
evaluate retention
 ↓
archive/delete according to policy
```

---

# 45. Namespace Migration

If an organization changes tenancy strategy:

```text
old namespace
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

# 46. Migration Verification

Verify:

```text
vector count
metadata
ownership
retrieval
citations
```

---

# 47. Namespace Enumeration

Do not expose the full namespace list to clients.

---

# 48. Namespace Discovery

Server-side configuration should determine allowed namespaces.

---

# 49. API Authorization

An API endpoint should never trust:

```text
req.body.namespace
```

as sufficient authorization.

---

# 50. Audit Scope

An audit should define which knowledge sources it is permitted to access.

---

# 51. Audit Knowledge Scope

Conceptually:

```typescript
interface AuditKnowledgeScope {
  publicLegal: boolean;
  organizationId: string;
  privateSources: string[];
}
```

---

# 52. Retrieval Policy

The audit scope should be resolved before querying Pinecone.

---

# 53. Evidence Classification

Every retrieved chunk should indicate whether it originated from:

```text
PUBLIC_LEGAL
ORGANIZATION_PRIVATE
```

---

# 54. Agent Awareness

Agents should know the source class of evidence.

---

# 55. Public Authority

Legal sources may have higher authority than internal policies when determining legal requirements.

The final authority policy belongs to the audit system.

---

# 56. Internal Evidence

Internal evidence can demonstrate organizational practice.

It does not automatically override legal requirements.

---

# 57. Cross-Tenant Protection

A retrieval request for:

```text
organization A
```

must never return:

```text
organization B private evidence
```

---

# 58. Test

Create two test organizations:

```text
ORG_A
ORG_B
```

and ensure:

```text
ORG_A query → A only
ORG_B query → B only
```

while public legal material remains accessible where authorized.

---

# 59. Adversarial Test

Attempt:

```text
namespace = org_B
```

from an ORG_A client.

Expected:

```text
DENIED
```

---

# 60. Metadata Tampering

A user must not be able to alter:

```text
organization_id
namespace
visibility
```

through an untrusted client payload.

---

# 61. Server Ownership

These values should be assigned by trusted backend workflows.

---

# 62. Public Source Updates

When a public legal source is amended:

```text
new version
 ↓
new chunks
 ↓
new vectors
```

---

# 63. Private Policy Updates

When an organization policy changes:

```text
new document version
 ↓
new chunks
 ↓
new vectors
```

---

# 64. Historical Versions

Old versions may remain searchable for historical audits according to retention policy.

---

# 65. Current Version

Current audits should apply the effective-date and version-selection rules.

---

# 66. Namespace and Versioning

Do not create one namespace per regulation version unless scale and architecture justify it.

Prefer metadata-based version filtering within an appropriate source scope.

---

# 67. Namespace Explosion

Avoid creating thousands of unnecessary namespaces for:

* each document;
* each section;
* each audit;
* each version.

---

# 68. Namespace Granularity

Namespace should represent a meaningful isolation boundary, not a random application object.

---

# 69. Recommended Granularity

Typical:

```text
environment
+
source/tenant boundary
```

rather than:

```text
environment
+
document
+
section
```

---

# 70. Audit-Level Isolation

Audit-level separation can usually be enforced through metadata and authorization rather than separate namespaces.

---

# 71. Retrieval Scope

An audit should retrieve only:

```text
authorized public sources
+
authorized organization sources
```

---

# 72. Query Construction

Conceptually:

```typescript
const scope = await resolveAuditKnowledgeScope(auditId, user);

const publicResults = scope.publicLegal
  ? await searchPublicLegal(query)
  : [];

const privateResults = scope.privateSources.length
  ? await searchOrganizationKnowledge(query, scope)
  : [];
```

---

# 73. Evidence Fusion

Results should be merged only after each source boundary has been validated.

---

# 74. Ranking

A later reranking layer can combine results.

---

# 75. Citation

Each result retains its original source classification.

---

# 76. No Provenance Loss

Do not merge vectors into anonymous text.

---

# 77. Logging

Log:

```text
retrieval_id
organization_id
namespace class
result count
latency
```

Avoid logging private content unnecessarily.

---

# 78. Privacy

Namespace identifiers should not reveal sensitive organization names.

---

# 79. Monitoring

Monitor:

```text
namespace query failures
cross-tenant violations
unexpected vector counts
orphan vectors
stale vectors
```

---

# 80. Security Alerts

A detected cross-tenant retrieval event should be treated as a high-priority security event.

---

# 81. Incident Response

If tenant isolation is suspected to be broken:

```text
stop affected retrieval path
 ↓
preserve logs
 ↓
identify scope
 ↓
invalidate affected access
 ↓
repair isolation
 ↓
verify
```

---

# 82. Data Deletion

Namespace deletion should be traceable and auditable.

---

# 83. Deletion Record

Store:

```text
organization_id
namespace
requested_by
approved_by
timestamp
reason
result
```

where appropriate.

---

# 84. Namespace Inventory

Maintain an application-level inventory:

```text
namespace
owner
environment
status
created_at
```

---

# 85. Do Not Infer Ownership

The application should not infer namespace ownership solely from a namespace string.

---

# 86. Canonical Ownership

Ownership should be stored in the database.

---

# 87. Namespace Mapping

Example:

```typescript
interface NamespaceMapping {
  organizationId: string;
  namespace: string;
  environment: string;
  status: "ACTIVE" | "DEPRECATED";
}
```

---

# 88. Validation

Before retrieval:

```text
namespace exists
+
organization authorized
+
namespace active
```

---

# 89. Retrieval Failure

If namespace resolution fails:

```text
do not query a fallback namespace
```

---

# 90. Critical Safety Rule

Never silently fall back from:

```text
org_A
```

to:

```text
global
```

because the private namespace was unavailable.

---

# 91. Public Fallback

Public legal retrieval can be attempted separately when the audit policy permits it.

---

# 92. Fail Closed

For private data:

```text
authorization uncertainty
→ deny retrieval
```

---

# 93. Testing

Test:

* valid organization;
* invalid organization;
* disabled organization;
* missing namespace;
* wrong namespace;
* public retrieval;
* mixed retrieval;
* historical retrieval.

---

# 94. Acceptance Criteria

Namespace strategy is production-ready when:

* public and private data are separated;
* server controls namespace selection;
* organization ownership is verified;
* RLS supports the same isolation model;
* cross-tenant tests pass;
* historical retrieval remains possible;
* destructive deletion is controlled;
* migration is documented.

---

# 95. Production Checklist

* [ ] Public namespace defined.
* [ ] Private namespace strategy defined.
* [ ] Environment separation.
* [ ] Stable internal IDs.
* [ ] No sensitive names in namespaces.
* [ ] Server-side namespace resolution.
* [ ] Organization authorization.
* [ ] Metadata organization filter.
* [ ] Supabase RLS.
* [ ] Mixed retrieval support.
* [ ] Historical version support.
* [ ] Namespace inventory.
* [ ] Namespace migration.
* [ ] Namespace deletion controls.
* [ ] Cross-tenant tests.
* [ ] Adversarial authorization tests.
* [ ] Monitoring.
* [ ] Incident response.
* [ ] Audit logging.

---

# 96. Final Principle

> **A namespace is an isolation boundary, not a shortcut around authorization. NyaySetu must enforce ownership before, during, and after retrieval.**

### Code vs Architecture Drift Gap Analysis

| Area | Current | Target | Gap | Action |
|------|---------|--------|-----|--------|
| Embedding | `sentence-transformers` local pipeline verified in `embeddings.py` | External Hugging Face APIs | Code uses local processing | Update documentation to reflect local embedding strategy |
| Pinecone | Generic `nyayasetu` namespace verified in `vectorstore.py` | Isolated Legal vs Contract KBs | Code does not isolate tenants | Refactor namespace logic or update docs to reflect single namespace MVP |
