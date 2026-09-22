import type { DocumentFile, PrintedLink } from '@/shared/typings';

import { siteConfig, withoutScheme } from './site-config';
import { resolveSiteId } from './site-env';

/** Which site is being built, for the consumers that branch on it rather than read its config. */
export const SITE_ID = resolveSiteId();

export const SITE_CONFIG = siteConfig(SITE_ID);

export const getAbsoluteUrl = (path: string) => `${SITE_CONFIG.url}${path}`;

/** One page's own file: the route plus an extension, and the saved name `DocumentFile` describes. */
export const pageFile = (route: string, extension: string): DocumentFile => ({
  href: `${route}.${extension}`,
  download: `${SITE_CONFIG.downloadPrefix}${route.replaceAll('/', '.')}.${extension}`,
});

/**
 * A URL as paper carries it. The href and the text differ, so a printed link
 * can navigate and still read well.
 */
export const printedUrl = (url: string): PrintedLink => {
  const href = url.startsWith('/') ? getAbsoluteUrl(url) : url;

  return { href, text: withoutScheme(href) };
};
