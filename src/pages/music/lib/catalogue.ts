import 'server-only';

import { loadMessages, type Locale, LOCALES } from '@/shared/i18n';
import {
  type MusicAlbum,
  musicAlbumSlugs,
  type MusicProject,
  musicProjectNames,
} from '@/shared/music-catalogue';

import { albumTracks } from './album-tracks';
import { albumArtist, albumWip } from './albums';
import { type ReleaseKind, releaseKind } from './release-kind';
import type { SongDocument } from './song-text';

/*
 * The catalogue's artists and albums, each derived from the songs handed in, so
 * a page reads the collection once and an artist or an album with nothing to
 * list has no page.
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
 * an album, and its years.
 */
export function albumDetail(
  album: MusicAlbum,
  locale: Locale,
  songs: readonly SongDocument[],
): string[] {
  const { kind } = loadMessages(locale).music;
  const sized = albumKind(album, songs);

  return [
    ...(sized === 'album' ? [] : [kind[sized]]),
    albumYears(album, songs),
  ];
}

/** The note a work-in-progress album's sign shows, or nothing for a finished one. */
export function albumWipNote(
  album: MusicAlbum,
  locale: Locale,
): string | undefined {
  return albumWip(album) ? loadMessages(locale).music.wip.note : undefined;
}

/** The albums finished apart from those still in the works, each keeping the order given. */
export function wipApart(albums: readonly MusicAlbum[]): {
  finished: MusicAlbum[];
  wip: MusicAlbum[];
} {
  return {
    finished: albums.filter((album) => !albumWip(album)),
    wip: albums.filter((album) => albumWip(album)),
  };
}

/** The albums with a song in this catalogue, by slug. */
export function catalogueAlbums(songs: readonly SongDocument[]): MusicAlbum[] {
  return musicAlbumSlugs().filter(
    (album) => albumSongs(album, songs).length > 0,
  );
}

/** The newest of the songs' dates, as a time; 0 for none. */
function latestDate(songs: readonly SongDocument[]): number {
  return Math.max(
    0,
    ...songs.map(({ frontmatter }) => frontmatter.date.getTime()),
  );
}

/** An album's file dates no release, so an album is as new as its latest song in this catalogue. */
function albumDate(album: MusicAlbum, songs: readonly SongDocument[]): number {
  return latestDate(albumSongs(album, songs));
}

/** The albums with a song in this catalogue, newest first; a tie goes by slug. */
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
 * The artists with a song or an album in this catalogue, the one billed on the
 * most songs first; between equals, the one whose latest song is newer. An
 * album counts in either language, so every artist an album page links to has
 * a page.
 */
export function catalogueArtists(
  songs: readonly SongDocument[],
): MusicProject[] {
  const ranked = musicProjectNames().map((artist) => {
    const billed = artistSongs(artist, songs);

    return { artist, count: billed.length, latest: latestDate(billed) };
  });

  return ranked
    .filter(
      ({ artist, count }) =>
        count > 0 ||
        LOCALES.some(
          (locale) => artistAlbums(artist, locale, songs).length > 0,
        ),
    )
    .toSorted((a, b) => b.count - a.count || b.latest - a.latest)
    .map(({ artist }) => artist);
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
