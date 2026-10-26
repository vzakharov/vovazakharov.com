import 'server-only';

import type { Locale } from '@/kernel/shared/i18n';

import { messages } from '@/music/shared/i18n';
import { type AheadCounts, catalogueSize } from '@/music/shared/lib/duration';

import { type AlbumTrack, albumTracks } from './album-tracks.ts';
import { albumArtist, albumCover, albumGloss, albumTitle } from './albums.ts';
import { projectGloss, projectName } from './artists.ts';
import {
  albumDetail,
  albumKind,
  albumWipNote,
  albumYears,
  type ArtistWorks,
  artistWorks,
  catalogueArtists,
  newestAlbums,
} from './catalogue.ts';
import {
  albumText,
  artistText,
  type CatalogueText,
  preludeOf,
  type StoryParts,
} from './catalogue-text.ts';
import type { Glossed } from './frontmatter.ts';
import { albumPath, artistPath } from './music-urls.ts';
import type { MusicAlbum, MusicProject } from './names.ts';
import { artistPicture, songPicture } from './pictures.ts';
import type { ReleaseKind } from './release-kind.ts';
import {
  type LocalizedSongDocument,
  localizeSong,
  type SongDocument,
  type SongLyrics,
  songLyrics,
  type SongOnRelease,
} from './song-text.ts';
import { catalogueSongs, songTrack } from './songs.ts';
import { songTitle, type WithSpelledTitle } from './spelling.ts';
import type { SpelledLink, WithTrack } from './track.ts';

/*
 * Everything a page shows of the catalogue, and of an artist, an album or a
 * song in one language at once. A page reads each whole: the per-fact readers
 * they are built from stay behind the barrel.
 */

/** What an artist's or an album's own file says of it, linked to its page in that language. */
type CatalogueEntry = SpelledLink &
  Glossed & {
    text: CatalogueText;
  };

export type ArtistInfo = CatalogueEntry & { slug: MusicProject };

export type AlbumInfo = CatalogueEntry & {
  slug: MusicAlbum;
  /** Who put it out, as this language credits it. */
  artist: ArtistInfo;
  cover: string | undefined;
  /** The note a work in progress is signed with; nothing for a finished album. */
  wip: string | undefined;
};

/** Its header's size line — `21 songs`, `1 hour 12 minutes` — one part per fact. */
type WithSizeLine = { size: string[] };

/** An album with what the catalogue's songs say of it besides. */
type CatalogueAlbum = AlbumInfo &
  WithSizeLine & {
    kind: ReleaseKind;
    /** `2019`, or `2019–2021`. */
    years: string;
    /** What its tile says under its name. */
    detail: string[];
    tracks: Array<AlbumTrack<SongDocument>>;
  };

/** The cover a page or a tile is pictured by, where it has one. */
type Pictured = { picture: string | undefined };

/** An artist with what the catalogue's songs say of it besides. */
type CatalogueArtist = ArtistInfo & Pictured & ArtistWorks & WithSizeLine;

/** `track.routes` is the song's page in each language. */
export type SongInfo = WithSpelledTitle &
  WithTrack &
  Pictured & {
    localized: LocalizedSongDocument;
    lyrics: SongLyrics | undefined;
    prelude: StoryParts['prelude'];
  };

export function artistInfo(artist: MusicProject, locale: Locale): ArtistInfo {
  return {
    slug: artist,
    name: projectName(artist, locale),
    gloss: projectGloss(artist, locale),
    href: artistPath(artist, locale),
    text: artistText(artist, locale),
  };
}

export function albumInfo(album: MusicAlbum, locale: Locale): AlbumInfo {
  return {
    slug: album,
    name: albumTitle(album, locale),
    gloss: albumGloss(album, locale),
    href: albumPath(album, locale),
    text: albumText(album, locale),
    artist: artistInfo(albumArtist(album, locale), locale),
    cover: albumCover(album),
    wip: albumWipNote(album, locale),
  };
}

/**
 * The catalogue as one read of the songs: an album or an artist is read whole
 * through it, everything the songs say of either closing over that read.
 */
export type CatalogueInfo = {
  /** Every listed song, in catalogue order. */
  songs: SongDocument[];
  /** The one billed on the most songs first. */
  artists: MusicProject[];
  /** Newest first. */
  albums: MusicAlbum[];
  /** The whole catalogue's size line. */
  size: (locale: Locale) => string[];
  album: (album: MusicAlbum, locale: Locale) => CatalogueAlbum;
  artist: (artist: MusicProject, locale: Locale) => CatalogueArtist;
};

export function catalogueInfo(): CatalogueInfo {
  const songs = catalogueSongs();
  const artists = catalogueArtists(songs);
  const albums = newestAlbums(songs);

  return {
    songs,
    artists,
    albums,
    size: (locale) =>
      sizeLine(songs, locale, {
        artists: artists.length,
        albums: albums.length,
      }),
    album: (album, locale) => {
      const tracks = albumTracks(album, songs);

      return {
        ...albumInfo(album, locale),
        kind: albumKind(album, songs),
        years: albumYears(album, songs),
        detail: albumDetail(album, locale, songs),
        tracks,
        size: sizeLine(
          tracks.map(({ song }) => song),
          locale,
        ),
      };
    },
    artist: (artist, locale) => {
      const works = artistWorks(artist, locale, songs);

      return {
        ...artistInfo(artist, locale),
        ...works,
        picture: artistPicture(works),
        size: sizeLine(works.billed, locale, {
          albums: works.discography.albums.length,
        }),
      };
    },
  };
}

function sizeLine(
  songs: readonly SongDocument[],
  locale: Locale,
  ahead: AheadCounts = {},
): string[] {
  return catalogueSize(
    { ...ahead, seconds: songs.map(({ frontmatter }) => frontmatter.seconds) },
    locale,
    messages(locale).size,
  );
}

/** The song as the page on `album` shows it. */
export function songInfo(
  { document, album }: SongOnRelease,
  locale: Locale,
): SongInfo {
  return {
    title: songTitle(document.frontmatter, locale),
    localized: localizeSong(document, locale),
    picture: songPicture(document, album),
    track: songTrack(document, album),
    lyrics: songLyrics(document, locale),
    prelude: preludeOf(document, locale),
  };
}
