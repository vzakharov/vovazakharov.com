export const SITE_CONFIG = {
  url: 'https://vovazakharov.com',
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
