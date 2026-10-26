#!/usr/bin/env tsx

/** agentic.bible's PDFs: the core's documents alone. `src/blog/scripts/lib/print-job.ts` carries the contract. */

import { renderPdfs } from '@/blog/scripts/lib/print-job';

await renderPdfs();
