# Start Here — NyayaSETU in Antigravity

## 1. Open the correct workspace

Extract the ZIP and open the **`NyayaSETU-Antigravity-Build-Pack` folder itself** in Antigravity. Do not open only `docs/`. The project display name is **NyayaSETU** and package/path identifiers should use `nyayasetu`.

## 2. Activate the workspace rules

This pack uses:

- `.agents/rules/00-project.md`
- `.agents/rules/01-engineering.md`
- `.agents/rules/02-audit-integrity.md`

The supplied reference says current Antigravity workspace rules live in `.agents/rules/` and that an older `.agent/rules/` layout may also be supported. In your installed Antigravity version, open its Rules/Customizations UI and verify that these three rules are recognized. If your installation expects a different generated rule location, copy the **content** through Antigravity's own workspace-rule command rather than maintaining two competing rule sets.

## 3. Read only the first-session context

Read these files before the first build request:

- `README.md`
- `docs/01-product-scope.md`
- `docs/02-free-stack.md`
- `docs/03-architecture.md`
- `docs/10-data-api-contracts.md`
- `docs/11-security-privacy.md`
- `TASKS.md`

Then paste `prompts/antigravity-build.md` into Antigravity and ask it to implement **Milestone A only**.

## 4. Configure credentials only after the scaffold exists

Copy `.env.example` to your local environment files and fill only the services you actually use. Never commit secrets. The proposed stack expects:

- Supabase project URL and keys.
- Pinecone API key, index host/name and a vector dimension matching the local embedding model.
- Gemini API key and a currently accessible text model ID.
- Optional OAuth credentials if you add Google sign-in.

Antigravity's own coding access is separate from API quota for the NyayaSETU application.

## 5. Context by milestone

- Ingestion/retrieval: `docs/04-knowledge-base.md`, `05-ingestion-embeddings.md`, `06-retrieval-citations.md`.
- Agent pipeline: `docs/07-agent-orchestration.md`, `08-consensus-escalation.md`, `09-findings-policy-remediation.md`, plus `prompts/reviewer.md`, `skeptic.md`, `supervisor.md`.
- Frontend: `docs/12-ui-routes.md`, `13-design-motion.md`, `14-jobs-quotas-observability.md`.
- Verification/release: `docs/15-deployment.md`, `16-evaluation-tests.md`, `17-build-plan-demo.md`, `runbooks/release-check.md`.

Do not attach all Markdown files to every prompt. Smaller, milestone-specific context makes the coding agent less likely to mix requirements.

## Completion standard

A screen is not complete because it renders. The minimum credible product persists audits, extracts real uploaded PDF text, retrieves traceable evidence, runs distinct agent roles, records debate turns, applies consensus/escalation rules, highlights citations and exports a report. Unsupported legal conclusions must not be presented as settled results.
