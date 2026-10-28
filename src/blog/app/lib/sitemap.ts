import { SITE_ID } from '@/kernel/shared/config';
import { routing } from '@/kernel/shared/i18n';
import { sitemap as siteSitemap } from '@/kernel/app/lib';

import {
  type CollectionId,
  collectionRoute,
  COLLECTIONS,
  collectionsForSite,
  filedDate,
  isListed,
  listAllDocuments,
  localizedRoute,
} from '@/blog/shared/content';

/**
 * Which addresses a page in this collection is advertised at. A localized
 * collection lists one per language and not the locale-less alias: the short
 * one renders what its twin renders, and offering both asks the crawler to
 * resolve a duplicate the canonical link already resolved.
 */
function documentAddresses(route: string, collection: CollectionId): string[] {
  return COLLECTIONS[collection].localized === false
    ? [route]
    : routing.locales.map((locale) => localizedRoute(route, locale));
}

/**
 * kernel's, adding the collection indexes and the documents under them,
 * derived from the registry filtered to the site being built, to
 * `mountedRoutes` — the pages no collection describes.
 */
export function sitemap(mountedRoutes: readonly string[] = []) {
  return siteSitemap(() => [
    ...mountedRoutes.map((route) => ({ route })),
    ...collectionsForSite(SITE_ID).flatMap((id) =>
      documentAddresses(collectionRoute(id), id).map((route) => ({ route })),
    ),
    ...listAllDocuments(SITE_ID)
      .filter((document) => isListed(document))
      // A document already in one language is advertised at its own address.
      .flatMap(({ route, collection, locale, frontmatter }) =>
        (locale === undefined
          ? documentAddresses(route, collection)
          : [route]
        ).map((address) => ({
          route: address,
          lastModified: filedDate(frontmatter),
        })),
      ),
  ]);
}
