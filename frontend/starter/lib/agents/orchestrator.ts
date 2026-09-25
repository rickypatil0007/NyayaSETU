import { runReviewer } from './reviewer';
import { runSkeptic } from './skeptic';
import { runSupervisor } from './supervisor';
import { escalate } from './escalation';
import type { AuditState, DebateTurn, Finding } from './types';

// Rounds are capped at 2. This is a deliberate rate-limit / latency guard:
// free-tier LLM calls are the bottleneck, and a debate loop already multiplies
// calls (reviewer: 1, then skeptic+supervisor per round per finding). Uncapped
// rounds on free APIs risks either hitting rate limits mid-audit or a demo
// that takes too long to run live. Raise MAX_ROUNDS only if your free-tier
// quota and demo timing can absorb it.
const MAX_ROUNDS = 2;

export async function runAudit(auditId: string, documentText: string): Promise<AuditState> {
  const state: AuditState = {
    auditId,
    documentText,
    findings: [],
    debate: [],
    verdicts: [],
    status: 'running',
  };

  try {
    state.findings = await runReviewer(documentText);

    for (const finding of state.findings) {
      const verdict = await debateFinding(finding, state.debate);
      state.verdicts.push(verdict);
    }

    const toEscalate = state.verdicts.filter((v) => v.status === 'escalated');
    await escalate(auditId, toEscalate);

    state.status = 'complete';
    return state;
  } catch (err) {
    state.status = 'error';
    throw err;
  }
}

async function debateFinding(finding: Finding, debateLog: DebateTurn[]) {
  let round = 1;

  while (round <= MAX_ROUNDS) {
    const challenge = await runSkeptic(finding, citationsToContext(finding));
    debateLog.push({ round, finding, challenge });

    const verdict = await runSupervisor(finding, challenge, round, MAX_ROUNDS);

    // Only keep looping if the supervisor is unclear AND we still have rounds
    // left — otherwise take the verdict (including a final "escalated") as final.
    if (verdict.status !== 'escalated' || round === MAX_ROUNDS) {
      return verdict;
    }
    round++;
  }

  // Unreachable in practice, but keeps TypeScript happy.
  return { findingId: finding.id, status: 'escalated' as const, reasoning: 'Debate loop exhausted.' };
}

function citationsToContext(finding: Finding): string {
  return finding.citations.map((c) => `${c.source}: ${c.excerpt}`).join('\n');
}
