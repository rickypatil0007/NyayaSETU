# NyayaSETU — Markdown Directory

This directory is the index for the Antigravity implementation specification. All Markdown files listed here are included in the ZIP and contain substantive instructions.

## Folder responsibilities

| Folder | Purpose | Use in Antigravity |
| --- | --- | --- |
| Root | Project entry point, file map and task ledger | First session and milestone transitions |
| `.agents/rules/` | Persistent engineering/safety rules | Keep active as workspace rules |
| `docs/` | Product, architecture, evidence, UI and acceptance specs | Attach only the current milestone's docs |
| `prompts/` | Build kickoff and runtime agent role prompts | Build kickoff / agent pipeline implementation |
| `runbooks/` | Repeatable milestone, corpus and release procedures | Attach when executing that procedure |
| `data/synthetic/` | Fictional demo contract/policy and test expectations | Development and evaluation only |

## Exact Markdown file list

| Relative path | Purpose |
| --- | --- |
| `.agents/rules/00-project.md` | NyayaSETU project contract |
| `.agents/rules/01-engineering.md` | Coding, dependency and testing rules |
| `.agents/rules/02-audit-integrity.md` | Evidence and legal-safety rules |
| `README.md` | Product + tech-stack overview |
| `START_HERE.md` | Antigravity startup instructions |
| `DIRECTORY.md` | This index |
| `TASKS.md` | Milestone ledger |
| `data/synthetic/README.md` | Synthetic-data boundaries |
| `data/synthetic/expected-behavior.md` | Developer-only expected outcomes |
| `data/synthetic/sample-sla-and-policy.md` | Fictional demo fixture |
| `docs/01-product-scope.md` | Scope and judging alignment |
| `docs/02-free-stack.md` | Chosen stack and alternatives |
| `docs/03-architecture.md` | Target architecture and code layout |
| `docs/04-knowledge-base.md` | Approved source-corpus model |
| `docs/05-ingestion-embeddings.md` | PDF extraction, chunking and embeddings |
| `docs/06-retrieval-citations.md` | RAG, citation validation and highlighting |
| `docs/07-agent-orchestration.md` | Reviewer–Skeptic–Supervisor state machine |
| `docs/08-consensus-escalation.md` | Consensus gates and human escalation |
| `docs/09-findings-policy-remediation.md` | Findings, policy comparison and remediation |
| `docs/10-data-api-contracts.md` | Data model and API contracts |
| `docs/11-security-privacy.md` | Authentication, isolation and secret handling |
| `docs/12-ui-routes.md` | Screens, routes and interactions |
| `docs/13-design-motion.md` | NyayaSETU visual system and motion |
| `docs/14-jobs-quotas-observability.md` | Durable jobs, retries, limits and logs |
| `docs/15-deployment.md` | Local and hosted deployment requirements |
| `docs/16-evaluation-tests.md` | Test/evaluation strategy |
| `docs/17-build-plan-demo.md` | Build sequence and judge demo |
| `docs/18-sources.md` | Source register and verification boundaries |
| `prompts/antigravity-build.md` | First build prompt |
| `prompts/reviewer.md` | Reviewer runtime prompt |
| `prompts/skeptic.md` | Skeptic runtime prompt |
| `prompts/supervisor.md` | Supervisor runtime prompt |
| `runbooks/build-milestone.md` | How to implement one milestone |
| `runbooks/publish-corpus.md` | How to approve a corpus snapshot |
| `runbooks/release-check.md` | Final release checklist |

## Non-Markdown helper files

- `.env.example` — documented environment-variable template; contains no secrets.
- `.gitignore` — excludes secrets, caches, uploads and generated artifacts.

## Build order

1. Foundation and persisted audit records.
2. Evidence ingestion, chunking, local embeddings and retrieval.
3. Reviewer–Skeptic–Supervisor debate with structured outputs.
4. Consensus, escalation, citations, policy alignment and remediation.
5. Audit UI, reports, evaluation, release and only then optional 3D polish.
