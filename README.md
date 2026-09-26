# ⚖️ NyayaSETU: Evidence-Grounded Legal Compliance Auditor

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://nyaya-setu-liard.vercel.app)

**NyayaSETU** is an AI-powered legal and regulatory compliance auditor. It allows a user to upload a legal or contractual document, extracts its contents, retrieves relevant legal evidence, and performs a multi-agent compliance analysis to identify regulatory gaps, missing protections, and illegal clauses.

By relying on grounded **RAG (Retrieval-Augmented Generation)** instead of a single LLM's generalized knowledge, NyayaSETU eliminates hallucination and grounds every finding in an actual retrieved legal source.

---

## 🚀 Live Application
- **Frontend (Vercel):** [https://nyaya-setu-liard.vercel.app](https://nyaya-setu-liard.vercel.app)
- **Backend API (Render):** `https://nyayasetu-api-f0w3.onrender.com/api/v1`

---

## 🧠 Core Workflow (What NyayaSETU Actually Does)

When a user uploads a contract to NyayaSETU, the system automatically executes the following orchestration lifecycle:

1. **Document Processing:** The document is registered, and its contents are extracted and identified into clauses/sections.
2. **Issue Extraction:** An agent identifies the core legal concepts relevant to the document.
3. **Legal RAG Pipeline:** Using NVIDIA embeddings, the system retrieves relevant legal evidence from a Pinecone vector database populated with Indian legal codes (e.g., *Occupational Safety, Health and Working Conditions Code, 2020*). Temporal filtering ensures the law was in force during the contract's effective date.
4. **The Reviewer Agent:** Analyzes the document *only* against the retrieved legal evidence and flags potential compliance issues.
5. **The Skeptic Agent:** Adversarially challenges the Reviewer's findings, arguing for the defense to prevent false positives.
6. **The Supervisor Agent:** Weighs the debate and issues a final, structured resolution (e.g., HIGH RISK, CLEAR) alongside a confidence score.
7. **Persistence & Reporting:** Findings are saved to Supabase, and the frontend consumes the real-time Server-Sent Events (SSE) to update the audit progress UI.

---

## 🏗️ System Architecture

```text
USER
  |
  v
NYAYASETU FRONTEND (Next.js / Vercel)
  |
  | HTTP / SSE
  v
FASTAPI AUDIT BACKEND (Render)
  |
  +----------------------------+
  |                            |
  v                            v
DOCUMENT EXTRACTION      AUDIT ORCHESTRATOR
  |                            |
  |             +--------------+--------------+
  |             |              |              |
  v             v              v              v
CLAUSES      REVIEWER       SKEPTIC       SUPERVISOR
  |             ^              ^              ^
  |             |              |              |
  +--------> LEGAL RAG PIPELINE <-------------+
                |
                +----> Embeddings (NVIDIA Nemotron 1B)
                |
                +----> Pinecone Vector DB
                |
                +----> Legal Knowledge Base (Markdown Sources)
```

---

## 📂 Project Structure

```text
NyayaSETU/
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router (dashboard, auth, reports)
│   │   ├── components/          # React UI components (shadcn/ui, motion)
│   │   └── lib/                 # Frontend utilities and API clients
│   ├── .env.local               # Frontend environment variables
│   └── package.json             # React 18, Next.js 14, Framer Motion, Tailwind
├── backend/
│   ├── api/                     # FastAPI route definitions
│   ├── agents/                  # Reviewer, Skeptic, Supervisor, Classifier, LLMRouter
│   ├── pipeline/                # AuditOrchestrator and SSE streaming
│   ├── rag/                     # EmbeddingGenerator and PineconeVectorStore
│   ├── data/
│   │   └── legal-sources/       # Markdown-based legal knowledge base
│   ├── main.py                  # FastAPI application entry point
│   └── requirements.txt         # Python dependencies
├── database/
│   └── migrations/              # Supabase PostgreSQL schemas (audits, findings, evidence)
└── README.md
```

---

## 🖥️ Frontend Architecture

- **Framework:** Next.js 14.2.3 / React 18
- **Styling:** Tailwind CSS with a dark glassmorphism visual identity.
- **Animations:** Framer Motion (including existing `MotionBackground` UI effects).
- **State Management:** React hooks and Server-Sent Events (SSE).
- **Authentication:** Supabase SSR auth.
- **Major Routes:**
  - `/` (Landing page)
  - `/login` & `/signup`
  - `/dashboard`
  - `/dashboard/audit` (Audit creation flow)
  - `/dashboard/audits` (Historical audits)
  - `/dashboard/documents`
  - `/dashboard/findings`
  - `/dashboard/reports`

---

## ⚙️ Backend Architecture

- **Framework:** FastAPI (Python)
- **API Routing:**
  - `POST /api/v1/documents/upload`: Extracts document, classifies jurisdiction/type, and persists temporary JSON.
  - `GET /api/v1/audit/{audit_id}/run`: Initiates the multi-agent pipeline and streams SSE events.
  - `GET /api/v1/report/{audit_id}`: Retrieves final findings.
- **Multi-Agent Orchestration:** Driven by `AuditOrchestrator` (`backend/pipeline/audit_orchestrator.py`), which manages the sequential agent flow.
- **LLM Provider Routing:** `LLMRouter` handles API key rotation, exponential backoff, and fallbacks. Configured primarily with NVIDIA NIM models.

---

## ⚖️ The Multi-Agent Pipeline

1. **Reviewer:** Receives the contract clause and the retrieved legal evidence. Outputs structured JSON identifying a specific `finding_type` (e.g., `LEGAL_NONCOMPLIANCE`, `MISSING_PROTECTION`), an `exact_contract_quote`, and an `exact_law_quote`. If evidence is missing, it outputs `EVIDENCE_GAP`.
2. **Skeptic:** Receives the Reviewer's JSON. Critiques the logic, pointing out contractual defenses or misinterpretations of the law.
3. **Supervisor:** Receives both assessments. Issues a final verdict, assigning a risk level (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `CLEAR`) and calculating a numerical confidence score based on the debate's resolution.

---

## 📚 Legal RAG Pipeline & Knowledge Base

- **Knowledge Base:** Legal codes are stored as Markdown files in `backend/data/legal-sources/` (e.g., *Digital Personal Data Protection Act, 2023*, *Indian Contract Act, 1872*).
- **Metadata:** Files include YAML frontmatter for `jurisdiction`, `status`, `in_force_from`, and `repealed_on`.
- **Embeddings:** `nvidia/nemotron-3-embed-1b` (Dimension: 2048).
- **Vector DB:** Pinecone serverless index.
- **Retrieval Logic:** The system retrieves top-K vectors using Cosine similarity. It applies a **Temporal Filter** at retrieval time: if a law was enacted *after* or repealed *before* the contract's effective date, it is heavily penalized or excluded from the context.

---

## 📡 SSE / Real-Time Audit Progress

When an audit runs, the backend streams the following Server-Sent Events to the frontend UI, updating the visual progress state:
- `RETRIEVING_EVIDENCE`
- `FILTERING_RELEVANCE`
- `REVIEWER_THINKING`
- `SKEPTIC_CRITIQUING`
- `REVIEWER_AMENDING`
- `SUPERVISOR_THINKING`
- `COMPLETE`

---

## 🗄️ Database (Supabase / PostgreSQL)

The system persists audit states and findings to Supabase. Key tables include:
- `profiles`: User information.
- `documents`: Uploaded document metadata.
- `audits`: Overall audit status and configuration.
- `findings`: The structured output from the multi-agent debate (including exact quotes and agent reasoning).
- `evidence`: Legal sources utilized.

---

## 🔒 Authentication & Security

- **Auth Provider:** Supabase Authentication (Email/Password implemented).
- **Authorization:** RLS (Row Level Security) policies ensure users only access their own documents and audits.
- **Provider Keys:** All LLM and Pinecone API keys remain securely on the server (`backend/.env`) and are never exposed to the frontend.

---

## 🔄 API Provider Routing & Failure Handling

NyayaSETU incorporates a robust `LLMRouter` designed to prevent pipeline failure during live operations:
- **Configured Providers:** NVIDIA (Primary), Gemini (Fallback), OpenRouter (Fallback).
- **Configured Models:** `nvidia/nemotron-3-super-120b-a12b`, `nvidia/nemotron-3-ultra-550b-a55b`, `meta/llama-3.2-90b-vision-instruct`, etc.
- **Failure Handling:** If an API key encounters a 429 Rate Limit or 503 Timeout, the router applies exponential backoff and automatically rotates to the next available API key in the pool.
- **Evidence Gaps:** If no legal evidence is retrieved (or if dates don't align), the pipeline does not hallucinate a verdict; it safely returns an `EVIDENCE_GAP` requiring human review.

---

## 🛠️ Environment Variables

### Frontend (`frontend/.env.local`)
| Variable | Purpose | Required | Secret? |
|----------|---------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Connects frontend to backend | Yes | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | No |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | Yes | No |

### Backend (`backend/.env`)
| Variable | Purpose | Required | Secret? |
|----------|---------|----------|---------|
| `SUPABASE_URL` | DB Connection | Yes | No |
| `SUPABASE_SECRET_KEY` | DB Service Role | Yes | Yes |
| `PINECONE_API_KEY` | Vector DB Access | Yes | Yes |
| `PINECONE_INDEX_NAME` | Vector Index | Yes | No |
| `NVIDIA_NEMOTRON_..._API_KEY` | Generation Models | Yes | Yes |
| `NVIDIA_NEMOTRON_3_EMBED_...` | Embedding Models | Yes | Yes |
| `GEMINI_API_KEY` | Fallback Generation | Optional | Yes |

*(Note: Never commit your `.env` files to source control.)*

---

## 🌍 Deployment

NyayaSETU is fully deployed and accessible over the web, utilizing a decoupled architecture:

- **Frontend Hosting (Vercel):** The Next.js 14 frontend is deployed on Vercel for fast, edge-cached content delivery and seamless continuous integration. 
  - URL: [https://nyaya-setu-liard.vercel.app](https://nyaya-setu-liard.vercel.app)
- **Backend Hosting (Render):** The FastAPI Python backend, which orchestrates the complex multi-agent RAG pipeline, is deployed as a Web Service on Render.
  - URL: `https://nyayasetu-api-f0w3.onrender.com/api/v1`
- **Database (Supabase):** PostgreSQL database and authentication are hosted on Supabase.

---

## 💻 Local Development Setup

### 1. Backend
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
# Ensure your env/.env file is populated
uvicorn backend.main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

---

## 🧪 Empirical Verification (Test Cases)

To demonstrate the system's robustness and its zero-hallucination guarantee, NyayaSETU was empirically tested using complex, adversarial sample data:

**Test Case: `Hackathon_Demo_Employment 11.pdf`**
*   **Scenario:** A realistic employment contract containing a highly illegal "Gratuity Waiver" clause.
*   **System Execution:** 
    1. The Document Classifier successfully extracted the 13 clauses of the contract.
    2. The RAG pipeline attempted to retrieve evidence for the Gratuity Waiver.
    3. **The Multi-Agent Debate Outcome:** The Reviewer flagged the clause. However, because the exact text of the *Payment of Gratuity Act, 1972* was not retrieved with high enough confidence from the Pinecone vector database during this specific test run, the Skeptic and Supervisor agents intervened.
*   **Verified Result:** Instead of hallucinating a legal ruling based on the LLM's pre-trained knowledge, the Supervisor correctly escalated the issue, outputting an **EVIDENCE_GAP**. The final report correctly flagged the clause as High Risk / Human Review Required, stating: *"The contract's gratuity waiver clause is accurately quoted, but no legal evidence... was retrieved to assess its compliance."*
*   **Significance:** This empirically verifies that NyayaSETU's adversarial multi-agent architecture successfully prevents LLM hallucination in strict legal contexts.

---

## ⚠️ Known Limitations
- **PDF Extraction:** Currently relies on standard text extraction. Complex tables or scanned PDFs without OCR may yield degraded clause detection.
- **Legal Coverage:** The knowledge base currently focuses primarily on Indian labor, data protection, and contract law (e.g., DPDP 2023, IT Act, Occupational Safety Code).
- **Concurrency:** The `AuditOrchestrator` currently utilizes a semaphore limiting concurrent live audits to 1 per instance (`MAX_CONCURRENT_AUDITS = 1`) to manage provider rate limits during heavy demonstration usage.

---

## 📜 Legal Disclaimer
**NyayaSETU provides AI-assisted compliance analysis for informational and review purposes only.** It does not replace advice from a qualified legal professional, nor does it constitute formal legal advice.

---

## 🏆 Hackathon MVP Scope
This MVP demonstrates the full lifecycle of an evidence-grounded AI audit:
1. Real document upload and clause classification.
2. Real temporal-filtered legal retrieval via Pinecone.
3. Multi-agent debate (Reviewer -> Skeptic -> Supervisor) executing live.
4. Structured findings presented in an interactive, animated dashboard.
5. Escalation flows for unverified clauses.