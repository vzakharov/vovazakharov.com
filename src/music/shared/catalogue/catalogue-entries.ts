import 'server-only';

import type { Locale } from '@/kernel/shared/i18n';

import { albumArtist, albumCover, albumGloss, albumTitle } from './albums.ts';
import { projectGloss, projectName } from './artists.ts';
import {
  albumDetail,
  albumKind,
  albumWipNote,
  albumYears,
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
import { songPicture } from './pictures.ts';
import type { ReleaseKind } from './release-kind.ts';
import {
  type LocalizedSongDocument,
  localizeSong,
  type SongDocument,
  type SongLyrics,
  songLyrics,
  type SongOnRelease,
} from './song-text.ts';
import { songTrack } from './songs.ts';
import { songTitle, type WithSpelledTitle } from './spelling.ts';
import type { SpelledLink, WithTrack } from './track.ts';

/*
 * Everything a page shows of an artist, an album or a song, read in one
 * language at once. A page reads the entry whole: the per-fact readers it is
 * built from stay behind the barrel.
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

/** An album with what the songs handed in say of it besides. */
export type CatalogueAlbum = AlbumInfo & {
  kind: ReleaseKind;
  /** `2019`, or `2019–2021`. */
  years: string;
  /** What its tile says under its name. */
  detail: string[];
};

/** `track.routes` is the song's page in each language. */
export type SongInfo = WithSpelledTitle &
  WithTrack & {
    localized: LocalizedSongDocument;
    picture: string | undefined;
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

export function catalogueAlbum(
  album: MusicAlbum,
  locale: Locale,
  songs: readonly SongDocument[],
): CatalogueAlbum {
  return {
    ...albumInfo(album, locale),
    kind: albumKind(album, songs),
    years: albumYears(album, songs),
    detail: albumDetail(album, locale, songs),
  };
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
