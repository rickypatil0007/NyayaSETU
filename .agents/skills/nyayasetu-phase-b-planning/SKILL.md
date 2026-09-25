---
name: nyayasetu-phase-b-planning
description: >-
  Use this skill to execute Phase B through G (Reporting and Planning) of the NyayaSETU Forensic Codebase Audit. It guides the creation of the Change Manifest and Risk Classification.
---

# NyayaSETU Phase B-G: Reporting & Planning

## 1. Audit Report (Phase B)
Produce a structured internal report based on Phase A findings covering: Architecture, Critical User Flows, Performance Bottlenecks, Security, Auth, RAG, Agents, DB, and UI.

## 2. Change Manifest (Phase C)
Before modifying anything, create a Change Manifest for every proposed change containing:
- CHANGE ID
- FILE
- CURRENT PROBLEM
- ROOT CAUSE
- PROPOSED CHANGE
- WHY THIS CHANGE
- DEPENDENCIES
- RISK LEVEL
- EXPECTED RESULT
- VERIFICATION METHOD
- ROLLBACK APPROACH

## 3. Safety Classification (Phase D)
Classify each change:
- GREEN (Low Risk): Loading UI, disabled states, safe memoization.
- YELLOW (Medium Risk): API order, caching, DB queries, RAG retrieval.
- RED (High Risk): DB schemas, destructive operations, Auth replacement.

## 4. Animation & Latency Protection Gates (Phases E-F)
- Ensure NO 3D or Scroll animation is removed to hide latency.
- Ensure the actual ~20-second latency root cause has been found and targeted before approving fixes.

## 5. Fix Approval Gate (Phase G)
Ensure all audits are complete and the manifest is approved before moving to implementation.
