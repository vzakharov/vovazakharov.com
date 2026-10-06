/**
 * No `import 'server-only'`, unlike most of `shared/content/`: string constants
 * and pure path functions, which the render scripts run under bare Node.
 */

import path from 'node:path';

// Type-only, and it has to stay that way: bare Node erases the statement
// rather than resolving an `@/` alias it cannot follow, and a value import
// would reach `site-config`'s throw on an unset `NEXT_PUBLIC_SITE`.
import type { SiteId, WithSiteId } from '@/shared/config';

/** The ids are the source of truth; `CollectionId` and `COLLECTIONS` derive from them. */
const COLLECTION_IDS = [
  'case-studies',
  'bible',
  'music',
  'basilisk-cases',
  'basilisk-faq',
] as const;

export type CollectionId = (typeof COLLECTION_IDS)[number];

/**
 * The one place a content URL shape is decided. Routes, the sitemap and the
 * index cards all derive from it, so a new collection is an entry here.
 *
 * A collection belongs to one site, and every walk over the registry filters by
 * that: `public/` is per app, so the other site's build would otherwise read a
 * directory that is not there.
 */
export const COLLECTIONS = {
  'case-studies': {
    /** Its directory under `public/` and the first segment of its routes, which
     * is what puts a document's files at its own route plus an extension. */
    base: 'case-studies',
    label: 'Case studies',
    site: 'vova',
    printable: true,
    /** English only, and the body is where its title comes from. */
    localized: false,
    homeIndexed: false,
  },
  bible: {
    /** Rooted: the domain is named for the collection, so the route does not
     * say so a second time. An empty base is what `collectionPath` drops. */
    base: '',
    label: 'The Bible',
    site: 'bible',
    printable: true,
    localized: false,
    homeIndexed: true,
  },
  music: {
    base: 'music',
    label: 'Songs',
    site: 'vova',
    /** A song is a recording with prose around it; there is nothing to print. */
    printable: false,
    localized: true,
    homeIndexed: false,
  },
  'basilisk-cases': {
    base: 'cases',
    label: 'Cases',
    site: 'basilisk',
    printable: true,
    localized: false,
    homeIndexed: true,
  },
  'basilisk-faq': {
    base: 'faq',
    label: 'FAQ',
    site: 'basilisk',
    printable: false,
    localized: false,
    homeIndexed: true,
  },
} as const satisfies Record<
  CollectionId,
  WithSiteId & {
    base: string;
    label: string;
    printable: boolean;
    localized: boolean;
    /**
     * Listed on its site's home page rather than on an index page of its own,
     * which is what a route base of `/` means — and all a rooted collection
     * can mean.
     */
    homeIndexed: boolean;
  }
>;

/** The collections one site serves — every registry walk starts here. */
export function collectionsForSite(site: SiteId): CollectionId[] {
  return COLLECTION_IDS.filter((id) => COLLECTIONS[id].site === site);
}

/** The document the home page and the CV both cross-link. */
const FEATURED_CASE_STUDY = 'playgram';

/** Shorter cuts, as `<slug>.<variant>.md` beside the full document. In reading order. */
export const VARIANTS = ['mini', 'nano'] as const;

export type Variant = (typeof VARIANTS)[number];

/**
 * Files kept as `<slug>.<companion>.md` beside a document, about it rather than
 * of it: `public/` serves them as authored, and no walk for documents — the
 * loader, the prints, the cards — reads one as a document.
 */
const COMPANIONS = ['reflections'] as const;

/** Whether a file name under a collection's directory is a document or one of its cuts. */
export function isDocumentFile(fileName: string): boolean {
  return (
    fileName.endsWith('.md') &&
    !COMPANIONS.some((companion) => fileName.endsWith(`.${companion}.md`))
  );
}

export type WithCollectionId = { collection: CollectionId };
export type Slugged = { slug: string };

/** Carries a site-root path, as `documentRoute` and `collectionRoute` shape one. */
export type Routed = { route: string };

/** Addresses one document inside its collection — what `documentRoute` shapes a URL from. */
export type DocumentRef = WithCollectionId & Slugged;

/**
 * The site's static assets, resolved against the working directory — which is
 * the app's own directory under `apps/`, every build and render script being
 * entered there. Run one from the repository root and this points at nothing.
 */
export const PUBLIC_DIR = path.join(process.cwd(), 'public');

/**
 * Where the pipeline's whole-site renders land under `public/`, and the one
 * directory a walk for sources skips: an output read back as an input never
 * settles, a render's own product hashing into the source set that decides
 * whether it is stale. The name is therefore a contract — a run writes here
 * and never reads here.
 *
 * A rooted collection's directory is the site's whole `public/`, which is what
 * makes that separation this constant rather than where the directories sit.
 */
export const GENERATED_DIR = 'generated';

export function collectionDir(id: CollectionId): string {
  return path.join(PUBLIC_DIR, COLLECTIONS[id].base);
}

/**
 * A site-root path inside a collection — the empty base of a rooted collection
 * dropping out rather than doubling the separator.
 */
function collectionPath(id: CollectionId, ...segments: string[]): string {
  return `/${[COLLECTIONS[id].base, ...segments].filter(Boolean).join('/')}`;
}

/**
 * Site-root URL of a file relative to a collection, i.e. where `public/` serves
 * it — a `../` reaching into a sibling collection resolved away.
 */
export function collectionAssetUrl(id: CollectionId, fileName: string): string {
  return path.posix.normalize(collectionPath(id, fileName));
}

/** Where a collection is listed — its index page, or the site's home. */
export function collectionRoute(id: CollectionId): string {
  return COLLECTIONS[id].homeIndexed ? '/' : collectionPath(id);
}

/**
 * Where an article's back link returns to. A home page indexing a collection
 * with a base of its own lists it in a section whose id is that base, so the
 * link lands on the section rather than the top of the page.
 */
export function collectionListingRoute(id: CollectionId): string {
  const { homeIndexed, base } = COLLECTIONS[id];

  return homeIndexed && base !== '' ? `/#${base}` : collectionRoute(id);
}

/**
 * The one URL shaper. A cut is a dotted suffix on the slug rather than a nested
 * segment, so the route matches the file name it was authored as and every
 * alternate representation is this URL plus an extension.
 */
export function documentRoute(
  id: CollectionId,
  slug: string,
  variant?: Variant,
): string {
  return collectionPath(id, documentName(slug, variant));
}

/** The route of the case study the home page and the CV cross-link. */
export const FEATURED_CASE_STUDY_ROUTE = documentRoute(
  'case-studies',
  FEATURED_CASE_STUDY,
);

/**
 * A locale as a trailing segment, which is where a localized collection's pages
 * differ from one another. A cut is a dotted suffix on the slug instead, so the
 * two positions cannot collide however they are combined. No locale is the
 * alias — the same page, at the address that does not name a language.
 */
export function localizedRoute(route: string, locale?: string): string {
  return locale === undefined ? route : `${route}/${locale}`;
}

/** The `<slug>[.<variant>]` stem a document's route and its files share. */
export function documentName(slug: string, variant?: Variant): string {
  return variant === undefined ? slug : `${slug}.${variant}`;
}
