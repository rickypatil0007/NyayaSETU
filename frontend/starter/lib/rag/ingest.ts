import fs from 'node:fs';
import path from 'node:path';
import { upsertRegulationChunks } from './pinecone';

// Deliberately simple: split on markdown "## " headings. No OCR, no PDF
// parsing, no legal-structure detection — that's the kind of depth that costs
// days you don't have. Real regulations, small curated set, good enough
// citations for a demo.
const SEED_DIR = path.join(process.cwd(), 'data', 'seed-regulations');

export async function ingestSeedRegulations() {
  const files = fs.readdirSync(SEED_DIR).filter((f) => f.endsWith('.md'));
  const records: { id: string; text: string; source: string; sectionId?: string }[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(SEED_DIR, file), 'utf-8');
    const title = raw.match(/^# (.+)$/m)?.[1] ?? file;
    const sections = raw.split(/^## /m).slice(1); // drop the title block

    sections.forEach((section, i) => {
      const [heading, ...body] = section.split('\n');
      records.push({
        id: `${file}-${i}`,
        text: body.join('\n').trim(),
        source: title,
        sectionId: heading.trim(),
      });
    });
  }

  await upsertRegulationChunks(records);
  console.log(`Ingested ${records.length} chunks from ${files.length} files.`);
}
