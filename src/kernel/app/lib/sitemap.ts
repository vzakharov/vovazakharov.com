import type { MetadataRoute } from 'next';

import { getAbsoluteUrl } from '@/kernel/shared/config';
import type { Routed } from '@/kernel/shared/typings';

type SitemapPage = Routed & { lastModified?: Date };

/**
 * Every page the site advertises: `/`, and the `pages` the site's leaf app
 * gathers from itself and its ancestors. A factory, because the route's default
 * export is called by Next with arguments of its own; `pages` a thunk, because
 * reading them is the build's work and not the import's.
 */
export function sitemap(
  pages: () => readonly SitemapPage[] = () => [],
): () => MetadataRoute.Sitemap {
  return () => {
    const advertised = new Map<string, SitemapPage>();

    // First one wins, so `/` keeps its place when a page also names it.
    for (const page of [{ route: '/' }, ...pages()]) {
      if (!advertised.has(page.route)) advertised.set(page.route, page);
    }

    return [...advertised.values()].map(({ route, lastModified }) => ({
      url: getAbsoluteUrl(route),
      ...(lastModified === undefined ? {} : { lastModified }),
    }));
  };
}
