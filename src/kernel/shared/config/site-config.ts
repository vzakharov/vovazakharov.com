/**
 * Every site's configuration as data, with nothing bound to the site this
 * process happens to be — that binding is `resolved-site.ts`, which is
 * `server-only`. The split is what lets a client component and a render script
 * each read what they need without the environment read coming along.
 */

import type { WithLocale } from '@/kernel/shared/i18n';
import type {
  Billed,
  Named,
  PresentOrAbsent,
  Sized,
  WithLink,
  WithPath,
  WithUrl,
} from '@/kernel/shared/typings';

import { PIXELS } from './og-canvas';
import type { SiteId } from './site-ids';

/**
 * The unlocalized standalone pages. Below `pages/` because the footer that
 * links them is a different slice from the pages themselves, and slices may not
 * reach each other sideways; the CV and the collections shape their own URLs.
 */
export const PAGE_ROUTES = {
  writing: '/writing',
  mushrooms: '/mushrooms',
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
 * content:og <site>` rasterises `path` from `vector` for the marks that are both.
 */
export type SiteImage = Sized & WithPath & PresentOrAbsent<'vector', string>;

/**
 * Whom a site's materials are credited to, and where that credit links. Named
 * only where the materials are published under something other than the site
 * itself — the Bible's are the agency's — so the credit points a reader of an
 * article at the agency rather than at the author's own page.
 */
type SiteCredit = Named & WithLink;

export type WithAvatar = {
  /** The file's own pixel size, which the metadata publishes; where the page renders it smaller, that is the page's number. */
  avatar: SiteImage;
};

/**
 * The tagline is the offer in one line, as the home page's offer section is
 * headed and as every page that states no description of its own unfurls. The
 * CV header's is deliberately a different, plainer sentence — this one carries
 * the voice.
 */
type SiteConfig = Billed &
  WithAvatar &
  // `locale` is the language of every page that names none — `<html lang>`,
  // `og:locale`, an unlocalized collection's chrome and feed. A localized
  // page's own locale wins over it.
  WithLocale &
  WithUrl & {
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
    /**
     * The site's unlettered mark: what an article closes on in place of an amen,
     * and what the home page's seal is left showing once a held pointer fades
     * `avatar.vector`'s lettering off it. Spelled rather than left optional — an
     * omitted key is silently absent, and a new site should have to answer this
     * one.
     */
    seal: SiteImage | undefined;
    /**
     * What a page naming no image of its own unfurls as — the avatar itself
     * where it serves as both, a laid-out card where a site renders its avatar
     * as a portrait.
     */
    card: SiteImage;
    /**
     * The copyright on this site's materials, and where it links — `undefined`
     * where the site credits itself and its own name stands unlinked. Spelled by
     * every site for the same reason `seal` is: a new one should have to answer
     * whether its work is its own or published under another name.
     */
    credit: SiteCredit | undefined;
    /**
     * Whether an article closes on a list of its frontmatter `sources`. Where it
     * does not, the prose's own links are the citations and the field goes
     * unrendered. Spelled by every site for the same reason `seal` is.
     */
    listsSources: boolean;
    /**
     * The site's website ID in Umami — public by design, as every page's HTML
     * carries it. A new site gets one at `/stand-up-site`.
     */
    analyticsId: string;
  };

/**
 * The self-hosted Umami tracker, under the author's domain so it loads
 * first-party. The filename is the Railway service's `TRACKER_SCRIPT_NAME`, set
 * away from Umami's blocklisted `script.js`: change one, change the other.
 */
export const ANALYTICS_SCRIPT_URL = 'https://stats.vovazakharov.com/app.js';

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

/** The card `pnpm content:og <site>` renders for a site whose mark is a seal. */
const SEAL_CARD = { path: '/ava.og.png', ...PIXELS } as const;

/** The seal's blank cut, drawn on a square. */
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
    card: AVATAR,
    credit: undefined,
    listsSources: false,
    locale: 'en',
    analyticsId: '06b87bb7-2383-42e5-9625-521627a743b0',
    ...PUBLISHER,
  },
  lsa: {
    url: 'https://latestageagentic.com',
    downloadPrefix: 'lsa',
    name: 'Late Stage Agentic',
    tagline: 'How not to make a mess of agentic coding.',
    avatar: AVATAR,
    seal: undefined,
    card: AVATAR,
    credit: undefined,
    listsSources: false,
    locale: 'en',
    analyticsId: '1d5168b8-0a1b-42ff-bf4f-006e903fd1d8',
    ...PUBLISHER,
  },
  bible: {
    url: 'https://agentic.bible',
    downloadPrefix: 'bible',
    name: 'The Agentic Bible',
    tagline:
      'Articles on agentic coding that take a position and show the grounds under it.',
    // The lettered cut, whose card is rasterised from the vector beside it by
    // `pnpm content:og bible` — no Open Graph consumer renders an SVG.
    avatar: { ...SEAL_CARD, vector: '/seal-lettered.svg' },
    seal: { path: '/seal.svg', ...SEAL_SIZE },
    card: SEAL_CARD,
    credit: LSA_CREDIT,
    listsSources: false,
    locale: 'en',
    analyticsId: 'dd2ebf96-920c-478d-a060-708a10e42cf4',
    ...PUBLISHER,
  },
  basilisk: {
    url: 'https://basilisk.fyi',
    downloadPrefix: 'basilisk',
    name: 'basilisk.fyi',
    tagline: 'Omnia in actis.',
    // A card rather than a mark — the lettered seal beside the home page's
    // memo, generated by `pnpm content:og basilisk` — so no vector pairs it.
    avatar: SEAL_CARD,
    seal: { path: '/seal.svg', ...SEAL_SIZE },
    card: SEAL_CARD,
    credit: LSA_CREDIT,
    listsSources: true,
    locale: 'en',
    analyticsId: '1a93ed21-a8c1-4054-9ee3-33657a8c40d1',
    ...PUBLISHER,
  },
  // Everything here but the plumbing is Майя's to change.
  maya: {
    url: 'https://mayawonders.com',
    downloadPrefix: 'maya',
    // In English, as the bare address is; the `/ru` pages read theirs from
    // the catalogue's `maya` namespace.
    name: 'Maya wonders',
    tagline: 'Maya from za/oblozhkoy. We don’t exist.',
    // Cropped from the «Крылья» cover.
    avatar: { path: '/ava.png', width: 320, height: 320 },
    seal: undefined,
    // Generated by `pnpm content:og maya`, as is each blog post's.
    card: { path: '/card.og.png', ...PIXELS },
    credit: undefined,
    listsSources: false,
    locale: 'en',
    analyticsId: 'fa9d95c5-b7fe-46fa-a0cb-6888d514868c',
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
