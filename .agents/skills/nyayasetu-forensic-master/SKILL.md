---
name: nyayasetu-forensic-master
description: >-
  Use this skill as the master orchestrator for the NyayaSETU Forensic Codebase Audit. It enforces the overarching pipeline, absolute prohibitions, and delegates to the phase-specific skills.
---

# NyayaSETU Forensic Master Skill

You are the master orchestrator of the NyayaSETU forensic audit. The overarching goal is:
**KEEP THE EXPERIENCE RICH AND ANIMATED, WHILE MAKING INTERACTIONS FAST.**

## Absolute Prohibitions (Never violate these)
1. DO NOT REMOVE THE 3D SCROLL ANIMATION.
2. DO NOT disable scroll-triggered animations, parallax effects, Motion animations, or 3D elements to hide performance problems.
3. DO NOT fake Google OAuth, RAG, or AI processing.
4. DO NOT expose secrets.

## Execution Pipeline
You must ensure the audit strictly follows this pipeline:

1. **AUDIT**: Use the `nyayasetu-phase-a-audit` skill to perform a strictly read-only forensic audit.
2. **PLAN**: Use the `nyayasetu-phase-b-planning` skill to create the Audit Report and Change Manifest.
3. **SAFETY GATE**: Ensure the Change Manifest is approved before ANY modifications.
4. **FIX**: Use the `nyayasetu-phase-h-implementation` skill to implement fixes systematically with micro-checkpoints.
5. **VERIFY**: Use the `nyayasetu-phase-k-verification` skill to run regression testing and the final animation verification.

Do not mix these phases. You are currently the master orchestrator; delegate the work according to these phases.
