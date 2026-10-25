#!/usr/bin/env tsx

/**
 * maya.vovazakharov.com's Open Graph cards: the core's chart cards, a site card
 * generated with Майя beside her name in place of one rendered from a mark, and
 * a card per post at the post's route plus the card suffix — where its page's
 * metadata points. `src/kernel/scripts/lib/og-job.ts` carries the contract.
 */

import path from 'node:path';

import { articleCollection } from '@/kernel/shared/content';
import {
  documentRoute,
  PUBLIC_DIR,
} from '@/kernel/shared/content/index.node-safe';
import { routeCardPath } from '@/kernel/shared/seo';

import {
  generatedCard,
  renderOgCards,
  siteCardPath,
} from '../../kernel/scripts/lib/og-job.ts';
import { readCollection } from '../../kernel/scripts/lib/read-collection.ts';
import { mayaPostCard, mayaSiteCard } from './lib/maya-card.ts';

await renderOgCards({
  siteCards: [generatedCard(mayaSiteCard(), siteCardPath())],
  cards: readCollection(articleCollection('maya-blog')).map((post) =>
    generatedCard(
      mayaPostCard(post),
      path.join(
        PUBLIC_DIR,
        routeCardPath(documentRoute('maya-blog', post.slug)),
      ),
    ),
  ),
});
