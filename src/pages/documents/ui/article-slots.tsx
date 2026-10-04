import type { ReactNode } from 'react';

import type {
  ArticleCollectionId,
  ArticleFrontmatterOf,
  BaseFrontmatter,
  BasiliskArticleFrontmatter,
  ContentDocument,
} from '@/shared/content';
import { pick } from '@/shared/lib/collections';

import { CaseBrief, SourceList } from '@/entities/case';

type Slot<F extends BaseFrontmatter> = (
  document: ContentDocument<F>,
) => ReactNode;

/** What a collection adds to the shared article page: `brief` under the header, `coda` after the body. */
type ArticleSlots<F extends BaseFrontmatter> = {
  brief?: Slot<F>;
  coda?: Slot<F>;
};

/** basilisk.fyi's articles close on what they rest on. */
const sourcesCoda: Slot<BasiliskArticleFrontmatter> = ({ frontmatter }) => (
  <SourceList {...pick(frontmatter, 'sources')} />
);

/**
 * Keyed by collection, each entry typed by that collection's own frontmatter,
 * so a dossier's slots read its case file and no router has to pass them in.
 */
export const ARTICLE_SLOTS: {
  [C in ArticleCollectionId]?: ArticleSlots<ArticleFrontmatterOf<C>>;
} = {
  'basilisk-cases': {
    brief: ({ frontmatter }) => <CaseBrief {...{ frontmatter }} />,
    coda: sourcesCoda,
  },
  'basilisk-faq': { coda: sourcesCoda },
};
