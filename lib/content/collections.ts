import 'server-only';

import path from 'node:path';

/**
 * The one place a content URL shape is decided. Routes, the sitemap and the
 * index cards all derive from it, so a new collection is an entry here.
 */
export const COLLECTIONS = {
  'case-studies': {
    /** Relative to `public/`, so the raw markdown is also served from it. */
    dir: 'content/case-studies',
    routeBase: '/case-studies',
    label: 'Case studies',
  },
} as const;

export type CollectionId = keyof typeof COLLECTIONS;

export const COLLECTION_IDS = Object.keys(COLLECTIONS) as CollectionId[];

/** Shorter cuts, as `<slug>.<variant>.md` beside the full document. In reading order. */
export const VARIANTS = ['mini', 'micro'] as const;

export type Variant = (typeof VARIANTS)[number];

export const PUBLIC_DIR = path.join(process.cwd(), 'public');

export function collectionDir(id: CollectionId): string {
  return path.join(PUBLIC_DIR, COLLECTIONS[id].dir);
}

/** Site-root URL of a file inside a collection, i.e. where `public/` serves it. */
export function collectionAssetUrl(id: CollectionId, fileName: string): string {
  return `/${COLLECTIONS[id].dir}/${fileName}`;
}

export function documentRoute(
  id: CollectionId,
  slug: string,
  variant?: Variant
): string {
  const base = `${COLLECTIONS[id].routeBase}/${slug}`;
  return variant ? `${base}/${variant}` : base;
}
