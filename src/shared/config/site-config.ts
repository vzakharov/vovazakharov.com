/**
 * A static export renders once per deploy, so the year a copyright line shows
 * is the year the site was built. Shared because the page footer and the PDF's
 * printed one must not disagree.
 */
export const BUILD_YEAR = new Date().getFullYear();

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
 * The same URL with its scheme dropped, for print — paper carries no click, so
 * `https://` is six characters that tell the reader nothing. A link that shows
 * this still points at `getAbsoluteUrl`, so navigation is unaffected.
 */
export const getBareUrl = (path: string) =>
  getAbsoluteUrl(path).replace(/^https?:\/\//, '');
