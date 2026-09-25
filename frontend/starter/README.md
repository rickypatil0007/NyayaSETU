# NyayaSetu

AI-powered legal/regulatory compliance audit for startup contracts. Built for
the Orchestrate AI Build Challenge — PS05, Multi-Agent Legal/Regulatory
Compliance Auditor.

## What it does

Upload a contract → a **Reviewer** agent flags compliance concerns against a
curated set of Indian regulations → a **Skeptic** agent challenges each
concern → a **Supervisor** agent rules on the debate (upheld / dismissed /
escalated to human review). Every finding carries a citation back to the
regulation excerpt it's grounded in.

## Architecture (deliberately minimal)

```
lib/agents/
  orchestrator.ts   agentic state machine — the compulsory pipeline
  reviewer.ts        raises findings, grounded in retrieved regulation text
  skeptic.ts         challenges each finding
  supervisor.ts      verdict: upheld / dismissed / escalated
  escalation.ts      writes unresolved findings to a human-review queue
  prompts.ts         shared prompt templates (grounding rules baked in)
  types.ts

lib/llm/provider.ts  Groq primary, Gemini fallback — free tier only
lib/rag/pinecone.ts  Pinecone free Starter plan, integrated embeddings
lib/rag/ingest.ts    paragraph-chunks the seed regulations, upserts them
lib/supabase/        client + schema (audits, findings, escalations)

app/
  audit/new           paste a contract, kicks off a run
  audit/[id]          findings + citations + verdicts
  api/audits/...      create / fetch / run
```

**Debate rounds are capped at 2** (`MAX_ROUNDS` in `orchestrator.ts`). This is
a deliberate rate-limit and demo-latency guard, not an oversight — every round
is 2 more LLM calls per finding, and this whole pipeline runs on free-tier
APIs with real rate limits.

## What was cut, on purpose

The original spec had 200+ doc files covering a full ingestion pipeline (OCR,
legal structure detection), a LoRA/QLoRA fine-tuning pipeline, hybrid
retrieval + reranking, full audit trails, disaster recovery runbooks, etc.
None of that ships a working demo in 9 days. This build keeps only what
directly earns rubric points: the multi-agent debate loop, grounded citations,
one working end-to-end path, and a clean UI. Add the rest back later if the
project continues past the hackathon.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in free-tier keys (Groq,
   Gemini, Pinecone, Supabase — see comments in `.env.example` for where to
   get each one).
3. Create the Pinecone index with an **integrated embedding model** attached
   (Pinecone dashboard → Create Index → choose an embedding model) so no
   separate embeddings API is needed.
4. Run the Supabase schema: paste `lib/supabase/schema.sql` into the Supabase
   SQL editor.
5. Seed the regulation set: `npm run ingest`
6. `npm run dev` and open `/audit/new`

## Known risk for demo day

Judges clone and run this themselves on free-tier APIs. If Groq or Gemini
rate-limits mid-evaluation, a live run can fail. Consider recording a backup
terminal trace of a successful run as a fallback for the demo video, per the
submission rules (backend/terminal traces required).
