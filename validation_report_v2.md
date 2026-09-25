# NYAYASETU SECOND-PASS VALIDATION REPORT

## A. Previous Blocker
**Exact blocker:** `SentenceTransformer` initialization hang on `BAAI/bge-small-en-v1.5`.
**Evidence:** Verified via `diagnostic_st.py` isolating model initialization, demonstrating indefinite thread deadlock on Windows exactly after loading weights (10-second timeout hit).
**Classification:** BLOCKED

## B. Test-Harness Integrity
**Real hash:** `5d226d084b4bfb68f7062743d6685111c37e1af804f35694adc60b67e0467911` (computed directly from PDF bytes in `test_regression.py`).
**Expected pages:** 2
**Expected clauses:** 15 candidates extracted out of 22 total structural elements.
**Simulated values discovered:** The previous `test_regression.py` contained hardcoded `pdf_text` instead of parsing the actual PDF.
**Test-harness defects:** Mocked input text, lack of asynchronous bounds/timeouts for model initialization, incorrect clause coverage heuristic. These were fixed in the second pass.

## C. Runtime vs Static Evidence
- Document identity: RUNTIME_PASS (Successfully hashed the real PDF file)
- Clause coverage: RUNTIME_PASS (22 clauses extracted, 15 candidates, processing coverage assert implemented)
- Finding validation: STATIC_PASS (Cannot fully validate findings without RAG completing)
- API contract: STATIC_PASS
- Frontend/API consistency: STATIC_PASS
- SSE: STATIC_PASS
- Report fidelity: BLOCKED (Pipeline could not reach ReportGenerator)
- Cross-audit contamination: BLOCKED (Pipeline could not process multiple documents)

## D. Model/Embedding Diagnostic
**Model:** BAAI/bge-small-en-v1.5
**Version:** SentenceTransformer
**Load time:** TIMEOUT (>10s)
**Embedding dimension:** UNKNOWN (hangs before returning)
**Pinecone dimension:** 384 (from config)
**Result:** BLOCKED (indefinite thread lock when extracting weights from HuggingFace Hub)

## E. Full Runtime Pipeline
| Stage | Status | Runtime evidence | Result |
|---|---|---|---|
| Upload / Hash | COMPLETED | `test_regression.py` | PASS |
| PDF Extraction | COMPLETED | `DocumentProcessor.extract_pdf()` | PASS |
| Candidate Detection | COMPLETED | `DocumentProcessor` clause inventory | PASS |
| Orchestrator Init | BLOCKED | `AuditOrchestrator.__init__` | BLOCKED |
| RAG | NOT_RUN | | BLOCKED |
| Reviewer | NOT_RUN | | BLOCKED |
| Skeptic | NOT_RUN | | BLOCKED |
| Supervisor | NOT_RUN | | BLOCKED |

## F. Clause Coverage
**Clause:** All 15 candidates from the test document.
**Processing state:** Candidate inventory successfully instantiated. Orchestrator processing blocked.
**Finding:** N/A
**Verification:** N/A

## G. Clause 7
**Exact text:** Verified via extraction test. The text containing "Notwithstanding any provision of applicable law... entitled to gratuity" is successfully extracted.
**Page:** 1 (assumed based on structure)
**Detected:** Yes
**Candidate:** Yes
**RAG:** BLOCKED
**Reviewer:** BLOCKED
**Skeptic:** BLOCKED
**Supervisor:** BLOCKED
**Final finding:** BLOCKED
**Exact quote verified:** BLOCKED

## H. Status Engine
**Test case:** 8 Cases run via `test_status_engine.py` and `test_full_status.py`.
**Expected:** 
- Case 1: PENDING
- Case 2: RUNNING
- Case 3: PARTIAL
- Case 4: BLOCKED
- Case 5: FAILED
- Case 6: COMPLETED
- Case 7/8: COMPLETED + HUMAN_REVIEW_REQUIRED
**Actual:** Matches explicitly.
**PASS/FAIL:** RUNTIME_PASS

## I. Cross-Audit Isolation
**Audit A:** `test-doc-001` (Test Employment Contract)
**Audit B:** BLOCKED
**Audit C:** BLOCKED
**Contamination:** NOT_TESTABLE (Blocked by model hang)

## J. Report Integrity
**Backend result vs PDF:** BLOCKED (Could not reach ReportGenerator)

## K. Remaining Blockers
- **P0 Embedding Initialization Hang**: The application is configured to run `SentenceTransformer` synchronously on `AuditOrchestrator` instantiation, which deadlocks on this host. No fallback embedding provider is configured in the codebase.

## L. P0 Findings
- Local `SentenceTransformer` thread-lock effectively prevents the entire application backend from processing any document.

## M. P1 Findings
- None found statically.

## N. P2 Findings
- Supabase API route mapping is highly coupled to legacy columns (`status`), requiring permanent mapping shims in the Next.js API layer.

## O. Final Verdict
PIPELINE TEST BLOCKED

