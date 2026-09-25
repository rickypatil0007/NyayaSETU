import { callLLM } from '../llm/provider';
import { queryRegulations } from '../rag/pinecone';
import { REVIEWER_PROMPT } from './prompts';
import type { Finding } from './types';

export async function runReviewer(documentText: string): Promise<Finding[]> {
  const relevant = await queryRegulations(documentText, 6);
  const prompt = REVIEWER_PROMPT(documentText, relevant);
  const raw = await callLLM(prompt, { temperature: 0.2 });
  return parseFindings(raw);
}

function parseFindings(raw: string): Finding[] {
  try {
    const cleaned = raw.trim().replace(/^```json|```$/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return (parsed.findings ?? []).map((f: any, i: number) => ({
      id: `f-${i}`,
      claim: f.claim,
      citations: f.citations ?? [],
      raisedBy: 'reviewer' as const,
    }));
  } catch {
    // Free-tier models occasionally break JSON format under load — degrade to
    // a single low-confidence finding rather than failing the whole audit.
    return [{ id: 'f-0', claim: `[unparsed reviewer output] ${raw}`, citations: [], raisedBy: 'reviewer' }];
  }
}
