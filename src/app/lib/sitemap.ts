import type { MetadataRoute } from 'next';

import { getAbsoluteUrl, PAGE_ROUTES, SITE_ID } from '@/shared/config';
import {
  collectionRoute,
  collectionsForSite,
  listAllDocuments,
} from '@/shared/content';
import { routing } from '@/shared/i18n';

import { CV_VARIANTS, cvPath } from '@/pages/cv';

/**
 * The pages `vova` advertises on top of what every site does. The CV's shorter
 * addresses are the deliberate omission: each renders what its fully-specified
 * twin renders, and listing both would ask the crawler to resolve a duplicate
 * the canonical link already resolved.
 */
function vovaRoutes(): string[] {
  return [
    ...Object.values(PAGE_ROUTES),
    ...routing.locales.flatMap((locale) =>
      CV_VARIANTS.map((variant) => cvPath(variant, locale)),
    ),
  ];
}

/**
 * Every page the site advertises. Both the collection indexes and the documents
 * under them are derived from the registry, filtered to the site being built, so
 * a new document appears here without touching this file.
 */
export function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '/',
    ...(SITE_ID === 'vova' ? vovaRoutes() : []),
    ...collectionsForSite(SITE_ID).map((id) => collectionRoute(id)),
  ];

  return [
    ...staticRoutes.map((route) => ({ url: getAbsoluteUrl(route) })),
    ...listAllDocuments(SITE_ID).map((document) => ({
      url: getAbsoluteUrl(document.route),
      lastModified: document.frontmatter.date,
    })),
  ];
}
