import { callLLM } from '../llm/provider';
import { SUPERVISOR_PROMPT } from './prompts';
import type { Finding, Challenge, SupervisorVerdict } from './types';

export async function runSupervisor(
  finding: Finding,
  challenge: Challenge,
  round: number,
  maxRounds: number
): Promise<SupervisorVerdict> {
  const prompt = SUPERVISOR_PROMPT(finding, challenge);
  const raw = await callLLM(prompt, { temperature: 0 });
  const decision = parseVerdict(raw);

  if (decision === 'unclear') {
    return {
      findingId: finding.id,
      status: 'escalated',
      reasoning: round < maxRounds ? raw : `No consensus after ${maxRounds} rounds. ${raw}`,
    };
  }

  return { findingId: finding.id, status: decision, reasoning: raw };
}

function parseVerdict(raw: string): 'upheld' | 'dismissed' | 'unclear' {
  const head = raw.trim().slice(0, 20).toUpperCase();
  if (head.startsWith('UPHELD')) return 'upheld';
  if (head.startsWith('DISMISSED')) return 'dismissed';
  return 'unclear';
}
