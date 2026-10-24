import type { MetadataRoute } from 'next';

import { getAbsoluteUrl, SITE_ID } from '@/kernel/shared/config';
import {
  type CollectionId,
  collectionRoute,
  COLLECTIONS,
  collectionsForSite,
  filedDate,
  isListed,
  listAllDocuments,
  localizedRoute,
} from '@/kernel/shared/content';
import { routing } from '@/kernel/shared/i18n';

/**
 * Which addresses a page in this collection is advertised at. A localized
 * collection lists one per language and not the locale-less alias: the short
 * one renders what its twin renders, and offering both asks the crawler to
 * resolve a duplicate the canonical link already resolved.
 */
function documentAddresses(route: string, collection: CollectionId): string[] {
  return COLLECTIONS[collection].localized
    ? routing.locales.map((locale) => localizedRoute(route, locale))
    : [route];
}

/**
 * Every page the site advertises: the collection indexes and the documents
 * under them, derived from the registry filtered to the site being built, plus
 * `mountedRoutes` — the pages no collection describes, which the site's leaf
 * app gathers from itself and its ancestors. A factory, because the route's
 * default export is called by Next with arguments of its own.
 */
export function sitemap(
  mountedRoutes: readonly string[] = [],
): () => MetadataRoute.Sitemap {
  return () => siteSitemap(mountedRoutes);
}

function siteSitemap(mountedRoutes: readonly string[]): MetadataRoute.Sitemap {
  // Deduplicated because a home-indexed collection's index *is* the home page.
  const staticRoutes = [
    ...new Set([
      '/',
      ...mountedRoutes,
      ...collectionsForSite(SITE_ID).flatMap((id) =>
        documentAddresses(collectionRoute(id), id),
      ),
    ]),
  ];

  return [
    ...staticRoutes.map((route) => ({ url: getAbsoluteUrl(route) })),
    ...listAllDocuments(SITE_ID)
      .filter((document) => isListed(document))
      .flatMap(({ route, collection, frontmatter }) =>
        documentAddresses(route, collection).map((address) => ({
          url: getAbsoluteUrl(address),
          lastModified: filedDate(frontmatter),
        })),
      ),
  ];
}
