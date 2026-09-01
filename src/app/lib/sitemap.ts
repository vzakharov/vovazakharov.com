import type { MetadataRoute } from 'next';

import { getAbsoluteUrl } from '@/shared/config';
import { routing } from '@/shared/i18n';
import {
  COLLECTIONS,
  COLLECTION_IDS,
  listAllDocuments,
} from '@/shared/lib/content';

/**
 * Every page the site renders. Content entries are derived from the collection
 * registry, so a new document appears here without touching this file.
 */
export function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '/',
    ...routing.locales.map((locale) => `/${locale}/cv`),
    ...COLLECTION_IDS.map((id) => COLLECTIONS[id].routeBase),
  ];

  return [
    ...staticRoutes.map((route) => ({ url: getAbsoluteUrl(route) })),
    ...listAllDocuments().map((document) => ({
      url: getAbsoluteUrl(document.route),
      lastModified: document.frontmatter.date,
    })),
  ];
}
