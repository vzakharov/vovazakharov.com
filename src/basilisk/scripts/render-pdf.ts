#!/usr/bin/env tsx

/**
 * basilisk.fyi's PDFs: the core's documents, whose print the case's own UI
 * shapes too. `src/blog/scripts/lib/print-job.ts` carries the contract.
 */

import fs from 'node:fs';

import { PUBLIC_DIR } from '@/kernel/shared/config/index.node-safe';

import { caseSealSources } from '@/basilisk/entities/case/index.node-safe';

import { renderPdfs } from '@/blog/scripts/lib/print-job';

/**
 * A case prints its seal beside its lede, composed from its emblem and the
 * lettered site seal, which sit under `public/` as the end mark does. A
 * document with no emblem is not a case.
 */
function caseSealFiles(route: string): string[] {
  const { siteSeal, emblem } = caseSealSources(PUBLIC_DIR, route, 'lettered');

  return fs.existsSync(emblem) ? [emblem, siteSeal] : [];
}

await renderPdfs({
  documentSources: ['src/basilisk/entities/case'],
  documentFiles: caseSealFiles,
});
