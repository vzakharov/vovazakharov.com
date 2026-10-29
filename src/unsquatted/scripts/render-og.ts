#!/usr/bin/env tsx

/**
 * unsquatted.com's one Open Graph card, generated from the listed names and
 * the home page's copy. `src/kernel/scripts/lib/og-job.ts` carries the
 * contract.
 */

import { unsquattedCard } from './lib/unsquatted-card.ts';

import {
  generatedCard,
  renderOgCards,
  siteCardPath,
} from '@/kernel/scripts/lib/og-job';

await renderOgCards({
  siteCards: [generatedCard(unsquattedCard(), siteCardPath())],
});
