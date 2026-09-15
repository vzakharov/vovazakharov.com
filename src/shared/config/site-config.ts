import type { DocumentFile, Linked, Named, WithText } from '@/shared/typings';

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

/** The ids are the source of truth: each names a directory under `apps/`. */
const SITE_IDS = ['vova', 'lsa'] as const;

type SiteId = (typeof SITE_IDS)[number];

/**
 * Which site this build is. Each app pins it in its own `next.config.ts`, and
 * the render scripts pin it in their `package.json` entries, so an unset value
 * means nobody said — the one case that would otherwise publish one site's copy
 * under the other's domain, hence the throw.
 *
 * Matched against the ids rather than parsed by a schema: this module is
 * reached from client components (the CV sheet through `cv-urls`), where zod
 * would land in the chunk — the same ~90 kB `shared/i18n` keeps behind its
 * server-only barrel. Two legal values buy nothing from a parser a lookup does
 * not already give.
 */
const siteId = SITE_IDS.find((id) => id === process.env.NEXT_PUBLIC_SITE);

if (siteId === undefined) {
  throw new Error(
    `NEXT_PUBLIC_SITE must be one of ${SITE_IDS.join(', ')}, not ${String(process.env.NEXT_PUBLIC_SITE)}`,
  );
}

type SiteConfig = Named & {
  url: string;
  /**
   * Leads the name a downloaded document is saved under, standing in for the
   * `url` it cannot spell — a filename is not a URL, so a resolvable host
   * inside one would only be copied out by hand. Short enough to stay legible
   * at a glance, which is the whole of what the name buys.
   */
  downloadPrefix: string;
  /**
   * The offer in one line, as the home page's offer section is headed and as
   * every page that states no description of its own unfurls. The CV header's
   * tagline is deliberately a different, plainer sentence — this one carries
   * the voice.
   */
  tagline: string;
  author: Named & { email: string };
  social: {
    twitter: string;
    github: string;
    linkedin: string;
  };
  /** The file's own pixel size, which the metadata publishes; where the page renders it smaller, that is the page's number. */
  avatar: {
    path: string;
    width: number;
    height: number;
  };
};

/**
 * Both sites under one shape, so a field added for either is a type error at
 * the other until it is answered. `satisfies` rather than an annotation keeps
 * the literal types every call site reads.
 */
const SITE_CONFIGS = {
  vova: {
    url: 'https://vovazakharov.com',
    downloadPrefix: 'vova',
    name: 'Vova Zakharov',
    tagline:
      'Fractional CTO for teams that don’t want to YOLO into the agent era.',
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
      width: 1024,
      height: 1024,
    },
  },
  lsa: {
    url: 'https://latestageagentic.com',
    downloadPrefix: 'lsa',
    name: 'Late Stage Agentic',
    tagline: 'How not to make a mess of agentic coding.',
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
      width: 1024,
      height: 1024,
    },
  },
} as const satisfies Record<SiteId, SiteConfig>;

export const SITE_CONFIG = SITE_CONFIGS[siteId];

// Helper to get absolute URL
export const getAbsoluteUrl = (path: string) => `${SITE_CONFIG.url}${path}`;

/** One page's own file: the route plus an extension, and the saved name `DocumentFile` describes. */
export const pageFile = (route: string, extension: string): DocumentFile => ({
  href: `${route}.${extension}`,
  download: `${SITE_CONFIG.downloadPrefix}${route.replaceAll('/', '.')}.${extension}`,
});

/**
 * How print spells a URL: absolute, because the page leaves the browser that
 * resolved it, and shown without the scheme, which tells a reader holding paper
 * nothing. The two differ, so a printed link can navigate and still read well.
 */
export const printedUrl = (url: string): Linked & WithText => {
  const href = url.startsWith('/') ? getAbsoluteUrl(url) : url;

  return { href, text: href.replace(/^https?:\/\//, '') };
};
