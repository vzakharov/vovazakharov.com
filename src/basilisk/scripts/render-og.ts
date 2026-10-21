#!/usr/bin/env tsx

/**
 * basilisk.fyi's Open Graph cards: the core's chart cards, a site card
 * generated with the seal beside the home page's memo in place of one rendered
 * from the mark, and a card per case at the case's route plus the card suffix —
 * where its page's metadata points. `src/kernel/scripts/lib/og-job.ts` carries
 * the contract.
 */

import path from 'node:path';

import {
  documentRoute,
  PUBLIC_DIR,
} from '@/kernel/shared/content/collections';
import { routeCardPath } from '@/kernel/shared/seo';

import {
  generatedCard,
  renderOgCards,
  siteCardPath,
} from '../../kernel/scripts/lib/og-job.ts';
import { basiliskCard, caseCard } from './lib/basilisk-card.ts';
import { readDocket } from './lib/read-docket.ts';

const docket = readDocket();

await renderOgCards({
  siteCards: [generatedCard(basiliskCard(docket), siteCardPath())],
  cards: docket.map((filed) =>
    generatedCard(
      caseCard(filed),
      path.join(
        PUBLIC_DIR,
        routeCardPath(documentRoute('basilisk-cases', filed.slug)),
      ),
    ),
  ),
});
