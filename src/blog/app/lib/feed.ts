import { getAbsoluteUrl, SITE_CONFIG, SITE_ID } from '@/kernel/shared/config';
import { renderRss } from '@/kernel/shared/feed';
import type { Locale } from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';

import {
  articleCollection,
  type ArticleFrontmatter,
  type Collection,
  type CollectionId,
  collectionRoute,
  feedEntries,
  type FeedSource,
  findFeed,
} from '@/blog/shared/content';

/**
 * A collection's RSS route. Named by id, it is read as articles; a collection
 * whose own schema reshapes the article's fields is passed as itself.
 */
export function collectionFeed(
  of: CollectionId | Collection<ArticleFrontmatter>,
  locale?: Locale,
  source?: FeedSource,
) {
  const reader = typeof of === 'string' ? articleCollection(of) : of;
  const collection = reader.id;
  const feed = findFeed(SITE_ID, collection, locale);

  return {
    GET: async () => {
      const language = locale ?? SITE_CONFIG.locale;
      const entries =
        source === undefined
          ? await feedEntries(reader, locale)
          : await source.entries(language);
      const rss = renderRss({
        ...pick(feed, 'title'),
        description: source?.description?.(language) ?? SITE_CONFIG.tagline,
        link: getAbsoluteUrl(collectionRoute(collection, locale)),
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
