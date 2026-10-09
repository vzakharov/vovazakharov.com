/**
 * Which songs a release holds, and at which number — the one reading of a
 * song's `album`/`track` and its `alsoOn`, so every list of an album's songs
 * counts a song on two releases on both.
 */

import type {
  AlbumPlacement,
  MusicAlbum,
  SongFrontmatter,
} from '@/shared/music-catalogue';

type Placed = Pick<SongFrontmatter, 'album' | 'track' | 'alsoOn'>;

/** Every release the song is on, the one it is filed under first. */
export function songPlacements({
  album,
  track,
  alsoOn = [],
}: Placed): AlbumPlacement[] {
  const home = album === null || track === undefined ? [] : [{ album, track }];

  return [...home, ...alsoOn];
}

/** A song as one album lists it: `track` is its number there, whichever release it is filed under. */
export type AlbumTrack<Song> = Pick<AlbumPlacement, 'track'> & { song: Song };

/** The album's songs, each at its number on that album, in that order. */
export function albumTracks<Song extends { frontmatter: Placed }>(
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
