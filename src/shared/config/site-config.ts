/**
 * Every site's configuration as data, with nothing bound to the site this
 * process happens to be — that binding is `resolved-site.ts`, which is
 * `server-only`. The split is what lets a client component and a render script
 * each read what they need without the environment read coming along.
 */

import type {
  Billed,
  Linked,
  Named,
  PresentOrAbsent,
  Sized,
} from '@/shared/typings';

import type { SiteId } from './site-ids';

/**
 * The unlocalized standalone pages. Below `pages/` because the footer that
 * links them is a different slice from the pages themselves, and slices may not
 * reach each other sideways; the CV and the collections shape their own URLs.
 */
export const PAGE_ROUTES = {
  writing: '/writing',
} as const;

/**
 * One of a site's own marks, as up to two files. `path` is the canonical one —
 * what the metadata publishes, and what a page renders unless `vector` says
 * otherwise; `vector` is the same drawing as SVG, and exists only where `path`
 * had to be a raster, no Open Graph consumer rendering one.
 *
 * So a mark no card ever unfurls states its SVG as `path` and carries no
 * `vector`, rather than the other way round; `vector` is a string where it is
 * there and absent where it is not, never a nullable slot. `pnpm
 * content:og:<site>` rasterises `path` from `vector` for the marks that are both.
 */
export type SiteImage = Sized & { path: string } & PresentOrAbsent<
    'vector',
    string
  >;

/**
 * Whom a site's materials are credited to, and where that credit links. Named
 * only where the materials are published under something other than the site
 * itself — the Bible's are the agency's — so the credit points a reader of an
 * article at the agency rather than at the author's own page.
 */
type SiteCredit = Named & Linked;

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
  avatar: SiteImage;
  /**
   * The site's unlettered mark: what an article closes on in place of an amen,
   * and what the home page's seal is left showing once a held pointer fades
   * `avatar.vector`'s lettering off it. Spelled rather than left optional — an
   * omitted key is silently absent, and a new site should have to answer this
   * one.
   */
  seal: SiteImage | undefined;
  /**
   * The copyright on this site's materials, and where it links — `undefined`
   * where the site credits itself and its own name stands unlinked. Spelled by
   * every site for the same reason `seal` is: a new one should have to answer
   * whether its work is its own or published under another name.
   */
  credit: SiteCredit | undefined;
};

/** One person publishes every site, so none of them owns the byline. */
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

/** One path and one size for the two portrait sites, a different image behind each. */
const AVATAR = {
  path: '/ava.png',
  width: 1024,
  height: 1024,
} as const;

/** Both cuts of the seal are one drawing, so one square covers them. */
const SEAL_SIZE = { width: 1024, height: 1024 } as const;

/**
 * The Bible's materials are the agency's, so they credit it and link to its
 * hub — an article is the top of the funnel into Late Stage Agentic, not a
 * page of the author's.
 */
const LSA_CREDIT = {
  name: 'Late Stage Agentic',
  href: 'https://latestageagentic.com',
} as const;

/**
 * Every site under one shape, so a field added for one is a type error at the
 * rest until it is answered.
 */
const SITE_CONFIGS: Record<SiteId, SiteConfig> = {
  vova: {
    url: 'https://vovazakharov.com',
    downloadPrefix: 'vova',
    name: 'Vova Zakharov',
    tagline:
      'Fractional CTO for teams that don’t want to YOLO into the agent era.',
    avatar: AVATAR,
    seal: undefined,
    credit: undefined,
    ...PUBLISHER,
  },
  lsa: {
    url: 'https://latestageagentic.com',
    downloadPrefix: 'lsa',
    name: 'Late Stage Agentic',
    tagline: 'How not to make a mess of agentic coding.',
    avatar: AVATAR,
    seal: undefined,
    credit: undefined,
    ...PUBLISHER,
  },
  bible: {
    url: 'https://agentic.bible',
    downloadPrefix: 'bible',
    name: 'The Agentic Bible',
    tagline:
      'Articles on agentic coding that take a position and show the grounds under it.',
    // The lettered cut, whose card is rasterised from the vector beside it by
    // `pnpm content:og:bible` — no Open Graph consumer renders an SVG.
    avatar: {
      path: '/ava.og.png',
      vector: '/seal-lettered.svg',
      ...SEAL_SIZE,
    },
    seal: { path: '/seal.svg', ...SEAL_SIZE },
    credit: LSA_CREDIT,
    ...PUBLISHER,
  },
};

/** One site's configuration by id, for the render scripts, which resolved theirs at the top of the run. */
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
