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

import { songFeedEntries, songPodcast } from '@/pages/music';

export function collectionFeed(collection: CollectionId, locale?: Locale) {
  const feed = findFeed(SITE_ID, collection, locale);

  return {
    GET: async () => {
      const entries =
        collection === 'music'
          ? await songFeedEntries(locale ?? DEFAULT_LOCALE)
          : await feedEntries(collection);
      const rss = renderRss({
        ...pick(feed, 'title', 'description'),
        link: getAbsoluteUrl(
          localizedRoute(collectionRoute(collection), locale),
        ),
        language: locale ?? DEFAULT_LOCALE,
        self: getAbsoluteUrl(feed.route),
        ...(collection === 'music' ? { podcast: songPodcast() } : {}),
        items: entries
          .toSorted((a, b) => b.published.getTime() - a.published.getTime())
          .map(({ route, ...entry }) => ({
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
