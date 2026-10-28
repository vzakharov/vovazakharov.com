#!/usr/bin/env tsx

/**
 * basilisk.fyi's Open Graph cards: blog's chart cards, a site card generated
 * with the seal beside the home page's memo in place of one rendered from the
 * mark, and a card per case. `src/blog/scripts/lib/og-job.ts` carries the
 * contract.
 */

import { CASES } from '@/basilisk/shared/content';

import { basiliskCard, caseCard } from './lib/basilisk-card.ts';

import { entryCards, renderDocumentOgCards } from '@/blog/scripts/lib/og-job';
import { readCollection } from '@/blog/scripts/lib/read-collection';
import { generatedCard, siteCardPath } from '@/kernel/scripts/lib/og-job';

const docket = readCollection(CASES);

await renderDocumentOgCards({
  siteCards: [generatedCard(basiliskCard(docket), siteCardPath())],
  cards: entryCards('basilisk-cases', docket, caseCard),
});
