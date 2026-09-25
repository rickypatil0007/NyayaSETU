import 'dotenv/config';
import { ingestSeedRegulations } from '../lib/rag/ingest';

ingestSeedRegulations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
