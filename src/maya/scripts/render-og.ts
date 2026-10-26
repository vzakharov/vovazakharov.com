#!/usr/bin/env tsx

/**
 * maya.vovazakharov.com's Open Graph cards: blog's chart cards, a site card
 * generated with Майя beside her name in place of one rendered from a mark, and
 * a card per post. `src/blog/scripts/lib/og-job.ts` carries the contract.
 */

import { articleCollection } from '@/blog/shared/content';

import { mayaPostCard, mayaSiteCard } from './lib/maya-card.ts';

import { entryCards, renderDocumentOgCards } from '@/blog/scripts/lib/og-job';
import { readCollection } from '@/blog/scripts/lib/read-collection';
import { generatedCard, siteCardPath } from '@/kernel/scripts/lib/og-job';

await renderDocumentOgCards({
  siteCards: [generatedCard(mayaSiteCard(), siteCardPath())],
  cards: entryCards(
    'maya-blog',
    readCollection(articleCollection('maya-blog')),
    mayaPostCard,
  ),
});
