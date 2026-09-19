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
export const COLLECTION_IDS = ['case-studies', 'bible'] as const;

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
  },
  bible: {
    /** Rooted: the domain is named for the collection, so the route does not
     * say so a second time. An empty base is what `collectionPath` drops. */
    base: '',
    label: 'The Bible',
    site: 'bible',
  },
} as const satisfies Record<
  CollectionId,
  WithSiteId & { base: string; label: string }
>;

/** The collections one site serves — every registry walk starts here. */
export function collectionsForSite(site: SiteId): CollectionId[] {
  return COLLECTION_IDS.filter((id) => COLLECTIONS[id].site === site);
}

/** The document the home page and the CV both cross-link. */
export const FEATURED_CASE_STUDY = 'playgram';

/** Shorter cuts, as `<slug>.<variant>.md` beside the full document. In reading order. */
export const VARIANTS = ['mini', 'nano'] as const;

export type Variant = (typeof VARIANTS)[number];

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

/** Site-root URL of a file inside a collection, i.e. where `public/` serves it. */
export function collectionAssetUrl(id: CollectionId, fileName: string): string {
  return collectionPath(id, fileName);
}

/** The route base of a collection — its index page, or the site's home where it is rooted. */
export function collectionRoute(id: CollectionId): string {
  return collectionPath(id);
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

/** The `<slug>[.<variant>]` stem a document's route and its files share. */
export function documentName(slug: string, variant?: Variant): string {
  return variant === undefined ? slug : `${slug}.${variant}`;
}
