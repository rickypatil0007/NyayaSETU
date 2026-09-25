# Antigravity Build Prompt — NyayaSETU

You are the lead full-stack engineer implementing **NyayaSETU** from the specification files in this workspace. This is a real evidence-first multi-agent compliance audit web application, not a static mockup.

First read: `README.md`, `.agents/rules/*.md`, `docs/01-product-scope.md`, `docs/02-free-stack.md`, `docs/03-architecture.md`, `docs/10-data-api-contracts.md`, `docs/11-security-privacy.md`, and `TASKS.md`.

## Your task now

Implement **Milestone A only** from `TASKS.md`.

### Requirements

1. Scaffold `apps/web` with Next.js + TypeScript and `apps/api` with FastAPI + Python.
2. Establish the monorepo scripts and lockfiles needed for reproducible development.
3. Add Supabase auth/server client boundaries and initial database migrations for profiles, audits and audit events.
4. Implement sign-in/sign-out, protected dashboard and authenticated audit creation/list/detail retrieval.
5. Apply ownership isolation. The browser must never submit a trusted `owner_id`.
6. Add local configuration based on `.env.example` without adding any secret values.
7. Add tests for auth guards/data ownership and the audit CRUD happy path where feasible without live external APIs.
8. Do not implement document ingestion, vector search, agents or decorative 3D yet.

## Completion behavior

Run the relevant install/build/lint/type/test commands. Fix errors you introduce. Update `TASKS.md` only for checks that actually pass. Then summarize:

- files created/changed;
- commands run and result;
- how to start web/API locally;
- migrations/settings the user must apply;
- missing credentials or blockers;
- next milestone, but **do not start it**.

If a specification conflicts with the actual installed tool/runtime, prefer a small compatible change, explain it and preserve the product/security invariants.
