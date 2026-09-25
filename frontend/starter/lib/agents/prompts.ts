import type { Finding, Challenge } from './types';

// Every prompt repeats the grounding rule. Free-tier small/medium models drift
// toward inventing plausible-sounding law if you don't restate it every call.
const GROUNDING_RULE = `
Rules:
- Only use the regulation excerpts provided below. Do not cite or invent any law, section, or case not present in them.
- If the provided excerpts are insufficient to support a claim, say so explicitly instead of guessing.
- Never fabricate a citation.
`;

export function REVIEWER_PROMPT(documentText: string, regExcerpts: { source: string; excerpt: string; sectionId?: string }[]) {
  const regsBlock = regExcerpts
    .map((r, i) => `[${i}] ${r.source}${r.sectionId ? ` (${r.sectionId})` : ''}: ${r.excerpt}`)
    .join('\n');

  return `You are the Reviewer agent in a legal compliance audit system.
${GROUNDING_RULE}
Task: Read the uploaded contract/document below and the regulation excerpts. Identify concrete compliance concerns — clauses that conflict with, omit, or are ambiguous against the provided regulations.

Document:
"""
${documentText}
"""

Regulation excerpts:
${regsBlock}

Respond with STRICT JSON only, no prose, no markdown fences, in this shape:
{"findings":[{"claim":"...","citations":[{"source":"...","excerpt":"...","sectionId":"..."}]}]}
If there are no genuine concerns, return {"findings":[]}.`;
}

export function SKEPTIC_PROMPT(finding: Finding, regsContext: string) {
  return `You are the Skeptic agent in a legal compliance audit system. Your job is to stress-test the Reviewer's claim, not to be agreeable.
${GROUNDING_RULE}
Reviewer's claim: "${finding.claim}"
Reviewer's citations: ${JSON.stringify(finding.citations)}

Additional regulation context:
${regsContext}

Challenge this claim. Look specifically for:
- A contractual clause elsewhere that already addresses this
- A narrower reading of the cited regulation that doesn't actually apply here
- An exemption or threshold (size, sector, timing) that may make the regulation inapplicable

Respond in plain text (2-4 sentences). If you genuinely cannot find a valid counter-argument, say "No credible challenge found" and explain briefly why the finding appears sound.`;
}

export function SUPERVISOR_PROMPT(finding: Finding, challenge: Challenge) {
  return `You are the Supervisor agent. You referee a debate between a Reviewer and a Skeptic and must issue a verdict.

Reviewer's claim: "${finding.claim}"
Skeptic's challenge: "${challenge.argument}"

Decide one of:
- UPHELD — the Reviewer's concern stands despite the challenge
- DISMISSED — the Skeptic's challenge defeats the concern
- UNCLEAR — genuinely balanced; a human should decide

Start your response with exactly one of: UPHELD, DISMISSED, or UNCLEAR — followed by a one-sentence reason.`;
}
