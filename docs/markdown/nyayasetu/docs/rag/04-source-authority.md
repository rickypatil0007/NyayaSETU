# NyaySetu RAG — Source Authority

## 1. Purpose

This document defines how NyaySetu evaluates and manages the authority of legal, regulatory, and supporting sources.

Source authority is fundamental to legal compliance auditing.

A highly relevant document is not automatically an authoritative document.

---

## 2. Authority Principle

The system SHOULD prefer:

```text
Primary authoritative source
>
Official secondary explanation
>
Trusted secondary source
>
General reference
```

When a primary source is available, secondary material should not silently replace it.

---

## 3. Source Categories

Recommended categories:

```text
LEGISLATION
REGULATION
GOVERNMENT_NOTIFICATION
GAZETTE
REGULATOR_GUIDANCE
COURT_DECISION
OFFICIAL_STANDARD
CONTRACTUAL_REQUIREMENT
INTERNAL_POLICY
SECONDARY_LEGAL_SOURCE
GENERAL_REFERENCE
UNKNOWN
```

---

## 4. Authority Levels

Recommended authority levels:

```text
LEVEL_1 — Primary authoritative
LEVEL_2 — Official supporting
LEVEL_3 — Recognized secondary
LEVEL_4 — General reference
LEVEL_5 — Unknown
```

---

## 5. Level 1 Sources

Examples include:

* enacted legislation
* official regulations
* official government notifications
* official gazettes
* official regulator decisions
* authoritative court decisions

These should receive the highest source priority.

---

## 6. Level 2 Sources

Examples:

* official regulatory guidance
* official FAQs
* implementation guidance
* government explanatory material

These can provide useful interpretation and context.

They should not automatically override primary legal text.

---

## 7. Level 3 Sources

Examples:

* recognized legal commentary
* professional publications
* established legal research resources

These may assist retrieval and interpretation.

Claims based only on Level 3 material SHOULD receive lower authority confidence.

---

## 8. Level 4 Sources

Examples:

* general articles
* blogs
* educational websites
* non-authoritative summaries

These should generally be treated as contextual information rather than authoritative legal evidence.

---

## 9. Unknown Sources

If authority cannot be established:

```text
authority = UNKNOWN
```

The source MUST NOT be presented as authoritative.

---

## 10. Source Verification

When registering a source, verify:

* publisher
* domain
* issuing authority
* document title
* publication date
* version
* jurisdiction
* source type

---

## 11. Official Domain

An official domain can be a useful signal of authority.

However, domain alone is insufficient.

The system should also inspect:

* document metadata
* issuing authority
* publication context
* source provenance

---

## 12. Source URL

Store the source URL where legally and technically appropriate.

Example:

```text
source_url
```

The URL should point to the original or authoritative location.

---

## 13. Source Snapshot

For reproducibility, the system SHOULD retain an accessible snapshot or stored copy where legally permitted.

The snapshot MUST retain:

```text
content_hash
retrieved_at
source_url
```

---

## 14. Licensing

The knowledge-base administrator MUST respect source licensing.

Do not ingest copyrighted or licensed material beyond permitted usage.

Store licensing metadata:

```text
license
usage_restrictions
attribution_required
```

---

## 15. Jurisdiction

Every legal source SHOULD specify jurisdiction.

Examples:

```text
India
Maharashtra
European Union
United States
```

The retrieval system MUST NOT assume jurisdiction from language alone.

---

## 16. Jurisdiction Matching

A source should be considered applicable only when its jurisdiction matches the audit context or a documented cross-jurisdiction rule applies.

Example:

```text
Audit:
India

Source:
United States

Default:
Do not treat as applicable Indian law.
```

The source may still be useful for comparative context.

---

## 17. Regulatory Authority

Record the authority that issued the requirement.

Example:

```text
issuer:
Reserve Bank of India
```

or another appropriate official authority.

---

## 18. Publication Date

Publication date indicates when the source was issued or published.

It does not necessarily mean the requirement became effective on that date.

Therefore store separately:

```text
publication_date
effective_from
```

---

## 19. Effective Date

The effective date determines when a provision applies.

Example:

```text
publication_date:
2026-01-01

effective_from:
2026-04-01
```

The system should use `effective_from` for temporal applicability where appropriate.

---

## 20. Expiration

Some requirements may have an end date.

Store:

```text
effective_until
```

A source with an expired applicability window should not be selected for current audits unless historical analysis requires it.

---

## 21. Repealed Sources

A repealed regulation SHOULD remain stored for historical traceability.

Its status should become:

```text
REPEALED
```

Do not delete it simply because it is no longer current.

---

## 22. Superseded Sources

If a source is replaced:

```text
Version 1
    |
    v
Superseded by
    |
    v
Version 2
```

Store the relationship.

---

## 23. Amendments

An amendment should reference the source it modifies.

Example:

```text
Amendment A
    |
    v
Regulation V1
    |
    v
Regulation V2
```

This supports historical reconstruction.

---

## 24. Source Version

Every version SHOULD have a stable identifier.

Example:

```text
REG-2026-V3
```

Do not use only filenames to identify legal versions.

---

## 25. Version Comparison

The system SHOULD support identifying:

* added provisions
* removed provisions
* changed wording
* changed effective dates
* changed penalties
* changed definitions

---

## 26. Conflicting Sources

If two authoritative sources appear contradictory, do not automatically assign priority based only on retrieval score.

Investigate:

* hierarchy
* jurisdiction
* effective date
* scope
* amendment history
* applicability
* source authority

---

## 27. Source Hierarchy

Where applicable, source hierarchy may influence interpretation.

However, the hierarchy MUST be explicitly defined for the relevant legal system.

Do not invent a hierarchy.

---

## 28. Secondary Sources

Secondary sources MAY be used to discover relevant primary sources.

For example:

```text
Legal commentary
      |
      v
Find regulation name
      |
      v
Retrieve official regulation
```

The final compliance claim should preferably cite the primary source.

---

## 29. Search Discovery vs Evidence

Distinguish:

```text
Discovery source
```

from:

```text
Evidence source
```

A blog may help discover a regulation.

The regulation itself should be used as evidence.

---

## 30. Authority Scoring

If an internal authority score is used, document the scoring criteria.

Example conceptual model:

```text
authority_score =
publisher_authority
+
source_type
+
official_status
+
verification_status
```

The exact formula MUST be deterministic and documented.

---

## 31. Retrieval Ranking

Authority SHOULD influence retrieval ranking.

However, authority MUST NOT completely override relevance.

A highly authoritative but irrelevant document is still irrelevant.

---

## 32. Authority + Relevance

A useful conceptual model:

```text
Final Evidence Quality
=
Relevance
+
Authority
+
Temporal Validity
+
Citation Precision
```

No single factor is sufficient.

---

## 33. Source Status

Recommended statuses:

```text
DRAFT
VERIFIED
CURRENT
SUPERSEDED
REPEALED
EXPIRED
DISPUTED
UNKNOWN
```

---

## 34. Verification Workflow

```text
Source Discovered
      |
      v
Metadata Collected
      |
      v
Publisher Verified
      |
      v
Authority Classified
      |
      v
Version Identified
      |
      v
Dates Verified
      |
      v
Content Hash Generated
      |
      v
Source Approved
```

---

## 35. Manual Verification

High-impact sources SHOULD support manual verification.

A reviewer can confirm:

* authority
* version
* applicability
* source authenticity

---

## 36. Source Approval

Only approved sources SHOULD enter the production compliance corpus.

Example:

```text
source_status = VERIFIED
```

Unverified sources may remain in a staging corpus.

---

## 37. Staging Sources

Staging sources are not production evidence.

They can be used for:

* testing
* evaluation
* development
* source discovery

They MUST be clearly separated from production sources.

---

## 38. Source Metadata Example

```json
{
  "sourceId": "src_001",
  "title": "Example Regulation",
  "authority": "PRIMARY",
  "issuer": "Official Authority",
  "jurisdiction": "India",
  "sourceType": "REGULATION",
  "publicationDate": "2026-01-10",
  "effectiveFrom": "2026-04-01",
  "effectiveUntil": null,
  "version": "2026-V1",
  "status": "CURRENT",
  "verified": true
}
```

---

## 39. Source Integrity

The system MUST detect unexpected source changes.

If the same source URL produces a different content hash:

```text
SOURCE_CONTENT_CHANGED
```

should be recorded.

The source SHOULD be reprocessed.

---

## 40. Source Freshness

Current sources should be periodically checked where automated updates are supported.

The system SHOULD distinguish:

```text
last_verified_at
last_retrieved_at
publication_date
effective_from
```

These are different concepts.

---

## 41. Update Monitoring

An update process MAY monitor approved sources.

When changes are detected:

```text
Source Changed
    |
    v
Create New Version
    |
    v
Process
    |
    v
Validate
    |
    v
Index
    |
    v
Mark Current
```

---

## 42. Historical Integrity

Never rewrite completed audits using newly ingested source versions.

Historical audits must retain their original source references.

---

## 43. Evidence Authority in Reports

Reports SHOULD show the authority of important sources.

Example:

```text
Source:
Official regulatory publication

Authority:
Primary

Version:
2026-V2
```

---

## 44. Authority Disclaimer

If only secondary evidence is available, the report SHOULD communicate that limitation.

Example:

```text
The assessment is based on secondary explanatory material because
the authoritative source was not available in the knowledge base.
```

---

## 45. Unknown Authority

If source authority is unknown:

```text
authority = UNKNOWN
```

The agent SHOULD NOT describe it as:

```text
official law
```

or:

```text
mandatory regulation
```

without independent evidence.

---

## 46. Source Quality Checklist

Before approving a source:

* [ ] Publisher identified
* [ ] Authority verified
* [ ] Jurisdiction known
* [ ] Source type classified
* [ ] Publication date known
* [ ] Effective date known where applicable
* [ ] Version identified
* [ ] Source URL recorded
* [ ] Content hash generated
* [ ] Licensing reviewed
* [ ] Status assigned
* [ ] Verification recorded

---

## 47. Source Priority Rules

Preferred order:

```text
1. Current primary authoritative source
2. Applicable official guidance
3. Historical primary source for historical audits
4. Trusted secondary source
5. General reference
```

---

## 48. Source Selection Rule

The system MUST NOT select a source solely because:

```text
similarity_score = highest
```

Selection should also consider:

* authority
* applicability
* date
* jurisdiction
* version
* evidence quality

---

## 49. Legal Uncertainty

Where source interpretation remains uncertain, preserve the uncertainty.

Example:

```text
Source authority:
PRIMARY

Interpretation:
UNCERTAIN

Action:
SUPERVISOR_REVIEW
```

Primary authority does not eliminate interpretive ambiguity.

---

## 50. Final Source Authority Rule

NyaySetu must always distinguish:

```text
What is relevant
```

from:

```text
What is authoritative
```

and:

```text
What is currently applicable
```

A trustworthy compliance system requires all three.

### Code vs Architecture Drift Gap Analysis

| Area | Current | Target | Gap | Action |
|------|---------|--------|-----|--------|
| Embedding | `sentence-transformers` local pipeline verified in `embeddings.py` | External Hugging Face APIs | Code uses local processing | Update documentation to reflect local embedding strategy |
| Pinecone | Generic `nyayasetu` namespace verified in `vectorstore.py` | Isolated Legal vs Contract KBs | Code does not isolate tenants | Refactor namespace logic or update docs to reflect single namespace MVP |
