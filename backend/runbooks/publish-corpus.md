# Runbook — Curate and Publish a Source Corpus Snapshot

1. Collect the intended public/reference or internal-policy documents with legal permission to use them.
2. Record title, owner/publisher, canonical location/provenance, jurisdiction/domain, version/effective date and retrieval date.
3. Hash the raw artifact; keep the original immutable for that version.
4. Extract/chunk/index it using the same documented pipeline as other sources.
5. Manually inspect representative chunks for extraction errors and prompt-injection-like text.
6. Mark each source `reviewed`; only a human can move it to `approved`.
7. Build a snapshot manifest containing source IDs + versions/hashes.
8. Publish a new immutable `corpus_snapshot_id` and index namespace/filter.
9. Run retrieval smoke tests for the supported audit topics.
10. Record known coverage gaps. Do not label a snapshot as comprehensive when it is not.

Synthetic files in `data/synthetic/` are never promoted to production/reference authority without explicit relabeling and provenance review.
