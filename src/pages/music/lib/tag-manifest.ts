import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { PUBLIC_DIR } from '@/shared/content';

import { masterLocation, servedPath } from './master-url';
import type { SongDocument } from './song-text';

/**
 * Per song, a hash of what `pnpm music:masters tag` built its files from, and
 * every `<repo>/<path>` its runs read or wrote — which is also where a run
 * finds a song's current files.
 */
export const TAG_MANIFEST = path.join(PUBLIC_DIR, 'music', 'tag-renders.json');

const tagManifestSchema = z.record(
  z.string(),
  z.object({ hash: z.string(), paths: z.array(z.string()) }),
);

export type TagManifest = z.infer<typeof tagManifestSchema>;

export function readTagManifest(): TagManifest {
  if (!fs.existsSync(TAG_MANIFEST)) return {};

  return tagManifestSchema.parse(
    JSON.parse(fs.readFileSync(TAG_MANIFEST, 'utf8')),
    { error: () => `Malformed tag manifest: ${TAG_MANIFEST}` },
  );
}

export function writeTagManifest(manifest: TagManifest): void {
  const sorted = Object.entries(manifest).toSorted(([a], [b]) =>
    a.localeCompare(b),
  );

  fs.writeFileSync(
    TAG_MANIFEST,
    `${JSON.stringify(Object.fromEntries(sorted), undefined, 2)}\n`,
  );
}

// Read once per build: every page's queue checks every track against it.
let built: TagManifest | undefined;

/**
 * Throws on a URL of the song's that no tag run wrote — a title edited since,
 * a song never tagged — so the build fails rather than a listener's play or
 * download.
 */
export function assertWritten(
  { slug, fileName }: SongDocument,
  urls: readonly string[],
): void {
  built ??= readTagManifest();

  const written = new Set(built[slug]?.paths);

  for (const url of urls) {
    const location = masterLocation(url);

    if (
      location === null ||
      !written.has(servedPath(location, location.path))
    ) {
      throw new Error(
        `${fileName} links ${url}, which no tag run wrote; run \`pnpm music:masters tag ${slug}\`.`,
      );
    }
  }
}
