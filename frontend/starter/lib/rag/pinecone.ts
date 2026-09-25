import { Pinecone } from '@pinecone-database/pinecone';
import type { Citation } from '../agents/types';

// Uses Pinecone's integrated inference (index created with an embedding model
// attached) so there is no separate embeddings API/key to manage — keeps this
// on Pinecone's free Starter plan only.
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_INDEX!);

export async function queryRegulations(queryText: string, topK = 6): Promise<Citation[]> {
  const results: any = await (index as any).searchRecords({
    query: { inputs: { text: queryText }, topK },
  });

  return (results?.result?.hits ?? []).map((hit: any) => ({
    source: hit.fields?.source ?? 'unknown',
    excerpt: hit.fields?.text ?? '',
    sectionId: hit.fields?.section_id,
  }));
}

export async function upsertRegulationChunks(
  records: { id: string; text: string; source: string; sectionId?: string }[]
) {
  await (index as any).upsertRecords(
    records.map((r) => ({
      id: r.id,
      text: r.text,
      source: r.source,
      section_id: r.sectionId ?? '',
    }))
  );
}
