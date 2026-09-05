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
} from '../../src/shared/content/collections.ts';

export const REPO_ROOT = path.join(import.meta.dirname, '..', '..');

function walk(dir: string, matches: (name: string) => boolean): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) return walk(entryPath, matches);

    return matches(entry.name) ? [entryPath] : [];
  });
}

/**
 * Every file in every collection whose name satisfies `matches`, recursively.
 * The renders the pipeline produces for a whole site — the mermaid SVGs — sit
 * outside the collections entirely, so this walk cannot hand a script its own
 * output as a source.
 */
export function contentFiles(matches: (name: string) => boolean): string[] {
  return COLLECTION_IDS.flatMap((id) => walk(collectionDir(id), matches));
}
