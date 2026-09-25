# Start in Antigravity

## What to open

Open the extracted `niyai-setu` folder itself. This is the workspace root; do not open only `docs/`. If you already have an application, copy these specifications into a separate branch and preserve the working code and lockfiles. The project name used here is **NiyAI Setu**; use `niyai-setu` for paths and package identifiers.

## Load the rules correctly

Current official Antigravity documentation places workspace rules in `.agents/rules/`; the older `.agent/rules/` form remains supported. The supplied directory has `.agents/rules/00-project.md`, `01-engineering.md`, and `02-audit-integrity.md`. Open Customizations → Rules and confirm the files are recognized; set them to Always On for this small project. If your installed IDE uses the older location, use its Create Workspace Rule control and copy the rule text there, preserving any metadata it generates. Do not maintain competing copies.

`docs/`, `prompts/`, and `runbooks/` are ordinary Markdown context, not automatically executing instructions. Attach or reference the relevant files for each milestone. `TASKS.md` is a manual progress ledger. You do not need to invent special framework filenames or install extra coding-agent services.

## First session

Read `README.md`, `docs/01-product-scope.md`, `docs/02-free-stack.md`, `docs/03-architecture.md`, `docs/10-data-api-contracts.md`, and `TASKS.md`. Paste the content of `prompts/antigravity-build.md` into Antigravity. Ask it to complete Milestone A only, run its checks, and summarize the changes and missing credentials.

Do not paste all documents into every conversation. For retrieval work attach docs 04–06; for agents attach docs 07–09 and the three runtime prompts; for the frontend attach docs 12–14. Use `runbooks/build-milestone.md` for subsequent sessions.

## Credentials you will configure yourself

- A Pinecone **Starter** key and externally generated-vector index; no paid inference needed.
- A Gemini API key from a project verified to be on the free tier, with an accessible text model.
- A Supabase Free project; its public client key may be browser-visible, its secret/service-role key must stay server-side.
- OAuth credentials if using Google sign-in. Antigravity's coding allowance is separate from your app's Gemini API quota.
- No Hugging Face token is required for downloading the chosen public embedding model. Cache the model before demonstrating.

Copy `.env.example` to local configuration only after reviewing its comments. It contains blanks and proposed defaults, not working secrets. Python and Next.js should each read only their own relevant settings. Provider account setup is a prerequisite; setting `FREE_ONLY=true` cannot itself prove an account is unbilled.

## Completion standard

The first working milestone ends with authenticated creation and retrieval of an audit record. Subsequent milestones add extraction, retrieval, real agent debate, evidence validation, exports, and the animated landing page. Screens without functioning routes and persistence do not meet the brief. Keep the human operator responsible for checking source metadata and approving corpus entries.

Documentation: [Antigravity rules](https://antigravity.google/docs/rules-workflows/). Optional runbooks can be registered in the IDE's Workflows panel, but ordinary referenced Markdown is sufficient for this pack.
