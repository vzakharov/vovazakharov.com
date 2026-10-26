import { getAbsoluteUrl, SITE_CONFIG, SITE_ID } from '@/shared/config';
import {
  type CollectionId,
  collectionRoute,
  feedEntries,
  findFeed,
} from '@/shared/content';
import type { Locale } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import { renderRss } from '@/shared/lib/rss';

import { songFeedEntries, songPodcast } from '@/pages/music';

export function collectionFeed(collection: CollectionId, locale?: Locale) {
  const feed = findFeed(SITE_ID, collection, locale);

  return {
    GET: async () => {
      const entries =
        collection === 'music'
          ? await songFeedEntries(locale ?? SITE_CONFIG.locale)
          : await feedEntries(collection, locale);
      const rss = renderRss({
        ...pick(feed, 'title', 'description'),
        link: getAbsoluteUrl(collectionRoute(collection, locale)),
        language: locale ?? SITE_CONFIG.locale,
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
