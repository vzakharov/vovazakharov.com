#!/usr/bin/env tsx

/**
 * mayawonders.com's Open Graph cards: blog's chart cards, a site card
 * generated with Майя beside her name in place of one rendered from a mark, a
 * card per post, and one per toy, off its drawing.
 * `src/blog/scripts/lib/og-job.ts` carries the contract.
 */

import path from 'node:path';

import { PUBLIC_DIR } from '@/kernel/shared/config/index.node-safe';
import { routeCardPath } from '@/kernel/shared/seo';

import { articleCollection } from '@/blog/shared/content';

import { WHISPER_DRAWING, WHISPER_ROUTE } from '@/maya/shared/config';

import { mayaPostCard, mayaSiteCard, mayaToyCard } from './lib/maya-card.ts';

import { entryCards, renderDocumentOgCards } from '@/blog/scripts/lib/og-job';
import { readCollection } from '@/blog/scripts/lib/read-collection';
import { generatedCard, siteCardPath } from '@/kernel/scripts/lib/og-job';

await renderDocumentOgCards({
  siteCards: [generatedCard(mayaSiteCard(), siteCardPath())],
  cards: [
    ...entryCards(
      'maya-blog',
      readCollection(articleCollection('maya-blog')),
      mayaPostCard,
    ),
    // Each toy unfurls as its own card rather than her site's.
    generatedCard(
      mayaToyCard(WHISPER_DRAWING),
      path.join(PUBLIC_DIR, routeCardPath(WHISPER_ROUTE)),
    ),
  ],
});
