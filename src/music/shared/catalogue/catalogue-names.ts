/**
 * The albums and artists a song may name, read off the files under the music
 * directory's `albums/` and `artists/`, so a name the schema accepts is a file
 * that exists.
 *
 * `scripts/` run this outside any bundler, so it carries no `server-only`. It stays out of `index.node-safe.ts` all the same, which
 * client components enter and which must not reach `node:fs`.
 */

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import {
  collectionDir,
  isDocumentFile,
} from '@/blog/shared/content/collections';

import { musicAlbumSchema, musicProjectSchema, SLUG } from './name-brands.ts';

/** What this module reads of an artist's file; `artistFrontmatterSchema` reads the rest. */
const artistNamingSchema = z.object({ name: musicProjectSchema });

function slugs(directory: string): string[] {
  const found = fs
    .readdirSync(directory)
    .filter((file) => isDocumentFile(file))
    .map((file) => file.slice(0, -'.md'.length))
    .toSorted();
  const misnamed = found.find((slug) => !SLUG.test(slug));

  if (misnamed !== undefined) {
    throw new Error(
      `${directory}/${misnamed}.md: a file's name is its page's address, so lowercase ASCII words joined by hyphens.`,
    );
  }

  return found;
}

function artists(directory: string) {
  const read = slugs(directory).map((slug) => {
    const file = path.join(directory, `${slug}.md`);
    const parsed = artistNamingSchema.safeParse(
      matter(fs.readFileSync(file)).data,
    );

    if (!parsed.success) {
      throw new Error(`${file}: ${z.prettifyError(parsed.error)}`);
    }

    return { slug, ...parsed.data };
  });
  const names = read.map(({ name }) => name);
  const repeated = names.find((name, index) => names.indexOf(name) !== index);

  if (repeated !== undefined) {
    throw new Error(`Two artists in ${directory} share the name ${repeated}.`);
  }

  return read;
}

/**
 * Every album and artist under `musicDir`, each in file-name order, with the
 * schemas that accept only those.
 */
export function readCatalogueNames(musicDir: string) {
  const albums = slugs(path.join(musicDir, 'albums')).map((slug) =>
    musicAlbumSchema.parse(slug),
  );
  const artistFiles = artists(path.join(musicDir, 'artists'));
  const projects = new Set(artistFiles.map(({ name }) => name));

  return {
    albums,
    artists: artistFiles,
    albumSchema: musicAlbumSchema.refine((album) => albums.includes(album), {
      message: `Not an album: no file of that name in ${musicDir}/albums/.`,
    }),
    projectSchema: musicProjectSchema.refine(
      (project) => projects.has(project),
      {
        message: `Not an artist: no file in ${musicDir}/artists/ names it.`,
      },
    ),
  };
}

/** The catalogue of the site directory a build or a render script is entered in. */
export function readSiteCatalogueNames(): ReturnType<
  typeof readCatalogueNames
> {
  return readCatalogueNames(path.dirname(collectionDir('music')));
}
