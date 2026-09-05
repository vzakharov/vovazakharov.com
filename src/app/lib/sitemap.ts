import type { MetadataRoute } from 'next';

import { getAbsoluteUrl } from '@/shared/config';
import {
  COLLECTION_IDS,
  collectionRoute,
  listAllDocuments,
} from '@/shared/content';
import { routing } from '@/shared/i18n';

/**
 * Every page the site renders. Content entries are derived from the collection
 * registry, so a new document appears here without touching this file.
 */
export function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '/',
    ...routing.locales.map((locale) => `/${locale}/cv`),
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
