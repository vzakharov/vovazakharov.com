import path from 'node:path';

/** The ids are the source of truth; `CollectionId` and `COLLECTIONS` derive from them. */
export const COLLECTION_IDS = ['case-studies'] as const;

export type CollectionId = (typeof COLLECTION_IDS)[number];

/**
 * The one place a content URL shape is decided. Routes, the sitemap and the
 * index cards all derive from it, so a new collection is an entry here.
 *
 * No `import 'server-only'`, unlike most of `shared/content/`: string constants
 * and pure path functions, which the render scripts run under bare Node.
 */
export const COLLECTIONS = {
  'case-studies': {
    /**
     * The collection's one path segment — its directory under `public/` and the
     * first segment of its routes, so a document's files sit at its own route
     * plus an extension.
     */
    base: 'case-studies',
    label: 'Case studies',
  },
} as const satisfies Record<CollectionId, { base: string; label: string }>;

/** Shorter cuts, as `<slug>.<variant>.md` beside the full document. In reading order. */
export const VARIANTS = ['mini', 'nano'] as const;

export type Variant = (typeof VARIANTS)[number];

export type WithCollectionId = { collection: CollectionId };
export type Slugged = { slug: string };

/** Addresses one document inside its collection — what `documentRoute` shapes a URL from. */
export type DocumentRef = WithCollectionId & Slugged;

export const PUBLIC_DIR = path.join(process.cwd(), 'public');

export function collectionDir(id: CollectionId): string {
  return path.join(PUBLIC_DIR, COLLECTIONS[id].base);
}

/** Site-root URL of a file inside a collection, i.e. where `public/` serves it. */
export function collectionAssetUrl(id: CollectionId, fileName: string): string {
  return `/${COLLECTIONS[id].base}/${fileName}`;
}

/** The route base of a collection — its index page. */
export function collectionRoute(id: CollectionId): string {
  return `/${COLLECTIONS[id].base}`;
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
  return `${collectionRoute(id)}/${documentName(slug, variant)}`;
}

/** The `<slug>[.<variant>]` stem a document's route and its files share. */
export function documentName(slug: string, variant?: Variant): string {
  return variant === undefined ? slug : `${slug}.${variant}`;
}
