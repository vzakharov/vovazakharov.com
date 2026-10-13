import 'server-only';

import { loadMessages, type Locale, LOCALES } from '@/shared/i18n';
import {
  MUSIC_ALBUM_SLUGS,
  MUSIC_PROJECT_NAMES,
  type MusicAlbum,
  type MusicProject,
} from '@/shared/music-catalogue';

import { albumTracks } from './album-tracks';
import { albumArtist, albumWip } from './albums';
import { type ReleaseKind, releaseKind } from './release-kind';
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

/** The album's songs in track order, those filed under another release included. */
function albumSongs(
  album: MusicAlbum,
  songs: readonly SongDocument[],
): SongDocument[] {
  return albumTracks(album, songs).map(({ song }) => song);
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

/** The album's kind by the songs of it this catalogue holds. */
export function albumKind(
  album: MusicAlbum,
  songs: readonly SongDocument[],
): ReleaseKind {
  return releaseKind(
    albumSongs(album, songs).map(({ frontmatter }) => frontmatter.seconds),
  );
}

/**
 * What an album's tile says under its name: its kind where it is shorter than
 * an album, the work-in-progress mark where it has one, and its years.
 */
export function albumDetail(
  album: MusicAlbum,
  locale: Locale,
  songs: readonly SongDocument[],
): string[] {
  const { kind, wip } = loadMessages(locale).music;
  const sized = albumKind(album, songs);

  return [
    ...(sized === 'album' ? [] : [kind[sized]]),
    ...(albumWip(album) ? [wip.mark] : []),
    albumYears(album, songs),
  ];
}

/** The albums with a song in this catalogue, in registry order. */
export function catalogueAlbums(songs: readonly SongDocument[]): MusicAlbum[] {
  return MUSIC_ALBUM_SLUGS.filter(
    (album) => albumSongs(album, songs).length > 0,
  );
}

/** The registry dates no release, so an album is as new as its latest song in this catalogue. */
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
function artistAlbums(
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

/** Every album and single in this catalogue, newest first. */
export function catalogueReleases(
  songs: readonly SongDocument[],
): ArtistRelease[] {
  const released = (release: ArtistRelease) =>
    'album' in release
      ? albumDate(release.album, songs)
      : release.single.frontmatter.date.getTime();

  return [
    ...newestAlbums(songs).map((album) => ({ album })),
    ...songs
      .filter(({ frontmatter }) => frontmatter.album === null)
      .map((single) => ({ single })),
  ].toSorted((a, b) => released(b) - released(a));
}

/**
 * The artist's albums and singles together, newest first. A single is a song
 * the artist leads rather than features on, so it is listed once, under whoever
 * released it.
 */
function artistReleases(
  artist: MusicProject,
  locale: Locale,
  songs: readonly SongDocument[],
): ArtistRelease[] {
  return catalogueReleases(songs).filter((release) =>
    releasedBy(release, artist, locale),
  );
}

/** Whether the release is the artist's as one language credits it. */
export function releasedBy(
  release: ArtistRelease,
  artist: MusicProject,
  locale: Locale,
): boolean {
  return 'album' in release
    ? albumArtist(release.album, locale) === artist
    : release.single.frontmatter.project[0] === artist;
}

/** The artist's releases, newest first, its albums — EPs and maxi singles among them — apart from its singles. */
export function artistDiscography(
  artist: MusicProject,
  locale: Locale,
  songs: readonly SongDocument[],
): { albums: MusicAlbum[]; singles: SongDocument[] } {
  const releases = artistReleases(artist, locale, songs);

  return {
    albums: releases.flatMap((release) =>
      'album' in release ? [release.album] : [],
    ),
    singles: releases.flatMap((release) =>
      'single' in release ? [release.single] : [],
    ),
  };
}
