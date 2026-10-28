import 'server-only';

import { z } from 'zod';

import { readSiteCatalogueNames } from './catalogue-names.ts';
import type { MusicAlbum, MusicProject } from './name-brands.ts';

export type { MusicAlbum, MusicProject } from './name-brands';

let read: ReturnType<typeof readSiteCatalogueNames> | undefined;

// Read on first use rather than on import: every site's build and render
// scripts load the song schema through the collection registry, and only the
// site that serves the music collection has the files to read.
function catalogue(): ReturnType<typeof readSiteCatalogueNames> {
  read ??= readSiteCatalogueNames();
  return read;
}

export const albumSchema = z.lazy(() => catalogue().albumSchema);

export const projectSchema = z.lazy(() => catalogue().projectSchema);

/** Each one the address of the album's page under `/music/albums/`, its file's name. */
export function musicAlbumSlugs(): MusicAlbum[] {
  return catalogue().albums;
}

/** By file name; the music index ranks them itself. */
export function musicProjectNames(): MusicProject[] {
  return catalogue().artists.map(({ name }) => name);
}

/** The artist's address under `/music/artists/`, its file's name. */
export function projectSlug(artist: MusicProject): string {
  const found = catalogue().artists.find(({ name }) => name === artist);

  if (found === undefined) {
    throw new Error(`No artist file names ${artist}.`);
  }

  return found.slug;
}

/** The artist whose file the slug names, if any. */
export function projectBySlug(slug: string): MusicProject | undefined {
  return catalogue().artists.find((artist) => artist.slug === slug)?.name;
}
