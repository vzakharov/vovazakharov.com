import type { ReactNode } from 'react';

import type { MaybeBylined } from '@/kernel/shared/typings';

import type {
  BaseFrontmatter,
  ContentDocument,
  Headlined,
  WidgetPlaceholder,
} from '@/blog/shared/content';

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
 * The components that render a collection's widgets, by directive name — one
 * for each name its registry entry lists. May be a server component, async
 * included, so a widget fetches at build what it shows.
 */
export type WidgetComponents = Record<
  string,
  (placeholder: WidgetPlaceholder) => ReactNode | Promise<ReactNode>
>;

export type WithWidgets = { widgets?: WidgetComponents };

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
  WithWidgets &
  MaybeBylined & {
    /** Under the header. */
    brief?: ReactNode;
    /** Over the article, in place of the link back to the collection. */
    masthead?: ReactNode;
    /** In place of the shared header, the header slots then unread. */
    header?: (headline: Headlined) => ReactNode;
    /**
     * Drops the outline beside the article, which then reads in one column at
     * the prose's measure.
     */
    outlineless?: boolean;
  };
