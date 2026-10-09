import 'server-only';

import { type Locale, LOCALES } from '@/shared/i18n';
import {
  MUSIC_ALBUM_SLUGS,
  MUSIC_PROJECT_NAMES,
  type MusicAlbum,
  type MusicProject,
} from '@/shared/song';

import { albumArtist } from './albums';
import type { SongDocument } from './song-text';

/*
 * The artists and albums of one catalogue — public or whole — each derived from
 * the songs handed in, so a page reads the collection once and an artist or an
 * album with nothing to list in that catalogue has no page in it.
 */

/** Every song billing the project, as the artist or as a feature. */
export function artistSongs(
  artist: MusicProject,
  songs: readonly SongDocument[],
): SongDocument[] {
  return songs.filter(({ frontmatter }) =>
    frontmatter.project.includes(artist),
  );
}

/** The album's songs in track order. */
export function albumSongs(
  album: MusicAlbum,
  songs: readonly SongDocument[],
): SongDocument[] {
  return songs
    .filter(({ frontmatter }) => frontmatter.album === album)
    .toSorted(
      (a, b) => (a.frontmatter.track ?? 0) - (b.frontmatter.track ?? 0),
    );
}

/** The years the album's songs in this catalogue span — `2019`, or `2019–2021`. */
export function albumYears(
  album: MusicAlbum,
  songs: readonly SongDocument[],
): string {
  const years = albumSongs(album, songs).map(({ frontmatter }) =>
    frontmatter.date.getUTCFullYear(),
  );
  const first = Math.min(...years);
  const last = Math.max(...years);

  return first === last ? `${first}` : `${first}–${last}`;
}

/** The albums with a song in this catalogue, in registry order. */
export function catalogueAlbums(songs: readonly SongDocument[]): MusicAlbum[] {
  return MUSIC_ALBUM_SLUGS.filter(
    (album) => albumSongs(album, songs).length > 0,
  );
}

/**
 * When the album came out, as far as the catalogue knows: the registry dates no
 * release, so an album is as new as its latest song in this catalogue.
 */
function albumDate(album: MusicAlbum, songs: readonly SongDocument[]): number {
  return Math.max(
    ...albumSongs(album, songs).map(({ frontmatter }) =>
      frontmatter.date.getTime(),
    ),
  );
}

/** The albums with a song in this catalogue, newest first; a tie keeps registry order. */
export function newestAlbums(songs: readonly SongDocument[]): MusicAlbum[] {
  return catalogueAlbums(songs).toSorted(
    (a, b) => albumDate(b, songs) - albumDate(a, songs),
  );
}

/**
 * The artist's albums as one language credits them — `vagabond` is GENERATED's
 * in English and Полуживые's in Russian — newest first.
 */
export function artistAlbums(
  artist: MusicProject,
  locale: Locale,
  songs: readonly SongDocument[],
): MusicAlbum[] {
  return newestAlbums(songs).filter(
    (album) => albumArtist(album, locale) === artist,
  );
}

/**
 * The artists with a song or an album in this catalogue, in registry order. An
 * album counts in either language, so every artist an album page links to has
 * a page.
 */
export function catalogueArtists(
  songs: readonly SongDocument[],
): MusicProject[] {
  return MUSIC_PROJECT_NAMES.filter(
    (artist) =>
      artistSongs(artist, songs).length > 0 ||
      LOCALES.some((locale) => artistAlbums(artist, locale, songs).length > 0),
  );
}

/** What an artist put out: an album, or a song on none, which is its own release. */
export type ArtistRelease = { album: MusicAlbum } | { single: SongDocument };

/**
 * The artist's albums and singles together, newest first. A single is a song
 * the artist leads rather than features on, so it is listed once, under whoever
 * released it.
 */
export function artistReleases(
  artist: MusicProject,
  locale: Locale,
  songs: readonly SongDocument[],
): ArtistRelease[] {
  const released = (release: ArtistRelease) =>
    'album' in release
      ? albumDate(release.album, songs)
      : release.single.frontmatter.date.getTime();

  return [
    ...artistAlbums(artist, locale, songs).map((album) => ({ album })),
    ...songs
      .filter(
        ({ frontmatter }) =>
          frontmatter.album === null && frontmatter.project[0] === artist,
      )
      .map((single) => ({ single })),
  ].toSorted((a, b) => released(b) - released(a));
}
