import 'server-only';

import type { DocumentFile, PrintedLink } from '@/shared/typings';

import { resolveSiteId } from './site.env.unsafe';
import { siteConfig, withoutScheme } from './site-config';

/**
 * A static export renders once per deploy, so a copyright year is the build's.
 * Shared so the page footer and the printed one cannot disagree.
 */
export const BUILD_YEAR = new Date().getFullYear();

/** Which site is being built, for the consumers that branch on it rather than read its config. */
export const SITE_ID = resolveSiteId();

export const SITE_CONFIG = siteConfig(SITE_ID);

// Helper to get absolute URL
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
