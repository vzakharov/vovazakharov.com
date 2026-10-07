import { getAbsoluteUrl, SITE_ID } from '@/shared/config';
import {
  type CollectionId,
  collectionRoute,
  feedEntries,
  listFeeds,
  localizedRoute,
} from '@/shared/content';
import { DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import { renderRss } from '@/shared/lib/rss';

/**
 * A feed route's handler. A route the registry does not list as a feed fails
 * the build here, which is what keeps a stray route file from publishing one.
 */
export function collectionFeed(collection: CollectionId, locale?: Locale) {
  const feed = listFeeds(SITE_ID).find(
    (candidate) =>
      candidate.collection === collection && candidate.locale === locale,
  );

  if (feed === undefined) {
    throw new Error(
      `${collection}${locale === undefined ? '' : ` (${locale})`} publishes no feed on ${SITE_ID}.`,
    );
  }

  return {
    GET: async () => {
      const entries = await feedEntries(feed);
      const rss = renderRss({
        ...pick(feed, 'title', 'description'),
        link: getAbsoluteUrl(
          localizedRoute(collectionRoute(collection), locale),
        ),
        language: locale ?? DEFAULT_LOCALE,
        self: getAbsoluteUrl(feed.route),
        items: entries.map(({ route, ...entry }) => ({
          ...entry,
          link: getAbsoluteUrl(route),
        })),
      });

      return new Response(rss, {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
      });
    },
  };
}
