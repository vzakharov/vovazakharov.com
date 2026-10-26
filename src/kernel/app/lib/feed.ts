import { getAbsoluteUrl, SITE_CONFIG, SITE_ID } from '@/kernel/shared/config';
import type { Locale } from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';
import { renderRss } from '@/kernel/shared/lib/rss';

import {
  type CollectionId,
  collectionRoute,
  feedEntries,
  type FeedSource,
  findFeed,
  localizedRoute,
} from '@/blog/shared/content';

export function collectionFeed(
  collection: CollectionId,
  locale?: Locale,
  source?: FeedSource,
) {
  const feed = findFeed(SITE_ID, collection, locale);

  return {
    GET: async () => {
      const language = locale ?? SITE_CONFIG.locale;
      const entries =
        source === undefined
          ? await feedEntries(collection)
          : await source.entries(language);
      const rss = renderRss({
        ...pick(feed, 'title'),
        description: source?.description?.(language) ?? SITE_CONFIG.tagline,
        link: getAbsoluteUrl(
          localizedRoute(collectionRoute(collection), locale),
        ),
        language,
        self: getAbsoluteUrl(feed.route),
        ...(source?.podcast === undefined ? {} : { podcast: source.podcast() }),
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
