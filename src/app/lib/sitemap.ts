import type { MetadataRoute } from 'next';

import { getAbsoluteUrl, PAGE_ROUTES } from '@/shared/config';
import {
  COLLECTION_IDS,
  type CollectionId,
  collectionRoute,
  COLLECTIONS,
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
 * Every page the site advertises. Content entries are derived from the
 * collection registry, so a new document appears here without touching this
 * file, and the CV's shorter addresses are left out for the reason above.
 */
export function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '/',
    ...Object.values(PAGE_ROUTES),
    ...routing.locales.flatMap((locale) =>
      CV_VARIANTS.map((variant) => cvPath(variant, locale)),
    ),
    ...COLLECTION_IDS.flatMap((id) => documentAddresses(collectionRoute(id), id)),
  ];

  return [
    ...staticRoutes.map((route) => ({ url: getAbsoluteUrl(route) })),
    ...listAllDocuments().flatMap(({ route, collection, frontmatter }) =>
      documentAddresses(route, collection).map((address) => ({
        url: getAbsoluteUrl(address),
        lastModified: frontmatter.date,
      })),
    ),
  ];
}
