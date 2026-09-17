/**
 * Both sites' configuration as data, with nothing bound to the site this
 * process happens to be — that binding is `resolved-site.ts`, which is
 * `server-only`. Keeping the two apart is what lets a client component and a
 * render script each read what they need without dragging the environment read
 * and its schema along.
 */

import type { Billed, Named } from '@/shared/typings';

import type { SiteId } from './site-ids';

/**
 * The unlocalized standalone pages. Below `pages/` because the footer that
 * links them is a different slice from the pages themselves, and slices may not
 * reach each other sideways; the CV and the collections shape their own URLs.
 */
export const PAGE_ROUTES = {
  writing: '/writing',
  music: '/music',
} as const;

/**
 * The tagline is the offer in one line, as the home page's offer section is
 * headed and as every page that states no description of its own unfurls. The
 * CV header's is deliberately a different, plainer sentence — this one carries
 * the voice.
 */
export type SiteConfig = Billed & {
  url: string;
  /**
   * Leads the name a downloaded document is saved under, standing in for the
   * `url` it cannot spell — a filename is not a URL, so a resolvable host
   * inside one would only be copied out by hand. Short enough to stay legible
   * at a glance, which is the whole of what the name buys.
   */
  downloadPrefix: string;
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

/** One person publishes both sites, so neither of them owns the byline. */
const PUBLISHER = {
  author: {
    name: 'Vova Zakharov',
    email: 'vzakharov@gmail.com',
  },
  social: {
    twitter: '@vovahimself',
    github: 'vzakharov',
    linkedin: 'vovahimself',
  },
} as const;

/** One path and one size for both sites, a different image behind each. */
const AVATAR = {
  path: '/ava.png',
  width: 1024,
  height: 1024,
} as const;

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
    avatar: AVATAR,
    ...PUBLISHER,
  },
  lsa: {
    url: 'https://latestageagentic.com',
    downloadPrefix: 'lsa',
    name: 'Late Stage Agentic',
    tagline: 'How not to make a mess of agentic coding.',
    avatar: AVATAR,
    ...PUBLISHER,
  },
} as const satisfies Record<SiteId, SiteConfig>;

/**
 * One site's configuration by id, for a caller that knows its site without the
 * environment telling it — the render scripts, which resolved theirs once at
 * the top of the run.
 */
export function siteConfig(site: SiteId) {
  return SITE_CONFIGS[site];
}

/**
 * The author's own site, which every other site's byline links to. Read off
 * that site's config rather than spelled again, so the domain has one home.
 */
export const AUTHOR_URL = SITE_CONFIGS.vova.url;

/** How a URL reads off paper, where a scheme tells the holder nothing. */
export const withoutScheme = (url: string) => url.replace(/^https?:\/\//, '');
