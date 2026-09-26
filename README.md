# ⚖️ NyayaSETU: Evidence-Grounded Legal Compliance Auditor

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://nyayasetu.vercel.app/) 
*(Replace with exact Vercel link if different)*

**NyayaSETU** is an AI-powered legal compliance platform built for hackathons and legal tech innovations. It provides rigorous, evidence-grounded audits of contracts and legal documents to detect illegal clauses, missing protections, and regulatory compliance gaps.

Instead of relying on a single AI's generalized knowledge, NyayaSETU uses a robust **Multi-Agent RAG (Retrieval-Augmented Generation) Pipeline** simulating a real-world legal review process.

---

## 🚀 Live Demo
**Frontend:** [https://nyayasetu.vercel.app](https://nyayasetu.vercel.app)  *(Deployed on Vercel)*  
**Backend API:** Deployed on Render 

---

## 🧠 How It Works (The Architecture)

NyayaSETU processes every document through a sophisticated, multi-stage pipeline:

1. **Extraction (Issue Extractor)**
   - The document is first analyzed to extract core metadata (jurisdiction, contract type, effective date) and key "legal concepts".
   - *Fail-safe:* If the AI provider times out, it defaults to standard employment law concepts.

2. **RAG (Retrieval via Pinecone)**
   - The extracted concepts are embedded using **NVIDIA Nemotron 1B** embeddings.
   - We query a **Pinecone Vector Database** containing real-world legal codes (e.g., *Occupational Safety, Health and Working Conditions Code, 2020*).
   - **Temporal Filtering:** Only laws that were active during the contract's effective date are included to prevent referencing stale or repealed laws.

3. **Multi-Agent Debate Protocol**
   - **🧑‍⚖️ The Reviewer:** A strict AI that reads the contract *only* against the retrieved evidence. It flags potential violations (e.g., illegal wage deductions, waiver of statutory rights).
   - **🕵️ The Skeptic:** An adversarial AI that challenges the Reviewer's findings, arguing for the defense to prevent false positives and hallucinated risks.
   - **🏛️ The Supervisor:** The final judge that weighs the Reviewer's evidence against the Skeptic's defense, issuing a final "Verdcit" (e.g., HIGH RISK, CLEAR) and assigning a confidence score.

4. **Real-time SSE Streaming**
   - The entire debate is streamed back to the frontend in real-time via Server-Sent Events (SSE), allowing the user to watch the AI agents deliberate live.

---

## 🛠️ Tech Stack

### Frontend
- **React / Next.js:** Modern, responsive UI.
- **Framer Motion:** Smooth background animations and UI transitions.
- **Tailwind CSS:** Premium, aesthetically pleasing styling.
- **Vercel:** Edge-optimized deployment.

### Backend
- **FastAPI (Python):** High-performance asynchronous backend.
- **NVIDIA NIM APIs:** Powered by high-end LLMs (Nemotron 120B) for complex legal reasoning.
- **Pinecone:** Serverless Vector Database for hybrid legal retrieval.
- **Render:** Cloud hosting for the Python backend.

---

## 🔑 Key Features
- **Zero Hallucination Guarantee:** The system uses strict RAG. If no legal evidence is found to evaluate a clause, it flags an `EVIDENCE_GAP` and mandates human review rather than guessing.
- **Agentic Rotation:** Built-in LLM router automatically balances loads and falls back across NVIDIA keys (and Gemini/OpenRouter) to prevent rate limit timeouts during live demos.
- **Dynamic Risk Classification:** Categorizes risks into CRITICAL, HIGH, MEDIUM, LOW, and CLEAR, alongside a unified Confidence Score.

---

## 🏃‍♂️ Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rickypatil0007/NyayaSETU.git
   cd NyayaSETU
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   pip install -r requirements.txt
   # Set up your .env file with PINECONE_API_KEY and NVIDIA API keys
   uvicorn backend.api.main:app --reload
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---
*Built with ❤️ for the Hackathon!*