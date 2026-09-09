import type { MetadataRoute } from 'next';

import { getAbsoluteUrl, PAGE_ROUTES } from '@/shared/config';
import {
  COLLECTION_IDS,
  collectionRoute,
  listAllDocuments,
} from '@/shared/content';
import { routing } from '@/shared/i18n';

import { CV_VARIANTS, cvPath } from '@/pages/cv';

/**
 * Every page the site advertises. Content entries are derived from the
 * collection registry, so a new document appears here without touching this
 * file. The CV's shorter addresses are the deliberate omission: each renders
 * what its fully-specified twin renders, and listing both would ask the
 * crawler to resolve a duplicate the canonical link already resolved.
 */
export function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '/',
    ...Object.values(PAGE_ROUTES),
    ...routing.locales.flatMap((locale) =>
      CV_VARIANTS.map((variant) => cvPath(variant, locale)),
    ),
    ...COLLECTION_IDS.map((id) => collectionRoute(id)),
  ];

  return [
    ...staticRoutes.map((route) => ({ url: getAbsoluteUrl(route) })),
    ...listAllDocuments().map((document) => ({
      url: getAbsoluteUrl(document.route),
      lastModified: document.frontmatter.date,
    })),
  ];
}
