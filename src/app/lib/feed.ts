import { getAbsoluteUrl, SITE_ID } from '@/shared/config';
import {
  type CollectionId,
  collectionRoute,
  feedEntries,
  findFeed,
  localizedRoute,
} from '@/shared/content';
import { DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import { renderRss } from '@/shared/lib/rss';

/** A feed route's handler. */
export function collectionFeed(collection: CollectionId, locale?: Locale) {
  const feed = findFeed(SITE_ID, collection, locale);

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
