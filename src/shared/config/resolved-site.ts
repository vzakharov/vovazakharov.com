import type { DocumentFile, PrintedLink } from '@/shared/typings';

import { siteConfig, withoutScheme } from './site-config';
import { resolveSiteId } from './site-env';

/** Which site is being built, for the consumers that branch on it rather than read its config. */
export const SITE_ID = resolveSiteId();

export const SITE_CONFIG = siteConfig(SITE_ID);

export const getAbsoluteUrl = (path: string) => `${SITE_CONFIG.url}${path}`;

/** `getAbsoluteUrl` undone: this site's own URL as a site-root path, any other as it stands. */
export const siteRootPath = (url: string) =>
  url.startsWith(`${SITE_CONFIG.url}/`) ? url.slice(SITE_CONFIG.url.length) : url;

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

/** A page on the web outside this site, which opens in a tab of its own. */
export const isOffSite = (url: string) =>
  /^https?:/i.test(url) &&
  new URL(url).origin !== new URL(SITE_CONFIG.url).origin;
