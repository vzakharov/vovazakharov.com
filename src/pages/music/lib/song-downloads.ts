import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { PUBLIC_DIR } from '@/shared/content';
import type { Locale } from '@/shared/i18n';

import { masterLocation, servedPath } from './master-url';
import { type SongFile, songFiles } from './song-files';
import type { SongDocument } from './song-text';
import { songBilling } from './songs';

/**
 * Per song, a hash of what `pnpm music:masters tag` built its files from, and every
 * `<repo>/<path>` its runs read or wrote.
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

/**
 * The song's files as the locale's page links them. A song no tag run has
 * reached keeps its frontmatter's URLs; one it has links its derived names,
 * and the build fails on a name the run never wrote — a title edited since,
 * say — rather than a listener's download.
 */
export function songDownloads(
  document: SongDocument,
  locale: Locale,
): SongFile[] {
  const entry = readTagManifest()[document.slug];

  if (entry === undefined) return songFiles(document.frontmatter);

  const written = new Set(entry.paths);
  const files = songFiles(document.frontmatter, songBilling(document, locale));

  for (const url of files.flatMap(({ href }) => Object.values(href))) {
    const location = masterLocation(url);

    if (
      location !== null &&
      !written.has(servedPath(location, location.path))
    ) {
      throw new Error(
        `${document.fileName} links ${location.repo}/${location.path}, which no tag run wrote; run \`pnpm music:masters tag ${document.slug}\`.`,
      );
    }
  }

  return files;
}
