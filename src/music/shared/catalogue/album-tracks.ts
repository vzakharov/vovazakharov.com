/**
 * Which songs a release holds, and at which number — the one reading of a
 * song's `album`/`track` and its `alsoOn`, so every list of an album's songs
 * counts a song on two releases on both.
 */

import type { AlbumPlacement, Released, Tracked } from './frontmatter.ts';
import type { MusicAlbum } from './names.ts';

/** Every release the song is on, the one it is filed under first. */
export function songPlacements({
  album,
  track,
  alsoOn = [],
}: Released): AlbumPlacement[] {
  const home = album === null || track === undefined ? [] : [{ album, track }];

  return [...home, ...alsoOn];
}

/**
 * `songs` with each album's own songs brought together in track order, where
 * the first of them stood — so the song after one on an album is its next
 * track, however the rest is ordered, and a number with no song yet is simply
 * passed over. A single keeps its place.
 */
export function albumsTogether<Song extends { frontmatter: Released }>(
  songs: readonly Song[],
): Song[] {
  const gathered = new Set<MusicAlbum>();

  return songs.flatMap((song) => {
    const { album } = song.frontmatter;

    if (album === null) return [song];
    if (gathered.has(album)) return [];

    gathered.add(album);

    return songs
      .filter(({ frontmatter }) => frontmatter.album === album)
      .toSorted(
        (a, b) => (a.frontmatter.track ?? 0) - (b.frontmatter.track ?? 0),
      );
  });
}

/** A song as one album lists it: `track` is its number there, whichever release it is filed under. */
export type AlbumTrack<Song> = Tracked & { song: Song };

/** The album's songs, each at its number on that album, in that order. */
export function albumTracks<Song extends { frontmatter: Released }>(
  album: MusicAlbum,
  songs: readonly Song[],
): Array<AlbumTrack<Song>> {
  return songs
    .flatMap((song) =>
      songPlacements(song.frontmatter)
        .filter((placement) => placement.album === album)
        .map(({ track }) => ({ song, track })),
    )
    .toSorted((a, b) => a.track - b.track);
}
