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
