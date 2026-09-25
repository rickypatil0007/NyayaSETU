---
name: nyayasetu-phase-h-implementation
description: >-
  Use this skill to execute Phase H through J (Safe Implementation) of the NyayaSETU Forensic Codebase Audit. It enforces priority ordering, micro-checkpoints, and rollback safety.
---

# NyayaSETU Phase H-J: Safe Implementation

## 1. Implementation Priority (Phase H)
Implement fixes in strict priority order:
- **P0 Critical**: severe performance bottlenecks, security vulns, RAG failure.
- **P1 High**: broken core features, OAuth, API latency.
- **P2 Medium**: maintainability, UI inconsistencies.
- **P3 Low**: polish, refactoring.

For each change: make the smallest safe change, preserve animations, test, confirm.

## 2. Micro-Checkpoints (Phase I)
After EVERY Yellow or Red risk change, STOP AND VERIFY:
- App starts
- Relevant routes/APIs work
- Auth/DB/RAG/Agents still work
- ANIMATIONS still work.

## 3. Rollback Safety (Phase J)
Do not perform destructive operations without understanding how to reverse them. Do not delete functionality just because a cleaner implementation exists.
