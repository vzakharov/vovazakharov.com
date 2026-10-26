import 'server-only';

import { intrinsicDimensions } from '@/shared/content';
import { type Locale, LOCALES } from '@/shared/i18n';
import type { MusicAlbum, MusicProject } from '@/shared/music-catalogue';
import { OG_PHOTO_CARD_SUFFIX, routeCardPath } from '@/shared/seo';

import { albumCover } from './albums';
import {
  artistDiscography,
  type ArtistRelease,
  artistSongs,
  catalogueReleases,
  releasedBy,
  wipApart,
} from './catalogue';
import { artistPath, musicPath, radioPath } from './music-urls';
import type { SongDocument } from './song-text';
import { catalogueSongs } from './songs';

/*
 * What each page of the catalogue is pictured by — on the page, on a tile, and
 * as the card it unfurls as. Every picture is a cover, an artist borrowing one
 * of its releases'.
 */

/**
 * The songs with a cover of their own, by slug, at `songPicture`'s path: a
 * 600px square cut from the artwork the track carries on SoundCloud or Apple
 * Music — the album covers' size, so a single sits in the same grid as they do.
 */
const SONG_COVERS: ReadonlySet<string> = new Set([
  'chikh-pykh',
  'empty-mirrors',
  'ghost-of-yesterday',
  'love',
  'mithqal',
  'my-hope',
  'ok-loser',
  'trisagion',
]);

/**
 * The song's own cover, else that of the album it is shown on — the one it is
 * filed under unless named; a site-root path under `apps/vova/public/`.
 */
export function songPicture(
  { slug, frontmatter }: SongDocument,
  album: MusicAlbum | null = frontmatter.album,
): string | undefined {
  if (SONG_COVERS.has(slug)) return `/music/assets/covers/${slug}.jpg`;

  return album === null ? undefined : albumCover(album);
}

function releasePicture(release: ArtistRelease): string | undefined {
  return 'album' in release
    ? albumCover(release.album)
    : songPicture(release.single);
}

/**
 * By the newest cover among the artist's finished albums, else its albums in
 * the works, else its singles, else the songs billing it, a feature included —
 * so neither a later single nor a release still in the works stands for the
 * whole body of work.
 */
export function artistPicture(
  artist: MusicProject,
  locale: Locale,
  songs: readonly SongDocument[],
): string | undefined {
  const { albums, singles } = artistDiscography(artist, locale, songs);
  const { finished, wip } = wipApart(albums);
  const pictures = [
    ...[...finished, ...wip].map((album) => albumCover(album)),
    ...[...singles, ...artistSongs(artist, songs)].map((song) =>
      songPicture(song),
    ),
  ];

  return pictures.find((picture) => picture !== undefined);
}

/** How many covers a collage card holds at most: the length of its slot table. */
export const COLLAGE_SIZE = 10;

/**
 * The fewest covers a collage is made of; an artist with fewer is pictured by
 * its one cover, or by the placeholder.
 */
const COLLAGE_MINIMUM = 2;

/** Distinct covers of the releases, in their order, as many as a collage holds. */
function collageCovers(releases: readonly ArtistRelease[]): string[] {
  return [
    ...new Set(
      releases
        .map((release) => releasePicture(release))
        .filter((picture) => picture !== undefined),
    ),
  ].slice(0, COLLAGE_SIZE);
}

/** The catalogue's releases, newest first, which every collage is cut from. */
function publicReleases(): ArtistRelease[] {
  return catalogueReleases(catalogueSongs());
}

/** The covers the index's card is cut from. */
export function musicCollageCovers(): string[] {
  return collageCovers(publicReleases());
}

/**
 * The covers an artist's card is cut from, in either language's credit, so an
 * artist has one card rather than one per locale; none when there are too few
 * to make a collage of.
 */
export function artistCollageCovers(artist: MusicProject): string[] {
  const covers = collageCovers(
    publicReleases().filter((release) =>
      LOCALES.some((locale) => releasedBy(release, artist, locale)),
    ),
  );

  return covers.length < COLLAGE_MINIMUM ? [] : covers;
}

/** The index's collage card, at its locale-less route's address. */
export const MUSIC_COLLAGE = routeCardPath(musicPath(), OG_PHOTO_CARD_SUFFIX);

/**
 * The songs feeds' podcast cover: the index's collage cut square, as Apple's
 * directory requires.
 */
export const PODCAST_COVER = '/music.podcast.jpg';

/** The radio's card: the index's collage under a band naming the radio. */
export const RADIO_CARD = routeCardPath(radioPath(), OG_PHOTO_CARD_SUFFIX);

export function artistCollage(artist: MusicProject): string {
  return routeCardPath(artistPath(artist), OG_PHOTO_CARD_SUFFIX);
}

/**
 * What a music page with no picture of its own unfurls as. The index's collage
 * until #137 draws a placeholder of its own: it is the one picture that stands
 * for the whole catalogue.
 */
const MUSIC_PLACEHOLDER = MUSIC_COLLAGE;

/** An artist's card: its collage where it has one, else its picture. */
export function artistCard(
  artist: MusicProject,
  locale: Locale,
  songs: readonly SongDocument[],
): string | undefined {
  return artistCollageCovers(artist).length > 0
    ? artistCollage(artist)
    : artistPicture(artist, locale, songs);
}

/**
 * The picture as the page's social card, the placeholder where there is none —
 * applied here, not in the pickers, which also picture the page itself.
 */
export function pictureCard(picture: string = MUSIC_PLACEHOLDER) {
  return { ogImage: picture, ogImageSize: intrinsicDimensions(picture) };
}
