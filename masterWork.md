Yes. For NyaySetu, I would now freeze the application around one master product flow and treat it as the single source of truth for your frontend, backend, database, RAG system, agents, UI, and demo.

The central principle is:

NyaySetu is not an AI legal chatbot. It is an evidence-grounded, multi-agent legal/regulatory compliance audit workspace.

That distinction matters because the official PS05 asks for a Reviewer Agent, a Skeptic Agent, and a Supervisor that forces structured debate, with human escalation when consensus is not clear. The evaluation also explicitly rewards load-bearing AI, custom prompting, structured multi-agent logic, tool chaining, fallback safety routing, and robustness.

Below is the master application specification I would use as the foundation of the project.

NYAYSETU — MASTER APPLICATION SPECIFICATION
1. Product Identity
Product name

NyaySetu

Product category

AI-powered Legal & Regulatory Compliance Auditor

Primary user

For the hackathon MVP:

Startup founders
Startup legal/operations teams
Small businesses
Individual legal/contract reviewers
Law students/legal researchers demonstrating the workflow
Human legal advisors receiving escalations
Core value proposition

A user uploads a business/legal document, selects the applicable jurisdiction and audit scope, and NyaySetu:

extracts and understands the document,
retrieves relevant legal/regulatory evidence,
identifies potentially problematic clauses,
analyzes them through a Reviewer Agent,
challenges those findings through a Skeptic Agent,
resolves the debate through a Supervisor Agent,
calculates risk and confidence,
provides source-backed findings,
escalates uncertain cases to human legal review,
generates a professional compliance report.
What NyaySetu must NOT present itself as

It should not claim:

"NyaySetu provides legal advice."

Instead:

"NyaySetu provides AI-assisted compliance analysis and evidence-grounded findings for human review."

Every major page should reinforce that it is an audit/review system, not a lawyer replacement.

2. MASTER USER JOURNEY

The complete journey is:

LANDING PAGE
      ↓
ABOUT / HOW IT WORKS
      ↓
LOGIN / SIGN UP
      ↓
ONBOARDING
      ↓
DASHBOARD
      ↓
CREATE NEW AUDIT
      ↓
UPLOAD DOCUMENT
      ↓
DOCUMENT PROCESSING
      ↓
AUDIT CONFIGURATION
      ↓
KNOWLEDGE + RAG RETRIEVAL
      ↓
CLAUSE IDENTIFICATION
      ↓
REVIEWER AGENT
      ↓
SKEPTIC AGENT
      ↓
SUPERVISOR AGENT
      ↓
RISK + CONFIDENCE ENGINE
      ↓
FINDINGS
      ↓
EVIDENCE
      ↓
DEBATE TRACE
      ↓
HUMAN ESCALATION, IF REQUIRED
      ↓
FINAL REPORT
      ↓
SAVE AUDIT
      ↓
AUDIT HISTORY
      ↓
REOPEN / COMPARE / EXPORT

That is your golden path.

Everything else is secondary.

3. GLOBAL PRODUCT STRUCTURE

The authenticated application should use the following core navigation:

┌───────────────────────────────────────────────┐
│ NyaySetu                                      │
├───────────────────────────────────────────────┤
│                                               │
│ Dashboard                                     │
│ Audits                                        │
│ Documents                                     │
│ Knowledge Base                                │
│ Findings                                      │
│ Reports                                       │
│                                               │
│ ────────────────────────────────────────────  │
│                                               │
│ Tasks / Review Queue                          │
│ Saved Evidence                                │
│ Clause Library                                │
│                                               │
│ ────────────────────────────────────────────  │
│                                               │
│ Settings                                      │
│ Security & Activity                           │
│ Help                                          │
│                                               │
└───────────────────────────────────────────────┘

For your hackathon MVP, the most important items are:

Dashboard
Audits
Documents
Knowledge Base
Reports
Settings

The others can be progressively introduced where useful rather than making the navigation overwhelming.

4. LANDING PAGE

The landing page must immediately communicate:

What is this?

Who is it for?

What does it actually do?

It should not look like a generic AI SaaS landing page.

Avoid:

"AI-powered future of legal intelligence."

That sounds generic.

Instead communicate the workflow.

4.1 Hero section
Left side

Large headline:

Audit contracts with evidence, not assumptions.

Subheading:

NyaySetu analyzes legal and regulatory documents using retrieval-grounded evidence and a multi-agent review process built for transparent human oversight.

Primary CTA:

Start an Audit

Secondary CTA:

See How It Works

Right side

Do not put a generic robot/AI illustration.

Instead show a stylized live compliance workspace:

┌────────────────────────────┐
│ CONTRACT AUDIT              │
│ SaaS Agreement              │
│                             │
│ Risk       HIGH             │
│ Confidence 82%              │
│                             │
│ 08 Findings                 │
│ 03 High                     │
│ 03 Medium                   │
│ 02 Low                      │
│                             │
│ Reviewer      ✓             │
│ Skeptic       ✓             │
│ Supervisor    ✓             │
└────────────────────────────┘

This immediately demonstrates what the product does.

5. LANDING PAGE SECTIONS
Section 1 — Hero

Purpose:

Explain the product in 5 seconds.

Elements:

headline
supporting statement
Start Audit button
How It Works button
animated audit visualization
Section 2 — The problem

Show:

Traditional contract review

Long documents
       ↓
Manual reading
       ↓
Scattered references
       ↓
Missed clauses
       ↓
Uncertain conclusions

Then:

NyaySetu

Document
   ↓
Evidence
   ↓
Independent review
   ↓
Adversarial challenge
   ↓
Supervised verdict
   ↓
Human escalation
6. "HOW NYAYSETU WORKS"

This is one of the most important landing-page sections.

Display five stages.

01 — Understand

Upload a contract or regulatory document.

02 — Retrieve

NyaySetu searches its legal knowledge base for relevant evidence.

03 — Review

The Reviewer Agent identifies possible compliance risks.

04 — Challenge

The Skeptic Agent tests the finding and looks for exceptions, missing context, jurisdiction errors, outdated authority, and overstatements.

05 — Decide

The Supervisor evaluates the disagreement and produces a structured verdict.

7. "WHY TRUST THE RESULT?"

This should be a major differentiator.

Display:

Every important finding includes:

✓ Source
✓ Section
✓ Relevant passage
✓ Contract clause
✓ Risk level
✓ Confidence
✓ Agent decision
✓ Escalation status

This mirrors an important pattern in mature legal AI/document systems: users need to see where an AI conclusion came from, and legal platforms emphasize citations, document provenance, permissions and version history.

8. LANDING PAGE — FEATURE SECTION

Use six primary capabilities.

Evidence-grounded RAG

Relevant laws and regulatory sources are retrieved before the agents make findings.

Multi-agent review

Reviewer, Skeptic and Supervisor independently contribute to the decision.

Clause-level findings

Users see exactly which clauses need attention.

Confidence-aware decisions

NyaySetu distinguishes strong evidence from uncertain conclusions.

Human escalation

Uncertain or conflicting findings are routed for professional review.

Audit-ready reports

Generate a structured report containing findings, evidence, decisions and unresolved issues.

9. LEGAL USE CASES

Show concrete use cases instead of generic AI claims.

Examples:

SaaS Agreements
NDAs
Vendor Agreements
Employment Agreements
Privacy Policies
Data Processing Agreements
Terms of Service
Service Level Agreements

For the hackathon MVP, do not promise every legal document type.

Your supported MVP can officially say:

Contracts, agreements and selected regulatory/compliance documents.

10. SECURITY / TRUST SECTION

Show:

Your documents are sensitive.

NyaySetu is designed around:

Encrypted storage
Access controls
Audit history
Source provenance
Human review
No fabricated citations

Do not make unsupported compliance certifications such as "SOC 2 certified" unless you actually have one.

11. FINAL LANDING CTA

End with:

Turn legal uncertainty into a structured review.

Button:

Start Your First Audit

12. LOGIN PAGE

The login page should be extremely clean.

No complicated AI graphics.

Layout

Left:

Brand + short product value proposition.

Right:

Authentication card.

Welcome to NyaySetu

Sign in to your workspace

Email
[____________________]

Password
[____________________]

[ Sign In ]

Forgot password?

──────── OR ────────

[ Continue with Google ]

Don't have an account?
Create account
13. SIGN-UP

Fields:

Full Name
Email
Password
Confirm Password

Optional:

Organization
Role

Role options:

Founder / Business Owner
Legal Professional
Compliance / Operations
Reviewer
Student / Researcher
Other

For the hackathon, do not overcomplicate onboarding.

14. FIRST-TIME ONBOARDING

After successful signup:

Step 1

Welcome to NyaySetu.

Step 2

Ask:

What are you reviewing?

Contract
Agreement
Policy
Regulatory Document
Other
Step 3

Ask jurisdiction:

India

For your first implementation, make India the primary supported jurisdiction.

This keeps your legal corpus controlled instead of pretending to understand every country.

15. DASHBOARD — THE USER'S HOME

The dashboard should answer four questions immediately:

What did I audit?
What needs my attention?
What risks are present?
What can I do next?
15.1 Dashboard header
Good morning, Ricky

Your compliance workspace

[ + New Audit ]

Below:

Total Audits     Completed     In Review     Escalated
     12              8             2             2
16. DASHBOARD RISK SUMMARY

A visual:

Compliance Overview

HIGH        4
MEDIUM      7
LOW         5
CLEAR       3

Clicking a category filters findings.

17. RECENT AUDITS

Table:

Audit	Document	Jurisdiction	Risk	Confidence	Status	Date
SaaS Agreement	agreement.pdf	India	High	82%	Completed	Today
Vendor NDA	NDA.pdf	India	Medium	91%	Completed	Yesterday

Each row opens the audit workspace.

18. ATTENTION REQUIRED

This section is extremely valuable.

Example:

Attention Required

3 findings require human review

• Liability clause — Low evidence coverage
• Data processing clause — Agent disagreement
• Termination clause — Conflicting sources

[Review Escalations]

This makes the dashboard actionable.

19. CREATE NEW AUDIT

This is your most important user flow after login.

CTA:

+ New Audit

20. NEW AUDIT — STEP 1
Select document
Upload Document

Drag & drop your document here

PDF
DOCX
TXT

Maximum size: X MB

[ Browse Files ]

Show:

Supported:
PDF
DOCX
TXT

Don't claim support for dozens of formats until the backend actually handles them.

21. UPLOAD PROCESS

Once uploaded:

Uploading...
██████████████░░ 82%

Then:

Document uploaded ✓

Next:

Extracting text...
✓
Detecting sections...
✓
Identifying clauses...
✓
Preparing document for audit...

This processing stage is also important for your demo because it visually demonstrates that a real pipeline is occurring.

22. DOCUMENT PREVIEW

After processing:

Left:

Document viewer.

Right:

Document information.

Document
────────────
SaaS Agreement.pdf

Pages
18

Sections
12

Clauses detected
27

Document type
SaaS Agreement

Language
English
23. AUDIT CONFIGURATION

Before starting:

Audit Configuration

Jurisdiction
[ India ▼ ]

Audit Type
[ Regulatory Compliance ]

Categories
☑ Privacy
☑ Cybersecurity
☑ Contractual Risk
☐ Consumer
☐ Employment

Review intensity
[ Comprehensive ]

Knowledge base
[ India Legal Knowledge Base ]

[ Start Audit ]
24. AUDIT SCOPE

This is important.

Allow users to choose:

Full Audit

Review the entire document.

Targeted Audit

Choose:

Privacy
Liability
Indemnity
Termination
Confidentiality
Data Processing
Payment
Dispute Resolution

This becomes powerful later because targeted queries can guide RAG retrieval.

25. AUDIT EXECUTION SCREEN

This is one of the most important screens in your entire application.

It should visibly show the actual pipeline.

Do not make it just a spinner.

Display:

AUDIT IN PROGRESS

SaaS Agreement.pdf
India

──────────────────────────────────────

01 Document Processing          ✓
02 Clause Detection             ✓
03 Knowledge Retrieval          ✓
04 Reviewer Agent               ✓
05 Skeptic Agent                ●
06 Supervisor Agent             ○
07 Risk Assessment              ○
08 Report Generation            ○

──────────────────────────────────────

Current stage:

Skeptic Agent

Testing Reviewer assumptions...

[ View Activity ]
26. LIVE AUDIT ACTIVITY

Show structured execution events:

12:41:03
Retrieved 12 legal evidence chunks

12:41:05
Reviewer identified 4 potential issues

12:41:08
Skeptic challenged finding F-003

12:41:10
Additional evidence retrieved

12:41:13
Supervisor resolving disagreement

This directly helps your hackathon demo because the official submission requires demonstration of backend execution, traces/debugger output and UI, while judges may clone and execute the repo to inspect the actual pipeline and database behavior.

27. RAG RETRIEVAL VIEW

Users should be able to see what evidence was retrieved.

Example:

LEGAL KNOWLEDGE RETRIEVAL

Query
"Limitation of liability in SaaS agreements"

Retrieved Evidence

──────────────────────────────
01
DPDP Act
Section X
Relevance 0.92

02
Contractual Guidance
Section Y
Relevance 0.88

03
Government Guidance
Section Z
Relevance 0.83

Click an item:

Source
Section
Publication date
Effective date
Authority
URL
Relevant passage

This is one of the strongest trust features you can add.

28. CONTRACT CLAUSE VIEW

When the system detects a clause:

Finding F-003

CLAUSE

"The provider shall not be liable for..."

──────────────────────────────

Clause type
Limitation of Liability

Location
Page 8
Section 12.2

Detected concern
Potentially restrictive liability structure

Then show evidence.

29. REVIEWER AGENT

The UI should never expose hidden chain-of-thought.

Do not display:

"The model thought for 14 seconds and considered..."

Instead display structured conclusions:

REVIEWER AGENT

Assessment
Potential Compliance Concern

Risk
HIGH

Confidence
84%

Reason
The clause may create a material compliance concern
under the selected jurisdiction based on the retrieved
legal evidence.

Evidence
2 supporting sources

[View Evidence]

This preserves transparency without pretending to expose private internal reasoning.

30. SKEPTIC AGENT

Show:

SKEPTIC AGENT

Challenge
Reviewer conclusion may be overstated.

Questions checked:

✓ Is the cited authority applicable?
✓ Does the jurisdiction match?
✓ Is the source current?
✓ Are exceptions relevant?
✓ Is the Reviewer making an unsupported assumption?
✓ Is contradictory evidence available?

Assessment
PARTIALLY SUPPORTED

Confidence
67%

This is much stronger than a chatbot saying "I disagree."

31. SUPERVISOR AGENT

Show:

SUPERVISOR

Reviewer
HIGH

Skeptic
MEDIUM

Evidence quality
STRONG

Agent agreement
PARTIAL

Final classification
HIGH RISK

Confidence
78%

Decision
Human review not required

Or:

Final classification
HUMAN REVIEW REQUIRED

Confidence
54%

Reason
Reviewer and Skeptic remain materially divided and
available legal evidence does not support a sufficiently
reliable automated conclusion.
32. FINDINGS PAGE

After the audit completes, the user lands on:

Audit Findings

Top summary:

Overall Compliance Risk

HIGH

Confidence
78%

Then risk breakdown:

Critical     0
High         3
Medium       4
Low          2
33. FINDING CARDS

Each card:

HIGH RISK

Limitation of Liability

Page 8 • Section 12.2

Confidence 81%

Potential issue:
...

Evidence:
2 sources

Status:
Supervisor confirmed

[View Finding]

Color can communicate risk, but don't overdo red everywhere.

34. FINDING DETAIL PAGE

This should be one of the best pages in the application.

Structure:

Finding F-003

Limitation of Liability
HIGH RISK
81% confidence

Then:

Original clause

Show exact clause.

Why it was flagged

Human-readable summary.

Legal evidence

Show source cards.

Reviewer

Structured finding.

Skeptic

Structured challenge.

Supervisor

Final determination.

Recommendation

Actionable next step.

Status
Confirmed
Needs Review
Dismissed
Accepted Risk
35. EVIDENCE PANEL

Every finding must have:

Evidence #1

Source:
[Official source name]

Authority:
[Authority]

Section:
[Section]

Jurisdiction:
India

Effective date:
[date]

Relevant passage:
"..."

Source URL:
[Open Source]

Relevance:
0.92

This gives you traceability.

Mature legal products increasingly emphasize citations and source-linked AI outputs precisely so users can verify conclusions rather than simply trusting generated text.

36. SOURCE PROVENANCE

Every legal source stored in your knowledge base should have:

source_id
title
authority
jurisdiction
category
section
subsection
content
source_url
publication_date
effective_date
version
retrieved_at
embedding_model
embedding_version

This is essential for legal RAG.

37. DEBATE TRACE

This is probably one of your strongest hackathon screens.

Title:

Agent Debate

Display:

FINDING F-003

Reviewer
────────────
Assessment: HIGH
Confidence: 84%
Evidence: E12, E17

        ↓

Skeptic
────────────
Challenge: Applicability unclear
Confidence: 67%
Evidence: E17, E21

        ↓

Supervisor
────────────
Final: HIGH
Confidence: 78%
Decision: Confirmed

The screen should also show:

Evidence added during debate
Reviewer challenged
Skeptic challenge accepted/rejected
Supervisor resolution

That demonstrates actual multi-agent orchestration rather than three cosmetic AI labels.

38. HUMAN ESCALATION

When the system does not have enough evidence:

⚠ HUMAN REVIEW REQUIRED

NyaySetu could not establish a sufficiently reliable
automated conclusion.

Reason:
Reviewer and Skeptic disagree.

Confidence:
54%

Issue:
...

Questions for legal reviewer:
1. Does authority X apply to this arrangement?
2. Is exception Y applicable?
3. Should this clause be treated as high-risk?

Then:

Create Review Brief

39. HUMAN REVIEW BRIEF

Generate:

HUMAN REVIEW BRIEF

Matter
SaaS Agreement

Finding
F-003

Issue
...

Contract clause
...

Evidence
...

Reviewer position
...

Skeptic position
...

Supervisor conclusion
...

Reason for escalation
...

Questions for legal advisor
...

Priority
HIGH

This turns uncertainty into a useful workflow rather than a failure.

40. REVIEW STATUS

Users can mark:

Open
Under Review
Resolved
Dismissed
Accepted Risk

This is a realistic legal workflow feature.

41. REPORT PAGE

Your report should look like a professional compliance document.

Header:

NYAYSETU
LEGAL & REGULATORY COMPLIANCE AUDIT

SaaS Agreement
India

Audit ID
NY-2026-00031

Date
13 September 2026
42. REPORT EXECUTIVE SUMMARY

Example:

Overall Risk: HIGH

Confidence: 78%

Findings:
9

High:
3

Medium:
4

Low:
2

Human Review:
1

Then:

The audit identified three high-risk findings, four medium-risk findings and two low-risk findings. One finding requires human review because the retrieved evidence was insufficient to establish a reliable automated conclusion.

43. REPORT CONTENT

Report sections:

1. Executive Summary
2. Scope
3. Document Information
4. Jurisdiction
5. Methodology
6. Risk Overview
7. Findings
8. Legal Evidence
9. Agent Decisions
10. Human Escalations
11. Recommendations
12. Sources
13. Audit Metadata
44. METHODOLOGY PAGE

Explain:

Document Processing
      ↓
Clause Detection
      ↓
Knowledge Retrieval
      ↓
Reviewer Analysis
      ↓
Skeptic Challenge
      ↓
Supervisor Decision
      ↓
Risk & Confidence
      ↓
Human Escalation

This is excellent for judges.

45. REPORT SOURCES

The final report must have a source appendix:

Source 01
Title
Authority
Section
URL
Effective Date

Source 02
...

No citation without a source record.

46. AUDIT HISTORY

Page:

Audits

Filters:

Status
Risk
Document type
Jurisdiction
Date

Search:

Search audit...

Table:

Audit
Document
Risk
Confidence
Status
Updated

Mature contract/legal platforms rely heavily on centralized repositories, searchable documents, activity history and metadata.

47. DOCUMENT LIBRARY

This is a feature many basic AI projects forget.

Your users should have:

Documents

All Documents
Contracts
Policies
Agreements
Regulatory Sources
Archived

Each document:

Name
Type
Pages
Created
Last audited
Risk
Status

Search should work across:

Filename
Document text
Metadata
Tags
Audit

Search and secure document organization are standard expectations in mature legal document systems.

48. DOCUMENT VERSIONING

A very useful legal feature:

SaaS Agreement v1
SaaS Agreement v2
SaaS Agreement v3

Show:

Version 3 — Current
Version 2 — Previous
Version 1 — Original

Allow:

Compare versions

Then highlight:

Added clause
Removed clause
Modified clause
Risk changed

Contract-management platforms emphasize version tracking, redlines and activity history.

For your hackathon, basic version comparison is valuable but should remain P1, after the core RAG/agent system works.

49. CLAUSE LIBRARY

This is a strong legal-domain feature.

Users can browse:

Clause Library

Limitation of Liability
Indemnity
Confidentiality
Termination
Governing Law
Dispute Resolution
Data Processing
Warranty
Payment
IP Ownership

Opening one:

Clause Type:
Limitation of Liability

Recommended characteristics

Risk signals
Common variations
Relevant legal sources
Past findings
50. PLAYBOOK

A more advanced legal feature:

Users define preferred rules:

Liability cap should not exceed:
12 months fees

Auto-flag:
Unlimited liability

Required:
Mutual indemnity

Then the Reviewer can compare the uploaded agreement against the playbook.

This aligns with modern contract review tools, which increasingly use playbooks to standardize review and flag deviations.

For the hackathon, implement a small rules/playbook system, not a full enterprise contract platform.

51. OBLIGATION TRACKING

This is a very useful future-facing legal feature.

After analysis, NyaySetu can identify:

Obligation
Due date
Responsible party
Trigger
Source clause
Status

Example:

Annual security audit
Due: 30 June
Responsible: Provider
Source: Section 14
Status: Upcoming

Legal systems commonly need tracking of renewals, notices, obligations and milestones.

For the hackathon:

P1 feature.

Do not let it delay the core multi-agent pipeline.

52. SEARCH

Global search should search:

Audits
Documents
Findings
Sources
Clauses
Reports

Example:

"liability"

Results:

3 audits
7 findings
12 clauses
5 legal sources
53. ACTIVITY / AUDIT LOG

This is important for legal applications and especially important for your judges.

Record:

User signed in
Document uploaded
Audit created
Source retrieved
Reviewer executed
Skeptic executed
Supervisor executed
Finding created
Finding status changed
Report generated
Document downloaded

Mature legal AI/workspace platforms emphasize detailed audit trails and access/activity visibility.

54. SETTINGS

Sections:

Profile
Security
Notifications
Workspace
Knowledge Base
AI Configuration
Audit Preferences
Data Management
Activity

For MVP, keep the actual functionality to:

Profile
Security
Knowledge Base
AI Configuration
Activity
55. USER ROLES

For your hackathon, keep roles simple.

Owner

Can:

create audits
upload documents
access reports
configure knowledge base
manage workspace
Reviewer

Can:

inspect findings
review escalations
add decisions
annotate findings
Viewer

Can:

view audits
view reports
view evidence

Do not create 12 roles.

56. ACCESS CONTROL

At minimum:

User
 ↓
Workspace
 ↓
Audit
 ↓
Documents
 ↓
Findings
 ↓
Reports

Users should not be able to access another user's audit.

Permissions matter greatly for sensitive legal documents; mature legal systems use matter/document-level access controls.

57. KNOWLEDGE BASE PAGE

This page should show the actual legal intelligence behind NyaySetu.

Knowledge Base

Legal Sources
──────────────

DPDP Act
India
Privacy
Current

IT Act
India
Cybersecurity

Government Guidance
India
Data Protection

Each source:

Authority
Version
Effective date
Sections
Chunks
Embedding status
Indexed date
58. KNOWLEDGE BASE INGESTION

Admin flow:

Add Source
   ↓
Upload / Import
   ↓
Extract text
   ↓
Clean
   ↓
Detect sections
   ↓
Chunk
   ↓
Generate Hugging Face embeddings
   ↓
Index in Pinecone
   ↓
Validate
   ↓
Publish to Knowledge Base
59. KNOWLEDGE BASE VALIDATION

Before publication:

Source validation

✓ Text extracted
✓ Sections detected
✓ Metadata present
✓ Jurisdiction present
✓ Authority present
✓ Effective date present
✓ Embeddings generated
✓ Pinecone indexing complete

This helps you demonstrate that your RAG is an actual data pipeline.

60. THE ACTUAL RAG ARCHITECTURE

Your complete legal intelligence flow should be:

LEGAL SOURCES
     ↓
DOCUMENT EXTRACTION
     ↓
SECTION IDENTIFICATION
     ↓
LEGAL CHUNKING
     ↓
HUGGING FACE EMBEDDINGS
     ↓
PINECONE
     ↓
METADATA FILTERING
     ↓
SEMANTIC SEARCH
     ↓
TOP-K RETRIEVAL
     ↓
RERANKING
     ↓
EVIDENCE PACK
     ↓
AGENTS

For a contract:

UPLOADED CONTRACT
       ↓
Clause detection
       ↓
Clause classification
       ↓
Query generation
       ↓
Hugging Face embedding
       ↓
Pinecone search
       ↓
Relevant legal evidence
       ↓
Reviewer
61. TWO KNOWLEDGE DOMAINS

NyaySetu should logically distinguish:

LEGAL KNOWLEDGE BASE

laws
regulations
government guidance
standards

and:

MATTER / CONTRACT KNOWLEDGE BASE

uploaded contract
previous versions
clauses
attachments
matter-specific documents

Do not mix them blindly.

62. AGENT WORKFLOW

The final agent architecture:

                 AUDIT
                    │
                    ▼
              CONTEXT BUILDER
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
  Legal RAG                 Contract RAG
        │                       │
        └───────────┬───────────┘
                    ▼
              REVIEWER AGENT
                    │
                    ▼
             FINDING PACKAGE
                    │
                    ▼
              SKEPTIC AGENT
                    │
             additional RAG
                    │
                    ▼
             CHALLENGE PACKAGE
                    │
                    ▼
            SUPERVISOR AGENT
                    │
                    ▼
          RISK + CONFIDENCE
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
  Final Finding         Human Escalation
63. REVIEWER CONTRACT

Reviewer output:

{
  "finding_id": "F-003",
  "clause_id": "C-012",
  "issue": "...",
  "risk_level": "HIGH",
  "reasoning_summary": "...",
  "evidence_ids": ["E-12", "E-17"],
  "confidence": 84,
  "recommendation": "...",
  "status": "REVIEW"
}
64. SKEPTIC CONTRACT
{
  "finding_id": "F-003",
  "challenge": "...",
  "assumption_challenged": "...",
  "applicability_check": "...",
  "contradictory_evidence_ids": [],
  "revised_risk": "MEDIUM",
  "confidence": 67,
  "status": "PARTIAL_CHALLENGE"
}
65. SUPERVISOR CONTRACT
{
  "finding_id": "F-003",
  "final_risk": "HIGH",
  "confidence": 78,
  "verdict": "CONFIRMED",
  "reason": "...",
  "evidence_ids": ["E-12", "E-17"],
  "human_review_required": false
}
66. CONFIDENCE ENGINE

Don't let the LLM's confidence be the only score.

Build a separate confidence engine using signals such as:

Source authority
Jurisdiction match
Source freshness
Evidence relevance
Evidence coverage
Reviewer confidence
Skeptic confidence
Agent agreement
Contradiction count

Conceptually:

FINAL CONFIDENCE
=
evidence quality
+
authority
+
jurisdiction
+
agent agreement
+
retrieval quality
-
contradictions

The actual formula should be deterministic and documented.

67. HUMAN ESCALATION RULES

Escalate when:

confidence below threshold
OR
Reviewer/Skeptic strongly disagree
OR
insufficient evidence
OR
jurisdiction uncertain
OR
source conflict
OR
source freshness uncertain
OR
critical issue detected

This is one of the features that makes NyaySetu feel like a responsible legal system rather than an unrestricted chatbot.

68. WHAT HAPPENS WHEN RAG FAILS?

Never allow:

"No evidence found"
      ↓
LLM guesses legal answer

Instead:

No reliable evidence
      ↓
Confidence reduced
      ↓
Human review

The UI:

Insufficient authoritative evidence was retrieved to support an automated conclusion.

This should be a core safety behavior.

69. WHAT HAPPENS WHEN THE LLM FAILS?

Primary model:

LLM Provider A

Failure:

Timeout
Rate limit
Invalid response
Malformed JSON

Then:

fallback provider/model

If both fail:

Audit paused
Retry available
No fabricated finding generated

This directly supports the rubric's expectation around robustness and fallback safety routing.

70. WHAT HAPPENS WHEN PINECONE FAILS?

Never return a fabricated legal answer.

System:

Pinecone unavailable

Audit state:
RETRIEVAL_FAILED

Reason:
Legal evidence could not be verified.

[Retry]
71. DATABASE CORE

Your core database should represent:

users
workspaces
audits
documents
document_versions
document_chunks
legal_sources
legal_chunks
findings
evidence
agent_runs
debate_messages
escalations
reports
audit_events
playbooks
obligations

This is far better than putting everything into one audits table.

72. AUDIT STATE MACHINE

Use explicit states:

CREATED
UPLOADING
PROCESSING
READY
RETRIEVING
REVIEWING
CHALLENGING
SUPERVISING
ASSESSING
ESCALATED
COMPLETED
FAILED

This makes your backend much easier to debug.

73. EVERY AUDIT GETS AN ID

Example:

NY-2026-00031

Every object connects to it:

Audit
 ├── Documents
 ├── Chunks
 ├── Findings
 ├── Evidence
 ├── Agent Runs
 ├── Debate
 ├── Escalations
 └── Report

This gives you a clean audit trail.

74. NOTIFICATIONS

Basic notifications:

Audit completed
Audit failed
Human review required
Report generated
Document processing completed

Do not build a massive messaging system.

75. COLLABORATION — P1

For later:

Assign finding
@mention reviewer
Comments
Decision
Approval

Modern legal collaboration platforms provide shared workspaces, granular access and activity trails, so this is a logical extension.

But don't let collaboration delay your core system.

76. REDLINING — P1/P2

This is an expected legal-product feature, especially in contract review.

Potential workflow:

Finding
 ↓
Recommended change
 ↓
Generate suggested clause
 ↓
Compare with original
 ↓
Redline

Contract review platforms increasingly offer AI-assisted review, playbooks and redline support.

However:

Do not make redlining core to the 20-day MVP.

The PS05 judge wants your compliance auditor's multi-agent workflow first.

77. WHAT FEATURES ARE MOST IMPORTANT TO JUDGES?

Based on the official PS05 requirements and rubric, the priorities should be:

Tier S — absolutely must work
Document Upload
Document Extraction
Legal RAG
Pinecone Retrieval
Reviewer Agent
Skeptic Agent
Supervisor Agent
Structured Outputs
Evidence/Citations
Risk Assessment
Confidence
Human Escalation
Final Report
Database Persistence

These directly support the problem statement and technical rubric.

78. TIER A — STRONGLY RECOMMENDED
Audit History
Document Search
Version History
Activity Log
Knowledge Base Management
Clause-level findings
Debate Trace
Source provenance
Playbook
Basic obligation extraction

These make the system feel like a legal product rather than a hackathon demo.

79. TIER B — ONLY AFTER CORE SYSTEM IS SOLID
Redlining
Team collaboration
Comments
Approval workflows
Email notifications
Calendar
Advanced analytics
Bulk audits
OCR
Integrations
80. FEATURES YOU SHOULD NOT BUILD FOR THIS HACKATHON

Do not waste your 20-day window on:

Lawyer marketplace
Video calls
Payment system
Mobile app
Blockchain
WhatsApp integration
Voice assistant
50 jurisdictions
Full case management
Court filing system
Legal billing
Massive CRM
Fine-tuning an LLM from scratch
Enterprise SSO
Complex e-signature system

They do not strengthen your core PS05 implementation enough to justify the time.

81. THE IDEAL MVP

Your actual finished MVP should feel like this:

                 NYAYSETU

             USER LOGS IN
                    ↓
             DASHBOARD
                    ↓
              + NEW AUDIT
                    ↓
             UPLOAD CONTRACT
                    ↓
             SELECT JURISDICTION
                    ↓
             START COMPLIANCE AUDIT
                    ↓
        ┌──────────────────────────┐
        │ Document Processing       │
        │ Clause Detection          │
        │ RAG Retrieval             │
        │ Reviewer                  │
        │ Skeptic                   │
        │ Supervisor                │
        │ Risk Engine               │
        └──────────────────────────┘
                    ↓
             FINDINGS DASHBOARD
                    ↓
       ┌────────────┼────────────┐
       ↓            ↓            ↓
    Evidence     Debate      Escalation
       ↓            ↓            ↓
       └────────────┼────────────┘
                    ↓
               FINAL REPORT
                    ↓
              SAVE AUDIT
82. WHAT THE JUDGE SHOULD EXPERIENCE

During your demo, the judge should be able to think:

"This isn't just ChatGPT reading a PDF."

They should visibly see:

1. Contract uploaded
2. Text extracted
3. Clauses detected
4. Legal evidence retrieved from Pinecone
5. Reviewer makes finding
6. Skeptic challenges it
7. Skeptic retrieves additional evidence
8. Supervisor resolves dispute
9. Risk/Confidence calculated
10. Human escalation triggered where appropriate
11. Final report generated
12. Results persisted

That maps directly to the actual PS05 requirement and the technical-depth rubric.

83. THE "WOW" MOMENT

Your strongest demo moment should be:

User uploads SaaS agreement

NyaySetu detects:

Limitation of Liability — Potential Risk

Then:

Reviewer
HIGH

↓

Skeptic
CHALLENGE

"Reviewer may be overstating the applicability
of the cited authority."

↓

Additional legal evidence retrieved

↓

Supervisor
HUMAN REVIEW REQUIRED

Confidence: 54%

Then the interface generates:

Human Review Brief

with:

original clause
legal evidence
reviewer position
skeptic position
supervisor decision
uncertainty reason
questions for the legal reviewer

That is much more impressive than:

"AI says this clause is risky."

84. UI/UX DIRECTION

Your visual design should be:

Premium legal technology

Not:

Generic AI SaaS.

Use:

Deep neutral / charcoal foundation
Warm white content areas
Subtle glass panels
Fine borders
High-quality typography
Large whitespace
Small motion details
Subtle data visualizations
Minimal gradients
Precise icons

Avoid:

Robot illustrations
Brain graphics
"AI MAGIC"
Huge glowing neural networks
Excessive purple gradients
ChatGPT-style chat bubbles everywhere
Random 3D objects

The UI should communicate:

trust + precision + evidence + professionalism.

85. MOTION SYSTEM

Use motion for:

Page transitions
Document upload
Audit stages
Evidence expansion
Agent progression
Risk score animation
Finding filtering
Report generation

Do not animate every element.

Legal software should feel calm and authoritative.

86. THE CORE DESIGN LANGUAGE

Think:

Bloomberg
+
Linear
+
Apple
+
modern legal workspace

rather than:

AI startup landing page
87. DASHBOARD VISUAL HIERARCHY

The most important element should always be:

What requires attention?

Then:

Risk
Findings
Audits
Evidence
Activity

Do not make a dashboard where decorative graphs occupy half the page.

88. RESPONSIVE EXPERIENCE

Desktop:

Sidebar
Main workspace
Evidence panel

Tablet:

Collapsible sidebar
Two-column where possible

Mobile:

Bottom navigation / collapsible menu
Stacked findings
Scrollable evidence
Simplified debate view

Your primary professional workflow is desktop, but the web app should remain usable on mobile.

89. ACCESSIBILITY

Every major component should have:

keyboard navigation
focus states
readable contrast
semantic buttons
ARIA where needed
no color-only risk indicators

For example:

HIGH
●

should not rely only on the red color.

Write:

HIGH RISK

90. LEGAL DISCLAIMER

Visible in onboarding/footer/report:

NyaySetu provides AI-assisted legal and regulatory compliance analysis for informational and review purposes. It does not replace professional legal advice. Findings should be reviewed by a qualified legal professional where appropriate.

And especially:

Absence of a flagged issue does not guarantee legal compliance.

That is important.

91. THE "SINGLE SOURCE OF TRUTH" FEATURE HIERARCHY

Freeze the project around this hierarchy:

                    NYAYSETU
                       │
          ┌────────────┴────────────┐
          │                         │
      USER APP                 AI ENGINE
          │                         │
          │                  ┌──────┴───────┐
          │                  │              │
      Dashboard             RAG          Agents
          │                  │              │
       Audits             Pinecone       Reviewer
          │                  │            Skeptic
     Documents          HuggingFace      Supervisor
          │
      Findings
          │
       Reports
92. FINAL NAVIGATION

This is the navigation I recommend you lock:

NYAYSETU
│
├── Dashboard
│
├── Audits
│   ├── All Audits
│   ├── In Progress
│   ├── Completed
│   └── Escalated
│
├── Documents
│   ├── All Documents
│   ├── Recent
│   └── Versions
│
├── Findings
│
├── Knowledge Base
│   ├── Legal Sources
│   └── Categories
│
├── Reports
│
├── Clause Library
│
├── Review Queue
│
└── Settings

For the first working version, display only:

Dashboard
Audits
Documents
Findings
Knowledge Base
Reports
Settings

Everything else can exist behind contextual navigation.

93. FINAL SCREEN MAP

Your application should ultimately contain:

PUBLIC
│
├── Landing
├── How It Works
├── Features
├── Security / Trust
├── Login
└── Register

AUTHENTICATED
│
├── Dashboard
│
├── New Audit
│   ├── Upload
│   ├── Configure
│   ├── Processing
│   └── Running
│
├── Audit Workspace
│   ├── Overview
│   ├── Findings
│   ├── Clauses
│   ├── Evidence
│   ├── Agent Review
│   ├── Debate
│   ├── Escalations
│   └── Report
│
├── Documents
│
├── Knowledge Base
│
├── Reports
│
├── Clause Library
│
├── Review Queue
│
├── Activity
│
└── Settings
94. FINAL FEATURE MATRIX
Feature	Priority	Why
Authentication	P0	Required workspace foundation
PDF/DOCX upload	P0	Core input
Document extraction	P0	Core pipeline
Clause detection	P0	Legal analysis
Legal knowledge base	P0	RAG
Hugging Face embeddings	P0	Semantic retrieval
Pinecone	P0	Vector search
Metadata filtering	P0	Jurisdiction/category control
Reranking	P1	Retrieval quality
Reviewer Agent	P0	PS05 requirement
Skeptic Agent	P0	PS05 requirement
Supervisor Agent	P0	PS05 requirement
Structured JSON	P0	Reliable orchestration
Risk scoring	P0	Usable output
Confidence scoring	P0	Uncertainty
Evidence citations	P0	Legal trust
Debate trace	P0	Judge-visible AI depth
Human escalation	P0	PS05 + safety
Final report	P0	Product completeness
Audit history	P0	Professional workflow
Activity logs	P1	Security/debugging
Document search	P1	Legal-product expectation
Version history	P1	Contract workflow
Clause library	P1	Legal workflow
Playbooks	P1	Standardized review
Obligation tracking	P1	Contract lifecycle
Collaboration	P2	Team workflows
Redlining	P2	Advanced contract review
E-signature	P2	Outside PS05 core
Billing	P2	Outside PS05 core
CRM	P2	Outside PS05 core
95. WHAT YOU SHOULD ACTUALLY BUILD BY SEPTEMBER 24

Your official competition submission should prioritize:

                ┌─────────────────────┐
                │    NYAYSETU MVP     │
                └──────────┬──────────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
   DOCUMENT             RAG ENGINE        MULTI-AGENT
   PIPELINE                                AUDITOR
       │                   │                   │
       │                   │              Reviewer
       │              HuggingFace          Skeptic
       │              Pinecone            Supervisor
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
                  RISK + CONFIDENCE
                           │
                           ▼
                   FINDINGS + EVIDENCE
                           │
                   ┌───────┴────────┐
                   ▼                ▼
              FINAL REPORT     HUMAN REVIEW

Everything else is secondary.

96. THE FINAL PRODUCT PRINCIPLE

Whenever you or Antigravity proposes a new feature, ask:

Does this make NyaySetu better at evidence-grounded legal/regulatory compliance auditing?

If yes, consider it.

If it is merely a flashy feature that doesn't improve:

retrieval
analysis
agent debate
evidence
confidence
human oversight
reporting

do not prioritize it.

97. THE ONE-SENTENCE PRODUCT DEFINITION

This should appear in your README, architecture documentation and presentation:

NyaySetu is an evidence-grounded, multi-agent legal and regulatory compliance auditor that retrieves authoritative legal context, independently reviews and challenges contract clauses, supervises disagreements, quantifies confidence, and escalates uncertain findings for human review.

That is the product.

Everything in the application should support that sentence.

The final judge-facing architecture
                         NYAYSETU
                            │
                            ▼
                     USER AUTHENTICATION
                            │
                            ▼
                        DASHBOARD
                            │
                            ▼
                      CREATE AUDIT
                            │
                            ▼
                     UPLOAD DOCUMENT
                            │
                            ▼
                 DOCUMENT PROCESSING
                            │
               ┌────────────┴────────────┐
               │                         │
               ▼                         ▼
         CONTRACT RAG               LEGAL RAG
               │                         │
               │                  Hugging Face
               │                   Embeddings
               │                         │
               │                      Pinecone
               │                         │
               └────────────┬────────────┘
                            ▼
                     EVIDENCE PACK
                            │
                            ▼
                    REVIEWER AGENT
                            │
                            ▼
                    SKEPTIC AGENT
                            │
                       fresh RAG
                            │
                            ▼
                   SUPERVISOR AGENT
                            │
                            ▼
                 RISK + CONFIDENCE ENGINE
                            │
                  ┌─────────┴─────────┐
                  ▼                   ▼
             CONFIRMED          HUMAN REVIEW
                  │                   │
                  └─────────┬─────────┘
                            ▼
                     FINDINGS DASHBOARD
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
          Evidence        Debate       Escalation
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                       FINAL REPORT
                            │
                            ▼
                       AUDIT HISTORY

This is the architecture and UX direction I would lock before asking Antigravity to implement more screens. Mature legal platforms reinforce the same broad product principles—centralized matter/document context, search, permissions, version/activity history, AI review with source traceability, and workflow/approval controls—while your PS05-specific differentiator is the explicit Reviewer → Skeptic → Supervisor debate plus confidence-based human escalation.

The official competition also requires a public GitHub repository, detailed README, minimum four-minute demo, and evidence of backend execution, while the judges may clone and execute the repository to inspect the multi-agent pipeline and database updates.

This should now be treated as the product-level source of truth; your technical ARCHITECTURE.md, RAG.md, AGENTS.md, database schema and Antigravity implementation prompts should derive from it rather than independently redefining the application.