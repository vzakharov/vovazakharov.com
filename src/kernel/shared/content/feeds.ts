import 'server-only';

import {
  getAbsoluteUrl,
  siteConfig,
  type SiteId,
} from '@/kernel/shared/config';
import {
  DEFAULT_LOCALE,
  loadMessages,
  type Locale,
  LOCALES,
} from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';
import { feedHtml } from '@/kernel/shared/lib/feed-html';
import type { RssItem } from '@/kernel/shared/lib/rss';
import type { Summarized } from '@/kernel/shared/typings';

import {
  type CollectionId,
  COLLECTIONS,
  collectionsForSite,
  feedRoutes,
  type Routed,
  type WithCollectionId,
} from './collections';
import type { LocaleRouted } from './documents';
import { articleCollection, filedDate } from './frontmatter';
import { renderPrimaryDocuments } from './render';

export type Feed = WithCollectionId & LocaleRouted & Summarized;

/** An item before its link is made absolute, which is the site's to do. */
export type FeedEntry = Omit<RssItem, 'link'> & Routed;

/**
 * Every feed the site publishes, described by the site's tagline save the
 * songs — the author's tagline sells a CTO, not a record.
 */
export function listFeeds(site: SiteId): Feed[] {
  const { name, tagline } = siteConfig(site);
  const collections = collectionsForSite(site);

  return collections.flatMap((collection) =>
    feedRoutes(collection, LOCALES).map(({ route, locale }) => ({
      collection,
      route,
      locale,
      title: [
        collections.length > 1
          ? `${name} — ${COLLECTIONS[collection].label}`
          : name,
        ...(locale === undefined ? [] : [`(${locale})`]),
      ].join(' '),
      description:
        collection === 'music'
          ? loadMessages(locale ?? DEFAULT_LOCALE).music.metaDescription
          : tagline,
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
 * `pages/music` reads, so the songs feed is built there.
 */
export async function feedEntries(
  collection: CollectionId,
): Promise<FeedEntry[]> {
  return (await renderPrimaryDocuments(articleCollection(collection))).map(
    ({ document: { route, frontmatter }, rendered: { title, tree } }) => ({
      title,
      ...pick(frontmatter, 'description'),
      route,
      published: filedDate(frontmatter),
      content: feedHtml(tree, getAbsoluteUrl),
    }),
  );
}
