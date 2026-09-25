# NyayaSETU Build Ledger

Antigravity should update checkboxes only after the relevant code, tests and acceptance checks actually pass. Do not mark work complete because files were generated.

## Milestone A — Foundation

- [ ] Create `apps/web` Next.js + TypeScript application.
- [ ] Create `apps/api` FastAPI application.
- [ ] Add formatting, linting, type-check and test scripts.
- [ ] Configure Supabase client/server boundaries.
- [ ] Add initial migrations for profiles, audits and audit events.
- [ ] Implement sign-in/sign-out and protected dashboard.
- [ ] Create/retrieve an authenticated audit record end-to-end.
- [ ] Add `.env.example` mapping without secrets.

**Acceptance:** an authenticated user can create an audit, reload the page, and retrieve only their own audit.

## Milestone B — Document ingestion

- [ ] Private PDF upload to storage.
- [ ] MIME/size/page-count validation.
- [ ] PyMuPDF extraction with page provenance.
- [ ] Clause-aware chunking with stable chunk IDs.
- [ ] Local embedding worker/function.
- [ ] Pinecone upsert with metadata and namespace isolation.
- [ ] Ingestion status + retry-safe idempotency.

**Acceptance:** upload one synthetic SLA and view extracted pages/chunks with no cross-user leakage.

## Milestone C — Retrieval and citations

- [ ] Hybrid retrieval strategy documented and implemented.
- [ ] Top-k contract evidence retrieval.
- [ ] Approved source/policy retrieval.
- [ ] Citation object schema with page and chunk IDs.
- [ ] Citation validator rejects non-existent evidence.
- [ ] UI deep-link/highlight from finding to PDF page/chunk.

**Acceptance:** every displayed risk has at least one validated evidence citation or is clearly marked unsupported and routed for human review.

## Milestone D — Multi-agent core

- [ ] Reviewer prompt + schema.
- [ ] Skeptic prompt + schema.
- [ ] Supervisor prompt + schema.
- [ ] Provider adapter for Gemini.
- [ ] Structured-output validation and one corrective reprompt.
- [ ] Persist every debate turn.
- [ ] SSE stream of state/turns to the web UI.

**Acceptance:** a test fixture causes at least one genuine Reviewer/Skeptic disagreement that is visible and persisted.

## Milestone E — Consensus and escalation

- [ ] Deterministic pre-gates for citations and output validity.
- [ ] Documented score-delta consensus rule.
- [ ] Debate round cap.
- [ ] Escalation brief generation.
- [ ] Degraded/single-pass state when an agent is unavailable.
- [ ] Human review status and resolution note.

**Acceptance:** unresolved fixture automatically escalates after the round cap; no silent infinite loop.

## Milestone F — Findings, policy alignment and reports

- [ ] Finding severity/topic/status model.
- [ ] Compare contract clauses with approved internal policy.
- [ ] Remediation suggestions tied to evidence.
- [ ] Markdown report export.
- [ ] PDF report export.
- [ ] Report contains disclaimer and evidence appendix.

## Milestone G — UI/UX

- [ ] Dashboard and audit history.
- [ ] Upload/new-audit flow.
- [ ] Audit workspace with document/evidence/debate/findings panels.
- [ ] Source browser and policy pages.
- [ ] Empty/loading/error/degraded states.
- [ ] Keyboard and screen-reader accessibility pass.
- [ ] Responsive layouts.

## Milestone H — Evaluation and release

- [ ] 8–10 synthetic/public-template-derived evaluation cases with clear provenance.
- [ ] Reviewer issue-detection metric.
- [ ] Skeptic genuine-counterargument metric.
- [ ] Supervisor consensus/escalation metric.
- [ ] Citation validity metric must be 100% for accepted findings.
- [ ] Unit/integration/E2E failure-path tests.
- [ ] Clone-and-run instructions tested from a clean checkout.
- [ ] Secrets scan and access-control review.
- [ ] 4-minute demo rehearsal.

## Optional after H

- [ ] Landing-page 3D bridge motif.
- [ ] Micro-interactions and presentation polish.
- [ ] Additional contract types only if the evaluation set remains strong.
