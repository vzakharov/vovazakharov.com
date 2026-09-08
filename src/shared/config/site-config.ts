import type { Linked, WithText } from '@/shared/typings';

/**
 * A static export renders once per deploy, so a copyright year is the build's.
 * Shared so the page footer and the printed one cannot disagree.
 */
export const BUILD_YEAR = new Date().getFullYear();

/**
 * The unlocalized standalone pages. Below `pages/` because the footer that
 * links them is a different slice from the pages themselves, and slices may not
 * reach each other sideways; the CV and the collections shape their own URLs.
 */
export const PAGE_ROUTES = {
  writing: '/writing',
  music: '/music',
} as const;

export const SITE_CONFIG = {
  url: 'https://vovazakharov.com',
  /**
   * Leads the name a downloaded document is saved under, standing in for the
   * `url` it cannot spell — a filename is not a URL, so a resolvable host
   * inside one would only be copied out by hand. Short enough to stay legible
   * at a glance, which is the whole of what the name buys.
   */
  downloadPrefix: 'vova',
  name: 'Vova Zakharov',
  author: {
    name: 'Vova Zakharov',
    email: 'vzakharov@gmail.com',
  },
  social: {
    twitter: '@vovahimself',
    github: 'vzakharov',
    linkedin: 'vovahimself',
  },
  avatar: {
    path: '/ava.png',
    width: 150,
    height: 150,
  },
} as const;

// Helper to get absolute URL
export const getAbsoluteUrl = (path: string) => `${SITE_CONFIG.url}${path}`;

/**
 * How print spells a URL: absolute, because the page leaves the browser that
 * resolved it, and shown without the scheme, which tells a reader holding paper
 * nothing. The two differ, so a printed link can navigate and still read well.
 */
export const printedUrl = (url: string): Linked & WithText => {
  const href = url.startsWith('/') ? getAbsoluteUrl(url) : url;

  return { href, text: href.replace(/^https?:\/\//, '') };
};
