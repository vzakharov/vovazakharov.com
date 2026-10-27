import type { ReactNode } from 'react';

import { SITE_CONFIG } from '@/shared/config';
import type {
  ArticleCollectionId,
  ArticleFrontmatterOf,
  BaseFrontmatter,
  ContentDocument,
} from '@/shared/content';

import { CaseBrief, CaseSeal, NoAiNote } from '@/entities/case';
import { MayaByline, PlateLabel, plateNumber } from '@/entities/maya';

type Slot<F extends BaseFrontmatter> = (
  document: ContentDocument<F>,
) => ReactNode;

/** What a collection adds to the shared article page. */
type ArticleSlots<F extends BaseFrontmatter> = {
  /** Over the title. */
  eyebrow?: Slot<F>;
  /** Right of the lede, under the title. */
  mark?: Slot<F>;
  /** Under the header. */
  brief?: Slot<F>;
  /** Inside the body, after its first paragraph. */
  afterLead?: Slot<F>;
  /** Whom the footer's copyright names, in place of the site's author. */
  byline?: Slot<F>;
};

/**
 * Keyed by collection, each entry typed by that collection's own frontmatter,
 * so a dossier's slots read its case file and no router has to pass them in.
 */
export const ARTICLE_SLOTS: {
  [C in ArticleCollectionId]?: ArticleSlots<ArticleFrontmatterOf<C>>;
} = {
  'basilisk-cases': {
    mark: ({ slug }) => <CaseSeal {...{ slug }} />,
    brief: ({ frontmatter }) => <CaseBrief {...{ frontmatter }} />,
    afterLead: ({ frontmatter }) => frontmatter.noAi === true && <NoAiNote />,
  },
  'maya-blog': {
    eyebrow: ({ slug, locale = SITE_CONFIG.locale }) => {
      const number = plateNumber(slug, locale);

      return number !== undefined && <PlateLabel {...{ number, locale }} />;
    },
    byline: ({ locale = SITE_CONFIG.locale }) => <MayaByline {...{ locale }} />,
  },
};
