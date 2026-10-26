import 'server-only';

import type { Metadata } from 'next';

import { SITE_ID } from '@/kernel/shared/config';
import {
  type ConstructMetadataParams,
  constructMetadata as constructSiteMetadata,
} from '@/kernel/shared/seo/index.server-only';
import type { Described } from '@/kernel/shared/typings';

import {
  type BaseFrontmatter,
  type ContentDocument,
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
  const { frontmatter, route, ogImageUrl, ogImageSize } = document;
  const { description, hidden } = frontmatter;

  return constructMetadata({
    title,
    description,
    path: route,
    ogType: 'article',
    ogImage: ogImageUrl,
    ogImageSize,
    hidden,
  });
}
