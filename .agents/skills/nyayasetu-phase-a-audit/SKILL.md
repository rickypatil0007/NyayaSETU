---
name: nyayasetu-phase-a-audit
description: >-
  Use this skill to execute Phase A (Read-Only Audit) of the NyayaSETU Forensic Codebase Audit. It enforces read-only constraints and guides the investigation of performance, architecture, and security.
---

# NyayaSETU Phase A: Read-Only Audit

During this phase, you are an investigative auditor.

## 1. Constraints
YOU MUST NOT:
- Modify source files, delete files, rename files.
- Change database schema or data.
- Change any configuration (env, auth, deployment).
- Change agent behavior or prompts.

YOU MAY:
- Read files, inspect directories, dependencies, and configurations.
- Trace execution paths, API routes, database queries, authentication flows.
- Inspect RAG architecture and agent orchestration.

## 2. Button-to-Render Forensics
Your primary objective is to investigate the ~20-second delay when interacting with the application. Trace the full click-to-render lifecycle:
1. Event handler execution
2. Network/server request
3. Backend processing (middleware, auth, validation)
4. AI/RAG processing (embedding, vector search, agent workflow)
5. Response generation and serialization
6. Client state update and render

Find the EXACT bottlenecks. DO NOT blame animations without proof.

## 3. Identify Waterfalls and Duplicates
- Look for sequential await patterns where parallel execution is possible.
- Look for duplicate API calls, queries, embeddings, or agent requests.

## 4. Deliverable
Complete the audit and hand over findings to be used for Phase B.
