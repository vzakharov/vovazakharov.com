/** What a release is by its size, the album being the default nobody labels. */
export const RELEASE_KINDS = ['maxi-single', 'ep', 'album'] as const;

export type ReleaseKind = (typeof RELEASE_KINDS)[number];

/**
 * The UK Official Charts' line: 25 minutes and up is an album, whatever its
 * track count, and shorter is an EP or a single.
 */
const ALBUM_MINUTES = 25;

/** The most tracks a single carries before it reads as an EP, as Spotify and Apple Music count them. */
const MAXI_SINGLE_TRACKS = 3;

/** A release's kind from its tracks' lengths. */
export function releaseKind(seconds: readonly number[]): ReleaseKind {
  const total = seconds.reduce((sum, track) => sum + track, 0);

  if (total >= ALBUM_MINUTES * 60) return 'album';

  return seconds.length <= MAXI_SINGLE_TRACKS ? 'maxi-single' : 'ep';
}
