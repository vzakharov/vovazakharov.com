import type { MetadataRoute } from 'next';

import { getAbsoluteUrl, PAGE_ROUTES, SITE_ID } from '@/shared/config';
import {
  type CollectionId,
  collectionRoute,
  COLLECTIONS,
  collectionsForSite,
  listAllDocuments,
  localizedRoute,
} from '@/shared/content';
import { routing } from '@/shared/i18n';

import { CV_VARIANTS, cvPath } from '@/pages/cv';

/**
 * Which addresses a page in this collection is advertised at. A localized
 * collection lists one per language and not the locale-less alias, for the same
 * reason the CV lists only its fully-specified addresses: the short one renders
 * what its twin renders, and offering both asks the crawler to resolve a
 * duplicate the canonical link already resolved.
 */
function documentAddresses(route: string, collection: CollectionId): string[] {
  return COLLECTIONS[collection].localized
    ? routing.locales.map((locale) => localizedRoute(route, locale))
    : [route];
}

/**
 * The CV's addresses, which `vova` advertises on top of what every site does,
 * its shorter ones left out for the reason above.
 */
function cvRoutes(): string[] {
  return routing.locales.flatMap((locale) =>
    CV_VARIANTS.map((variant) => cvPath(variant, locale)),
  );
}

/**
 * Every page the site advertises. Both the collection indexes and the documents
 * under them are derived from the registry, filtered to the site being built, so
 * a new document appears here without touching this file.
 */
export function sitemap(): MetadataRoute.Sitemap {
  // Deduplicated because a rooted collection's index *is* the home page.
  const staticRoutes = [
    ...new Set([
      '/',
      ...Object.values<string>(PAGE_ROUTES[SITE_ID]),
      ...(SITE_ID === 'vova' ? cvRoutes() : []),
      ...collectionsForSite(SITE_ID).flatMap((id) =>
        documentAddresses(collectionRoute(id), id),
      ),
    ]),
  ];

  return [
    ...staticRoutes.map((route) => ({ url: getAbsoluteUrl(route) })),
    ...listAllDocuments(SITE_ID).flatMap(({ route, collection, frontmatter }) =>
      documentAddresses(route, collection).map((address) => ({
        url: getAbsoluteUrl(address),
        lastModified: frontmatter.date,
      })),
    ),
  ];
}
