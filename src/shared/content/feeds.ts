import 'server-only';

import { siteConfig, type SiteId } from '@/shared/config';
import {
  DEFAULT_LOCALE,
  loadMessages,
  type Locale,
  LOCALES,
} from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import type { RssItem } from '@/shared/lib/rss';
import type { Summarized } from '@/shared/typings';

import { ARTICLE_COLLECTIONS, SONGS } from './collection-schemas';
import {
  type CollectionId,
  COLLECTIONS,
  collectionsForSite,
  feedRoutes,
  localizedRoute,
  type Routed,
  type WithCollectionId,
} from './collections';
import { isListed, listPrimaryDocuments, type LocaleRouted } from './documents';
import { filedDate } from './frontmatter';
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
 * A feed's items, newest first. The blurb rather than the body: the body is
 * rendered for the page, and reads wrong anywhere else.
 */
export async function feedEntries({
  collection,
  locale = DEFAULT_LOCALE,
}: Feed): Promise<FeedEntry[]> {
  const entries =
    collection === 'music'
      ? listPrimaryDocuments(SONGS)
          .filter((document) => isListed(document))
          .map(({ route, frontmatter }) => {
            // A locale's own name for the song wins; a gloss keeps the song's.
            const { title, description } = frontmatter[locale];

            return {
              title: typeof title === 'string' ? title : frontmatter.title,
              description,
              route: localizedRoute(route, locale),
              published: filedDate(frontmatter),
            };
          })
      : (await renderPrimaryDocuments(ARTICLE_COLLECTIONS[collection])).map(
          ({ document: { route, frontmatter }, rendered: { title } }) => ({
            title,
            ...pick(frontmatter, 'description'),
            route,
            published: filedDate(frontmatter),
          }),
        );

  return entries.toSorted(
    (a, b) => b.published.getTime() - a.published.getTime(),
  );
}
