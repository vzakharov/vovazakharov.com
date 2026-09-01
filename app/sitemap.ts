import type { MetadataRoute } from 'next';

import { routing } from '@/i18n/routing';
import { COLLECTION_IDS, COLLECTIONS } from '@/lib/content/collections';
import { listAllDocuments } from '@/lib/content/documents';
import { getAbsoluteUrl } from '@/lib/site-config';

// `output: 'export'` has no request-time rendering, so the route must declare
// that it is written once at build time.
export const dynamic = 'force-static';

/**
 * Every page the site renders. Content entries are derived from the collection
 * registry, so a new document appears here without touching this file.
 */
export default function sitemap(): MetadataRoute.Sitemap {
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
