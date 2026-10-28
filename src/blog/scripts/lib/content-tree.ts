/**
 * Where the render scripts walk for their sources.
 */

import path from 'node:path';

import {
  collectionDir,
  COLLECTIONS,
  collectionsForSite,
} from '@/blog/shared/content/index.node-safe';

import { filesUnder, RENDERED_SITE } from '@/kernel/scripts/lib/site-tree';

/** The directories under `public/` of the collections this site serves — the content tree's roots. */
export const CONTENT_DIRS = collectionsForSite(RENDERED_SITE).map((id) =>
  collectionDir(id),
);

/** The roots the PDF pipeline walks: a collection whose documents have a printable form. */
export const PRINTABLE_CONTENT_DIRS = collectionsForSite(RENDERED_SITE)
  .filter((id) => COLLECTIONS[id].printable)
  .map((id) => collectionDir(id));

/** Every file under `dirs` — every collection, by default — whose name satisfies `matches`. */
export function contentFiles(
  matches: (name: string) => boolean,
  dirs: string[] = CONTENT_DIRS,
): string[] {
  return dirs
    .flatMap((dir) => filesUnder(dir))
    .filter((file) => matches(path.basename(file)));
}
