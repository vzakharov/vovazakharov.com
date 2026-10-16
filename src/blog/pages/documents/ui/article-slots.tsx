import type { ReactNode } from 'react';

import type {
  ArticleCollectionId,
  ArticleFrontmatterOf,
  BaseFrontmatter,
  ContentDocument,
} from '@/shared/content';

import { CaseBrief, NoAiNote } from '@/entities/case';

type Slot<F extends BaseFrontmatter> = (
  document: ContentDocument<F>,
) => ReactNode;

/** What a collection adds to the shared article page. */
type ArticleSlots<F extends BaseFrontmatter> = {
  /** Under the header. */
  brief?: Slot<F>;
  /** Inside the body, after its first paragraph. */
  afterLead?: Slot<F>;
};

/**
 * Keyed by collection, each entry typed by that collection's own frontmatter,
 * so a dossier's slots read its case file and no router has to pass them in.
 */
export const ARTICLE_SLOTS: {
  [C in ArticleCollectionId]?: ArticleSlots<ArticleFrontmatterOf<C>>;
} = {
  'basilisk-cases': {
    brief: ({ frontmatter }) => <CaseBrief {...{ frontmatter }} />,
    afterLead: ({ frontmatter }) => frontmatter.noAi === true && <NoAiNote />,
  },
};
