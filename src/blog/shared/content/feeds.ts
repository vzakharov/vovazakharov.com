import 'server-only';

import {
  getAbsoluteUrl,
  siteConfig,
  type SiteId,
} from '@/kernel/shared/config';
import { inLocale, type Locale, LOCALES } from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';
import { feedHtml } from '@/kernel/shared/lib/feed-html';
import type { RssPodcast, UnlinkedRssItem } from '@/kernel/shared/lib/rss';
import type { Routed, Titled } from '@/kernel/shared/typings';

import {
  type CollectionId,
  COLLECTIONS,
  collectionsForSite,
  feedRoutes,
} from './collections';
import type { RoutedInCollection } from './documents';
import { articleCollection, filedDate } from './frontmatter';
import { renderPrimaryDocuments } from './render';

export type Feed = RoutedInCollection & Titled;

/** An item before its link is made absolute, which is the site's to do. */
export type FeedEntry = UnlinkedRssItem & Routed;

/**
 * A feed's items in one language, and what makes it a podcast where it is one.
 * A collection read as articles has a source of its own; any other is fed by
 * the app that owns its schema. A source with no `description` is described by
 * the site's tagline; the songs' brings its own, since the author's tagline
 * sells a CTO, not a record.
 */
export type FeedSource = {
  entries: (locale: Locale) => Promise<FeedEntry[]>;
  description?: (locale: Locale) => string;
  podcast?: () => RssPodcast;
};

export function listFeeds(site: SiteId): Feed[] {
  const { name } = siteConfig(site);
  const collections = collectionsForSite(site);

  return collections.flatMap((collection) =>
    feedRoutes(collection, LOCALES).map(({ route, locale }) => ({
      collection,
      route,
      locale,
      title: [
        collections.length > 1
          ? `${name} — ${inLocale(COLLECTIONS[collection].label, locale ?? siteConfig(site).locale)}`
          : name,
        ...(locale === undefined ? [] : [`(${locale})`]),
      ].join(' '),
    })),
  );
}

/**
 * The one feed a collection publishes in a language — the throw is what fails
 * the build on a route file or a link to a feed the registry does not list.
 */
export function findFeed(
  site: SiteId,
  collection: CollectionId,
  locale?: Locale,
): Feed {
  const feed = listFeeds(site).find(
    (candidate) =>
      candidate.collection === collection && candidate.locale === locale,
  );

  if (feed === undefined) {
    throw new Error(
      `${collection}${locale === undefined ? '' : ` (${locale})`} publishes no feed on ${site}.`,
    );
  }

  return feed;
}

/**
 * An article feed's items: the blurb in `description` for a reader's list, the
 * body as HTML for its reading pane. A song's item is cut from markers only
 * music's catalogue reads, so the songs feed is music's own `SONG_FEED`.
 */
export async function feedEntries(
  collection: CollectionId,
  locale?: Locale,
): Promise<FeedEntry[]> {
  return (
    await renderPrimaryDocuments(articleCollection(collection), locale)
  ).map(({ document: { route, frontmatter }, rendered: { title, tree } }) => ({
    title,
    ...pick(frontmatter, 'description'),
    route,
    published: filedDate(frontmatter),
    content: feedHtml(tree, getAbsoluteUrl),
  }));
}
