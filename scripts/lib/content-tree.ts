/**
 * Where the render scripts walk for their sources. Bare Node runs them, relying
 * on its type stripping, so this file stays free of syntax the stripper cannot
 * erase.
 */

import fs from 'node:fs';
import path from 'node:path';

import { SITE_IDS } from '../../src/shared/config/site-ids.ts';
import {
  collectionDir,
  collectionsForSite,
} from '../../src/shared/content/collections.ts';

export const REPO_ROOT = path.join(import.meta.dirname, '..', '..');

/**
 * Which site's content this run walks. A render script is entered in one app's
 * directory, so `public/` already resolves to that site — an unset variable
 * would silently walk the collections of whichever site the registry listed
 * first against the other one's `public/`, hence the throw.
 */
function resolveSite() {
  const site = SITE_IDS.find((id) => id === process.env.NEXT_PUBLIC_SITE);

  if (site === undefined) {
    throw new Error(
      `NEXT_PUBLIC_SITE must be one of ${SITE_IDS.join(', ')}, not ${String(process.env.NEXT_PUBLIC_SITE)}`,
    );
  }

  return site;
}

/** Every file under `target`, recursively — or `target` itself when it is a file. */
export function filesUnder(target: string): string[] {
  return fs.statSync(target).isDirectory()
    ? fs
        .readdirSync(target)
        .flatMap((name) => filesUnder(path.join(target, name)))
    : [target];
}

export const RENDERED_SITE = resolveSite();

/** The directories under `public/` of the collections this site serves — the content tree's roots. */
export const CONTENT_DIRS = collectionsForSite(RENDERED_SITE).map((id) =>
  collectionDir(id),
);

/**
 * Every file in every collection whose name satisfies `matches`. The renders the
 * pipeline produces for a whole site — the mermaid SVGs — sit outside the
 * collections entirely, so this walk cannot hand a script its own output as a
 * source.
 */
export function contentFiles(matches: (name: string) => boolean): string[] {
  return CONTENT_DIRS.flatMap((dir) => filesUnder(dir)).filter((file) =>
    matches(path.basename(file)),
  );
}
