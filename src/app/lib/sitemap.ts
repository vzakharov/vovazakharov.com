import type { MetadataRoute } from 'next';

import {
  getAbsoluteUrl,
  PAGE_ROUTES,
  SITE_ID,
  WHISPER_ROUTE,
} from '@/shared/config';
import {
  type CollectionId,
  collectionRoute,
  COLLECTIONS,
  collectionsForSite,
  filedDate,
  isListed,
  listAllDocuments,
  localizedRoute,
} from '@/shared/content';
import { routing } from '@/shared/i18n';

import { CV_SUBPAGES, CV_VARIANTS, cvPath } from '@/pages/cv';
import { musicCatalogueRoutes } from '@/pages/music';

/**
 * Which addresses a page in this collection is advertised at. A localized
 * collection lists one per language and not the locale-less alias, for the same
 * reason the CV lists only its fully-specified addresses: the short one renders
 * what its twin renders, and offering both asks the crawler to resolve a
 * duplicate the canonical link already resolved.
 */
function documentAddresses(route: string, collection: CollectionId): string[] {
  return COLLECTIONS[collection].localized === false
    ? [route]
    : routing.locales.map((locale) => localizedRoute(route, locale));
}

/**
 * The pages `vova` advertises on top of what every site does, the CV's shorter
 * addresses left out for the reason above.
 */
function vovaRoutes(): string[] {
  return [
    ...Object.values(PAGE_ROUTES),
    ...routing.locales.flatMap((locale) =>
      CV_VARIANTS.flatMap((variant) => [
        cvPath(variant, locale),
        ...CV_SUBPAGES.map((subpage) => cvPath(variant, locale, subpage)),
      ]),
    ),
    ...musicCatalogueRoutes(),
  ];
}

/**
 * Every page the site advertises. Both the collection indexes and the documents
 * under them are derived from the registry, filtered to the site being built, so
 * a new document appears here without touching this file.
 */
export function sitemap(): MetadataRoute.Sitemap {
  // Deduplicated because a home-indexed collection's index *is* the home page.
  const staticRoutes = [
    ...new Set([
      '/',
      ...(SITE_ID === 'vova' ? vovaRoutes() : []),
      ...(SITE_ID === 'maya' ? [WHISPER_ROUTE] : []),
      ...collectionsForSite(SITE_ID).flatMap((id) =>
        documentAddresses(collectionRoute(id), id),
      ),
    ]),
  ];

  return [
    ...staticRoutes.map((route) => ({ url: getAbsoluteUrl(route) })),
    ...listAllDocuments(SITE_ID)
      .filter((document) => isListed(document))
      // A document already in one language is advertised at its own address.
      .flatMap(({ route, collection, locale, frontmatter }) =>
        (locale === undefined
          ? documentAddresses(route, collection)
          : [route]
        ).map((address) => ({
          url: getAbsoluteUrl(address),
          lastModified: filedDate(frontmatter),
        })),
      ),
  ];
}
