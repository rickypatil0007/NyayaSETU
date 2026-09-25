# Synthetic Demonstration Fixtures

Everything in this folder is **fictional development/evaluation data** created for NyayaSETU. It is not legal advice, not an authoritative regulation and not a real company's agreement or policy.

Use it to test extraction, evidence retrieval, agent disagreement, consensus/escalation and report generation without exposing private contracts.

- `sample-sla-and-policy.md` — fictional SLA clauses plus fictional internal policy rules.
- `expected-behavior.md` — developer-only expected findings used by tests/evaluation.

In a production UI, label these fixtures “Synthetic demo data.” Do not ingest `expected-behavior.md` into the vector corpus presented to the agents; doing so would leak the oracle/expected answer into the model context.
