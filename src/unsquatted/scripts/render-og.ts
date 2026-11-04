#!/usr/bin/env tsx

/**
 * unsquatted.com's Open Graph cards: the site card, generated from the listed
 * names and the home page's copy, and a card per post drawn from what its
 * widgets set.
 * `src/blog/scripts/lib/og-job.ts` carries the contract.
 */

import { pick } from '@/kernel/shared/lib/collections';

import { loadProse } from '@/blog/shared/content';

import {
  domainsList,
  nameAcross,
  occasionLine,
  POSTS,
  postWidgets,
} from '@/unsquatted/shared/content';

import { postCard, unsquattedCard } from './lib/unsquatted-card.ts';

import { entryCards, renderDocumentOgCards } from '@/blog/scripts/lib/og-job';
import { readCollection } from '@/blog/scripts/lib/read-collection';
import { generatedCard, siteCardPath } from '@/kernel/scripts/lib/og-job';

const posts = await Promise.all(
  readCollection(POSTS).map(async ({ slug, title, frontmatter }) => {
    const source = loadProse(POSTS.id, slug, POSTS.schema);
    if (!source) throw new Error(`No markdown for the post ${slug}.`);

    const widgets = await postWidgets(source);
    const list = widgets.find(({ name }) => name === 'domains');
    const word = widgets.find(({ name }) => name === 'name');

    if (!list || !word) {
      throw new Error(
        `${source.fileName}: a post's card needs a \`domains\` widget and a \`name\` one.`,
      );
    }

    const { occasion, description } = frontmatter;

    return {
      slug,
      page: postCard({
        title,
        description,
        eyebrow: occasionLine(occasion),
        list: domainsList(list),
        ...pick(nameAcross(word), 'word'),
      }),
    };
  }),
);

await renderDocumentOgCards({
  siteCards: [generatedCard(unsquattedCard(), siteCardPath())],
  cards: entryCards('unsquatted-blog', posts, ({ page }) => page),
});
