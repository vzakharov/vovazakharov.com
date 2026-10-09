import 'server-only';

import { intrinsicDimensions } from '@/shared/content';
import type { Locale } from '@/shared/i18n';
import type { MusicAlbum, MusicProject } from '@/shared/music-catalogue';

import { albumCover } from './albums';
import { type ArtistRelease, artistReleases, artistSongs } from './catalogue';
import type { SongDocument } from './song-text';

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

export function releasePicture(release: ArtistRelease): string | undefined {
  return 'album' in release
    ? albumCover(release.album)
    : songPicture(release.single);
}

/**
 * By the artist's newest album that has a cover, so a later single does not
 * stand for the whole body of work; else by its newest single that has one,
 * else by the newest song billing it, a feature included, that has one.
 */
export function artistPicture(
  artist: MusicProject,
  locale: Locale,
  songs: readonly SongDocument[],
): string | undefined {
  const releases = artistReleases(artist, locale, songs);
  const pictures = [
    ...[
      ...releases.filter((release) => 'album' in release),
      ...releases.filter((release) => 'single' in release),
    ].map((release) => releasePicture(release)),
    ...artistSongs(artist, songs).map((song) => songPicture(song)),
  ];

  return pictures.find((picture) => picture !== undefined);
}

/** The picture as the page's social card, or nothing, which leaves the site's avatar. */
export function pictureCard(picture: string | undefined) {
  return picture === undefined
    ? {}
    : { ogImage: picture, ogImageSize: intrinsicDimensions(picture) };
}
