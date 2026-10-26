import 'server-only';

import type { Metadata } from 'next';

import { SITE_ID } from '@/kernel/shared/config';
import {
  constructMetadata as constructSiteMetadata,
  type ConstructMetadataParams,
  localizedAddresses,
} from '@/kernel/shared/seo/index.server-only';
import type { Described } from '@/kernel/shared/typings';

import {
  type BaseFrontmatter,
  type ContentDocument,
  documentRoute,
  listFeeds,
} from '@/blog/shared/content';

/** kernel's, advertising the feeds the site's collections publish. */
export function constructMetadata(params?: ConstructMetadataParams): Metadata {
  return constructSiteMetadata(params, listFeeds(SITE_ID));
}

/**
 * Article metadata, routed through `constructMetadata` so a content page's
 * cards are built the same way as the rest of the site's. The title comes from
 * the rendered document rather than from frontmatter — the markdown's own
 * leading heading is the one copy of it.
 */
export function constructArticleMetadata(
  document: ContentDocument<BaseFrontmatter & Described>,
  title: string,
): Metadata {
  const { frontmatter, route, ogImageUrl, ogImageSize, locale } = document;
  const { collection, slug, variant } = document;
  const { description, hidden } = frontmatter;

  return constructMetadata({
    title,
    description,
    path: route,
    locale,
    ...(locale !== undefined &&
      localizedAddresses(
        (alternate) => documentRoute(collection, slug, variant, alternate),
        locale,
      )),
    ogType: 'article',
    ogImage: ogImageUrl,
    ogImageSize,
    hidden,
  });
}
