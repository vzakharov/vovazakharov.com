import type { ReactNode } from 'react';

import type { BaseFrontmatter, ContentDocument } from '@/blog/shared/content';

type Slot<F extends BaseFrontmatter> = (
  document: ContentDocument<F>,
) => ReactNode;

/**
 * What a collection adds to the shared article page, typed by its own
 * frontmatter. The app owning the collection states them and its router passes
 * them in, so the page never names an app below it.
 */
export type ArticleSlots<F extends BaseFrontmatter> = {
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
