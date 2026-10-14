#!/usr/bin/env node

/**
 * Generates `src/shared/music-catalogue/names.ts` — the album and artist names
 * a song's frontmatter may use — from the files under
 * `apps/vova/public/music/albums/` and `artists/`. Run it after adding or
 * renaming one:
 *
 *   pnpm music:codegen
 *
 * It **exits non-zero when it had to write**, as `pnpm styles:codegen` does, so
 * the vet run both repairs a stale file and fails on it.
 *
 * The names are generated rather than read at build time because they are
 * types: a song's misspelt `album:` or `project:` fails the build only while
 * `MusicAlbum` and `MusicProject` are literal unions, and a type cannot be read
 * off a directory. Everything else an album or artist states stays in its file.
 *
 * Bare Node runs this file, relying on its type stripping.
 */

/* eslint-disable no-console -- stderr is how this script reports drift, which
   the vet run's non-zero exit refers to. The rule stays `error` in the app,
   where a stray log ships to a user. */

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import prettier from 'prettier';
import { z } from 'zod';

const REPO_ROOT = path.join(import.meta.dirname, '..');
const MUSIC_DIR = 'apps/vova/public/music';
const OUTPUT = 'src/shared/music-catalogue/names.ts';

/**
 * What this script reads of an artist's frontmatter. The full schema is
 * `artistFrontmatterSchema`, which validates `name` against the union this
 * script writes, so it cannot be what the script reads with.
 */
const artistNamingSchema = z.object({ name: z.string().min(1) });

/** A page's address: lowercase ASCII, words joined by hyphens. */
const SLUG = /^[\da-z]+(?:-[\da-z]+)*$/;

function slugs(directory: string): string[] {
  const found = fs
    .readdirSync(path.join(REPO_ROOT, MUSIC_DIR, directory))
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.slice(0, -'.md'.length))
    .toSorted();
  const misnamed = found.find((slug) => !SLUG.test(slug));

  if (misnamed !== undefined) {
    throw new Error(
      `${MUSIC_DIR}/${directory}/${misnamed}.md: a file's name is its page's address, so lowercase ASCII words joined by hyphens.`,
    );
  }

  return found;
}

function artists(): Array<{ name: string; slug: string }> {
  const read = slugs('artists').map((slug) => {
    const file = path.join(MUSIC_DIR, 'artists', `${slug}.md`);
    const { data } = matter(fs.readFileSync(path.join(REPO_ROOT, file)));
    const parsed = artistNamingSchema.safeParse(data);

    if (!parsed.success) {
      throw new Error(`${file}: ${z.prettifyError(parsed.error)}`);
    }

    return { slug, ...parsed.data };
  });

  const names = read.map(({ name }) => name);
  const repeated = names.find((name, index) => names.indexOf(name) !== index);

  if (repeated !== undefined) {
    throw new Error(`Two artists share the name ${repeated}.`);
  }

  return read;
}

function literal(value: string): string {
  return JSON.stringify(value);
}

const ARTISTS = artists();

const source = `// Generated from ${MUSIC_DIR}/albums/ and artists/ by \`pnpm music:codegen\`.
// Add or rename a file there, not here — the vet run regenerates this
// file and fails when it had to.

/**
 * The artist and album names a song's frontmatter may use — the enums its
 * schema validates against; how each is shown is \`pages/music\`'s. Reached by
 * \`index.node-safe.ts\`, so it stays free of \`server-only\` and of every barrel.
 */

/** By file name; the music index lists them by what they released. */
export const MUSIC_PROJECT_NAMES = [${ARTISTS.map(({ name }) => literal(name)).join(', ')}] as const;

export type MusicProject = (typeof MUSIC_PROJECT_NAMES)[number];

/** Each artist's address under \`/music/artists/\`, its file's name. */
export const MUSIC_PROJECT_SLUGS = {${ARTISTS.map(({ name, slug }) => `${literal(name)}: ${literal(slug)}`).join(', ')}} as const satisfies Record<MusicProject, string>;

/** Each one the address of the album's page under \`/music/albums/\`, its file's name. */
export const MUSIC_ALBUM_SLUGS = [${slugs('albums')
  .map((slug) => literal(slug))
  .join(', ')}] as const;

export type MusicAlbum = (typeof MUSIC_ALBUM_SLUGS)[number];
`;

const outputPath = path.join(REPO_ROOT, OUTPUT);

// Formatted by the repository's own Prettier settings, or `pnpm format:check`
// fails on the file this writes.
const expected = await prettier.format(source, {
  ...(await prettier.resolveConfig(outputPath)),
  filepath: outputPath,
});

const found = fs.existsSync(outputPath)
  ? fs.readFileSync(outputPath, 'utf8')
  : '';

// Left alone when it already matches, so a run that finds nothing stale writes
// nothing at all.
if (found !== expected) {
  fs.writeFileSync(outputPath, expected);
  console.error(`${OUTPUT} was stale and has been regenerated.`);
  process.exit(1);
}
