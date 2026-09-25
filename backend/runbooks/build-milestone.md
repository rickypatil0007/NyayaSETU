# Runbook — Build One Milestone in Antigravity

1. Open `TASKS.md` and choose the next incomplete milestone whose dependencies are complete.
2. Attach/reference only its relevant `docs/` files. Keep `.agents/rules/` active.
3. Ask Antigravity to restate the milestone's acceptance condition in 3–6 bullets before editing.
4. Inspect existing code and lockfiles before adding dependencies.
5. Implement the smallest end-to-end slice first; avoid parallel half-finished subsystems.
6. Run format/lint/type/unit tests, then the milestone acceptance path.
7. Add regression/failure tests for any defect found during implementation.
8. Update `TASKS.md` checkboxes only for verified work.
9. Ask Antigravity for a concise change summary, commands/results, manual configuration and known limitations.
10. Commit with a milestone-scoped message only after the working tree is understood.

## Stop conditions

Stop the milestone and surface the issue when a required credential is missing, a provider/runtime contract is incompatible, a migration cannot be applied safely or a spec change would weaken evidence/security invariants. Do not “solve” a blocker by hardcoding a successful output.
