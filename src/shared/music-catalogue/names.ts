import 'server-only';

import { readSiteCatalogueNames } from './catalogue-names';
import type { MusicProject } from './name-brands';

export type { MusicAlbum, MusicProject } from './name-brands';

// The albums and artists this site's files hold, read once per build.
const { albums, artists, albumSchema, projectSchema } =
  readSiteCatalogueNames();

export { albumSchema, projectSchema };

/** Each one the address of the album's page under `/music/albums/`, its file's name. */
export const MUSIC_ALBUM_SLUGS = albums;

/** By file name; the music index ranks them itself. */
export const MUSIC_PROJECT_NAMES = artists.map(({ name }) => name);

/** The artist's address under `/music/artists/`, its file's name. */
export function projectSlug(artist: MusicProject): string {
  const found = artists.find(({ name }) => name === artist);

  if (found === undefined) {
    throw new Error(`No artist file names ${artist}.`);
  }

  return found.slug;
}

/** The artist whose file the slug names, if any. */
export function projectBySlug(slug: string): MusicProject | undefined {
  return artists.find((artist) => artist.slug === slug)?.name;
}
