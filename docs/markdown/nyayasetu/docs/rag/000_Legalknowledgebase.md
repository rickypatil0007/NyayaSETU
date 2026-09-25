# NyaySetu — Legal Knowledge Base Source List

Every link below was checked by web search on 13 Sep 2026. Nothing here is invented — where I couldn't verify an official PDF, I've said so instead of guessing a URL.

---

## 1. Master repository (use this as your primary source, not a scattered list)

**India Code** — the Ministry of Law & Justice / NIC's official digital repository of all Central and State Acts, Rules, Regulations, Notifications, Circulars, and Ordinances.
`https://www.indiacode.nic.in/`

Direct-download PDFs on India Code follow a `bitstream` URL pattern once you find an Act's "handle" page — this is the cleanest single ingestion source because every entry already carries the metadata fields your spec wants (`source_id`, `title`, `authority`, `enactment_date`, `act_number`), so your ingestion script can scrape it consistently instead of writing one-off parsers per ministry website.

---

## 2. Verified Central Acts (Companies / Contract / Startup-relevant)

| Act | Category | Authority | Official Source |
|---|---|---|---|
| Indian Contract Act, 1872 | Contract Law | Ministry of Law & Justice | `https://lddashboard.legislative.gov.in/actsofparliamentfromtheyear/indian-contract-act-1872` (official gazette copy also at `https://www.cag.gov.in/uploads/media/Indian-Contract-Act-1872-20200816140128.pdf`) |
| Companies Act, 2013 | Corporate Governance | Ministry of Corporate Affairs (MCA) | `https://www.mca.gov.in/content/mca/global/en/acts-rules/companies-act.html` (hub page — MCA publishes a consolidated e-book PDF here, updated periodically) |
| Digital Personal Data Protection Act, 2023 | Privacy / Data Protection | MeitY | `https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf` |
| Information Technology Act, 2000 (original) | Cybersecurity / E-commerce | MeitY | `https://www.meity.gov.in/static/uploads/2024/03/ITbill_2000.pdf` |
| IT Act, 2000 (consolidated, amended to 2023) | Cybersecurity | WIPO Lex (mirrors official text) | `https://www.wipo.int/edocs/lexdocs/laws/en/in/in024en.pdf` |
| Consumer Protection Act, 2019 | Consumer Rights | Dept. of Consumer Affairs | `https://www.indiacode.nic.in/bitstream/123456789/12808/1/the_consumer_protection_act,_2019_no._35_of_2019_date_09.08.2019.pdf` |
| Competition Act, 2002 | Antitrust | Ministry of Corporate Affairs | `https://www.indiacode.nic.in/handle/123456789/2010?locale=en` (handle page — download link on page) |
| Arbitration and Conciliation Act, 1996 | Dispute Resolution | Ministry of Law & Justice | `https://www.indiacode.nic.in/bitstream/123456789/1978/1/a199626.pdf` |
| Central Goods and Services Tax Act, 2017 | Tax / GST | CBIC | `https://cbic-gst.gov.in/pdf/CGST-Act-Updated-31082021.pdf` (CBIC periodically re-publishes updated consolidations at `cbic-gst.gov.in` — check for a newer snapshot before you ingest) |
| Code on Wages, 2019 | Labour | Ministry of Labour & Employment | `https://www.labour.gov.in/static/uploads/2025/06/c328da14bbb15fc4ad571dc33e7a4ab3.pdf` |
| Micro, Small and Medium Enterprises Development Act, 2006 | MSME | Ministry of MSME | `https://www.indiacode.nic.in/bitstream/123456789/7769/1/micro7.pdf` |

## 3. Acts I did NOT verify a direct PDF for — go straight to the regulator, don't trust a random blog

These matter for a startup-contract auditor but I'm not going to hand you a guessed link:
- **Industrial Relations Code, 2020 / Code on Social Security, 2020 / OSH Code, 2020** — the other three labour codes. Source from `labour.gov.in`.
- **FEMA, 1999** (needed if any audited contract involves foreign investment/ESOPs for foreign nationals) — source from `rbi.org.in` or `indiacode.nic.in`.
- **SEBI (LODR) Regulations, 2015** and other SEBI regulations (relevant if the startup is fundraising via listed instruments) — source from `sebi.gov.in`.
- **Trade Marks Act 1999 / Copyright Act 1957 / Patents Act 1970** (IP clauses in founder/vendor agreements) — source from `indiacode.nic.in`.
- **Specific Relief Act, 1963** (specific performance/injunction clauses) — source from `indiacode.nic.in`.
- **IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021** — needed alongside the IT Act for any platform/marketplace contract. Source from `meity.gov.in`.
- **DPIIT Startup India notifications / recognition criteria** — source from `dpiit.gov.in` / `startupindia.gov.in`.

Treat section 3 as your next research pass, not a gap you paper over with placeholder text.

---

## 4. Existing open-source Indian legal AI (don't rebuild what's already built)

- **OpenNyAI** — the most credible open-source Indian legal-AI initiative (funded by EkStep Foundation). Org: `https://github.com/OpenNyAI`
  - `Opennyai` — NLP pipeline for Indian legal documents (NER, rhetorical-role labelling, summarization) — useful for your document-processing stage.
  - `aalap_legal_llm` — a Mistral-7B model instruction-tuned specifically for Indian paralegal tasks; training/eval code and prompts included.
  - `Jugalbandi-Manager` — a full conversational AI platform architecture you can study for orchestration patterns.
- **Curated list**: `https://github.com/Vaquill-AI/awesome-legaltech` — catalogs the above plus other jurisdictions' legal NLP tools.

## 5. Existing contract-RAG pipelines with actual `prompts/` folders (paste-and-adapt, not paste-and-run)

These are from a well-known "Contract Advisor RAG" challenge (10 Academy) — several public forks, all with a real `prompts/` directory of contract-Q&A prompt templates you can open directly:
- `https://github.com/eyaya/High-Precision-Contract-Advisor-RAG`
- `https://github.com/temesgen5335/Legal_Expert_Contract_Advisor_RAG`
- `https://github.com/aronsinkie/Contract-Advisor-RAG-Towards-Building-A-High-Precision-Legal-Expert-LLM-APP`

Also: `https://github.com/Ojas1584/Contract_Analysis` — clause-extraction prompts (termination/confidentiality/liability) tested on the CUAD dataset, closer to your "clause identification" stage than to full Q&A.

**Important limitation**: every one of these is a single-agent Q&A prompt, not an adversarial Reviewer→Skeptic→Supervisor system. You cannot paste these in as your debate engine — they're useful for the retrieval + clause-extraction stages only.

## 6. Existing multi-agent debate prompt architectures (this is the closer match to PS05)

- `https://github.com/thunlp/ChatEval` — the reference implementation for "ChatEval: Towards Better LLM-based Evaluators through Multi-Agent Debate" (published, well-cited). It runs configurable multi-role debate (a general-role critic questions another role's judgment, roles are YAML-configured) — structurally the closest open thing to Reviewer↔Skeptic↔Supervisor, just built for evaluating text quality rather than legal compliance. Re-purpose the role definitions, not the domain content.
- `https://github.com/mjsushanth/Multi_Agent_LLM_Debater` — a modular debate framework with a real `prompts/` folder implementing formal opening/rebuttal/closing rounds and an adversarial critique step. Closer to your debate-trace UI concept than ChatEval is.
- Academic appendices with full, citable (not fabricated) prompt text you can adapt: arXiv 2308.07201 (ChatEval paper), arXiv 2606.10296 ("The Confident Liar" — Constructor/Auditor/Synthesizer roles map almost directly onto Reviewer/Skeptic/Supervisor), arXiv 2604.02460 (Debater/Critic/Aggregator prompts). Pull these papers' appendices, not just the GitHub code, when you're writing your own agent prompts — the papers explain *why* each instruction is there, which you'll need to defend your prompt-engineering choices to judges.

None of this is a plug-in replacement for PS05's specific requirement (legal-domain skepticism: jurisdiction mismatch, outdated authority, overstatement). You'll still write the domain-specific challenge criteria yourself — these repos give you the orchestration scaffolding, not the legal judgment.

---

## 7. How to actually get this into Antigravity

Two different jobs are hiding inside "paste it into Antigravity" — keep them separate or you'll build the wrong thing:

**Job A — Antigravity as your coding agent (one-time, dev-time context)**
Antigravity reads text/markdown well via `@file` or `@folder` mentions in the agent panel, or as a workspace Knowledge Item — it does not parse a raw PDF's layout meaningfully, it just extracts whatever text layer the PDF happens to expose. So:
1. Extract each Act's text to `.md` or `.txt` (your own `pdf` skill/`pdfplumber`/`PyMuPDF`, not Antigravity itself).
2. Drop them under something like `docs/legal-sources/<act-name>.md` in your repo.
3. `@mention` that folder when you ask Antigravity to write your ingestion script, so it writes correct chunking/section-detection logic against real section numbering instead of guessing.
4. Optionally save durable facts ("DPDP Act sections relevant to Data Fiduciary obligations are 8–10") as a workspace Knowledge Item so future Antigravity sessions don't re-derive it.

**Job B — Your actual product's knowledge base (runtime, what the app queries)**
This is NOT Antigravity's job at all — it's your own ingestion pipeline exactly as your spec already describes: extract → clean → detect sections → chunk → Hugging Face/Pinecone-Starter embeddings → index → validate → publish. Antigravity should *write and run* that pipeline for you (as code), but the PDFs themselves go through your pipeline into Pinecone, not into the IDE's context window. If you skip building that pipeline and just rely on what you pasted into Antigravity, your live app has no RAG at query time — Antigravity's context doesn't persist into your deployed backend.