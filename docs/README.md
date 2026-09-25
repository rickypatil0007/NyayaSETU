# NyayaSETU — Antigravity Build Pack

NyayaSETU is an evidence-first, multi-agent legal and regulatory compliance auditing web application. It is designed around the PS05 challenge direction supplied with this project: a **Reviewer** identifies a clause-level risk, a **Skeptic** challenges that claim using the same evidence, and a **Supervisor** decides whether the disagreement is resolved or must be escalated to a human.

> NyayaSETU is a decision-support and audit-assistance system, **not a lawyer and not a substitute for professional legal advice**. A finding is valid only when it is traceable to the uploaded agreement and/or an approved source in the curated knowledge base.

## The experience we are building

1. A user signs in and creates an audit.
2. The user uploads an SLA, NDA, or vendor agreement as a PDF.
3. NyayaSETU extracts text, preserves page-level provenance, chunks the document and embeds the chunks.
4. Retrieval supplies the most relevant contract clauses plus approved policy/regulatory evidence to the Reviewer.
5. Reviewer and Skeptic exchange structured, cited positions rather than generic chat.
6. Supervisor applies deterministic safety gates plus model judgment. If a disagreement remains after the round cap, NyayaSETU creates a human escalation brief.
7. The UI shows the live debate, exact supporting clauses, final findings, remediation suggestions, policy alignment, and an exportable report.

## Recommended tech stack

| Layer | Technology | Why it is here |
| --- | --- | --- |
| Coding workspace | Google Antigravity | Workspace rules, milestone prompts and iterative implementation |
| Web app | Next.js + TypeScript | App Router UI, authenticated routes and streaming client |
| UI | Tailwind CSS + shadcn/ui | Fast, accessible component implementation |
| Motion | Framer Motion | Deliberate UI transitions without making the audit screens distracting |
| Optional 3D | React Three Fiber + Drei | Landing-page-only visual polish after core functionality is complete |
| API | FastAPI + Python | PDF ingestion, local embeddings, retrieval orchestration and agent pipeline |
| Validation | Pydantic (API) + Zod (web boundaries) | Reject malformed model/API payloads before persistence |
| Database/Auth/Storage | Supabase | Postgres persistence, authentication and private document storage |
| Vector store | Pinecone Starter | Contract/source vector retrieval using vectors generated locally |
| Embeddings | sentence-transformers, local CPU model | Avoid paid embedding inference; dimension must match Pinecone index |
| LLM | Gemini through a small provider adapter | Reviewer/Skeptic/Supervisor structured reasoning; model ID stays configurable |
| PDF extraction | PyMuPDF | Page-aware text extraction and source coordinates where available |
| Streaming | Server-Sent Events (SSE) | Stream debate state without WebSocket complexity |
| Reports | Markdown + ReportLab PDF | Reproducible, evidence-backed export |
| Frontend tests | Vitest + Testing Library + Playwright | Unit/component/E2E coverage |
| Backend tests | pytest | Ingestion, retrieval, validation, consensus and failure-path tests |
| Local orchestration | pnpm scripts + Python venv; optional Docker Compose | Clone-and-run development path with minimal magic |

Exact package/model versions must be pinned in the generated app lockfiles. Service plan limits and currently available Gemini model IDs must be checked when credentials are configured; this documentation deliberately does not hard-code a plan promise as fact.

## Open this in Antigravity

Read `START_HERE.md` first. Open the **whole extracted folder** as the workspace. Confirm `.agents/rules/*.md` are active, then give Antigravity `prompts/antigravity-build.md` and ask it to complete **Milestone A only**. Do not paste all documentation into every agent conversation.

## Build priority

Evidence and reliability outrank polish. The order is: foundation → ingestion/retrieval → real agent debate → consensus/escalation → audit UI → evaluation → deployment/demo → optional landing-page 3D.

## Repository target

The documentation assumes the application code will be created as:

```text
apps/web/        # Next.js + TypeScript
apps/api/        # FastAPI + Python
packages/shared/ # shared JSON schemas/types where useful
supabase/        # migrations/policies/seed scripts
scripts/         # local/dev/evaluation helpers
```

This ZIP is a specification pack, not the finished application. Antigravity should generate the application incrementally and update `TASKS.md` as milestones pass.
