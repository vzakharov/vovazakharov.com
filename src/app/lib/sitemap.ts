import type { MetadataRoute } from 'next';

import { getAbsoluteUrl, PAGE_ROUTES } from '@/shared/config';
import {
  COLLECTION_IDS,
  collectionRoute,
  listAllDocuments,
} from '@/shared/content';
import { routing } from '@/shared/i18n';

import { cvRoute } from '@/pages/cv';

/**
 * Every page the site advertises. Content entries are derived from the
 * collection registry, so a new document appears here without touching this
 * file. `/{locale}/cv/cto` is the deliberate omission: it renders what
 * `/{locale}/cv` renders, and listing both twins would ask the crawler to
 * resolve a duplicate the canonical link already resolved.
 */
export function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '/',
    ...Object.values(PAGE_ROUTES),
    ...routing.locales.flatMap((locale) => [
      cvRoute(locale),
      cvRoute(locale, 'dev'),
    ]),
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
