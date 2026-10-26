import 'server-only';

import { getAbsoluteUrl, siteConfig, type SiteId } from '@/shared/config';
import {
  DEFAULT_LOCALE,
  inLocale,
  loadMessages,
  type Locale,
  LOCALES,
} from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import { feedHtml } from '@/shared/lib/feed-html';
import type { UnlinkedRssItem } from '@/shared/lib/rss';
import type { Summarized } from '@/shared/typings';

import {
  ARTICLE_COLLECTIONS,
  type ArticleCollectionId,
} from './collection-schemas';
import {
  type CollectionId,
  COLLECTIONS,
  collectionsForSite,
  feedRoutes,
  type Routed,
  type WithCollectionId,
} from './collections';
import type { LocaleRouted } from './documents';
import { filedDate } from './frontmatter';
import { renderPrimaryDocuments } from './render';

export type Feed = WithCollectionId & LocaleRouted & Summarized;

/** An item before its link is made absolute, which is the site's to do. */
export type FeedEntry = UnlinkedRssItem & Routed;

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
          ? `${name} — ${inLocale(COLLECTIONS[collection].label, locale ?? siteConfig(site).locale)}`
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
  collection: ArticleCollectionId,
): Promise<FeedEntry[]> {
  return (await renderPrimaryDocuments(ARTICLE_COLLECTIONS[collection])).map(
    ({ document: { route, frontmatter }, rendered: { title, tree } }) => ({
      title,
      ...pick(frontmatter, 'description'),
      route,
      published: filedDate(frontmatter),
      content: feedHtml(tree, getAbsoluteUrl),
    }),
  );
}
