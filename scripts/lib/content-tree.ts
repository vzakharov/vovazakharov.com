/**
 * Where the render scripts walk for their sources. Bare Node runs them, relying
 * on its type stripping, so this file stays free of syntax the stripper cannot
 * erase.
 */

import fs from 'node:fs';
import path from 'node:path';

import {
  COLLECTION_IDS,
  collectionDir,
  COLLECTIONS,
} from '../../src/shared/content/collections.ts';

export const REPO_ROOT = path.join(import.meta.dirname, '..', '..');

/** Every file under `target`, recursively — or `target` itself when it is a file. */
export function filesUnder(target: string): string[] {
  return fs.statSync(target).isDirectory()
    ? fs
        .readdirSync(target)
        .flatMap((name) => filesUnder(path.join(target, name)))
    : [target];
}

/** The collections' directories under `public/` — the content tree's roots. */
export const CONTENT_DIRS = COLLECTION_IDS.map((id) => collectionDir(id));

/** The roots the PDF pipeline walks: a collection whose documents have a printable form. */
export const PRINTABLE_CONTENT_DIRS = COLLECTION_IDS.filter(
  (id) => COLLECTIONS[id].printable,
).map((id) => collectionDir(id));

/**
 * Every file under `dirs` whose name satisfies `matches`. The renders the
 * pipeline produces for a whole site — the mermaid SVGs — sit outside the
 * collections entirely, so this walk cannot hand a script its own output as a
 * source.
 */
export function contentFiles(
  matches: (name: string) => boolean,
  dirs: string[] = CONTENT_DIRS,
): string[] {
  return dirs
    .flatMap((dir) => filesUnder(dir))
    .filter((file) => matches(path.basename(file)));
}
