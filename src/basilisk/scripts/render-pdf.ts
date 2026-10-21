#!/usr/bin/env tsx

/**
 * basilisk.fyi's PDFs: the core's documents, whose print the case's own UI
 * shapes too. `src/blog/scripts/lib/print-job.ts` carries the contract.
 */

import { renderPdfs } from '../../blog/scripts/lib/print-job.ts';

await renderPdfs({ documentSources: ['src/basilisk/entities/case'] });
