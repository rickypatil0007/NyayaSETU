import { callLLM } from '../llm/provider';
import { SKEPTIC_PROMPT } from './prompts';
import type { Finding, Challenge } from './types';

export async function runSkeptic(finding: Finding, regsContext: string): Promise<Challenge> {
  const prompt = SKEPTIC_PROMPT(finding, regsContext);
  const argument = await callLLM(prompt, { temperature: 0.4 });

  return {
    findingId: finding.id,
    argument,
    citations: finding.citations,
  };
}
