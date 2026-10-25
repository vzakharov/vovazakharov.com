import 'server-only';

import { masterLocation, servedPath } from './master-url.ts';
import type { SongDocument } from './song-text.ts';
import { readTagManifest, type TagManifest } from './tag-manifest.ts';

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
