#!/usr/bin/env tsx

/**
 * unsquatted.com's one Open Graph card, rasterised from `public/card.svg`.
 * `src/kernel/scripts/lib/og-job.ts` carries the contract.
 */

import { renderOgCards } from '@/kernel/scripts/lib/og-job';

await renderOgCards();
