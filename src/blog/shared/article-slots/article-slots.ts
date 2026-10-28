import type { ReactNode } from 'react';

import type { MaybeBylined } from '@/kernel/shared/typings';

import type { BaseFrontmatter, ContentDocument } from '@/blog/shared/content';

/** The article header's two places. */
export type HeaderSlots = {
  /** Over the title. */
  eyebrow?: ReactNode;
  /** Right of the lede, under the title. */
  mark?: ReactNode;
};

/** Rendered after the body's first paragraph, or first in a body with none. */
export type WithAfterLead = { afterLead?: ReactNode };

/**
 * What a collection adds to the shared article page, typed by its own
 * frontmatter: one call per document, filling any of the page's places, the
 * footer's byline among them. The app owning the collection states it and its
 * router passes it in, so the page never names an app below it.
 */
export type ArticleSlots<F extends BaseFrontmatter> = (
  document: ContentDocument<F>,
) => HeaderSlots &
  WithAfterLead &
  MaybeBylined & {
    /** Under the header. */
    brief?: ReactNode;
  };
