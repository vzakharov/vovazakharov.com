/**
 * The three projects the songs are released under, and the Spotify artist each
 * is embedded from. Below `pages/` because the song frontmatter schema
 * validates against the same names the music page embeds — `shared/content` and
 * `pages/music` sit on either side of the layer boundary, so the list cannot
 * live in the slice that renders it.
 */

/** The source of truth, in release order: the schema's enum and the page's embeds both derive from it. */
export const MUSIC_PROJECT_NAMES = [
  'GENERATED',
  'Полуживые',
  'Downtemple',
] as const;

export type MusicProject = (typeof MUSIC_PROJECT_NAMES)[number];

/** Each project's Spotify artist, and the fuller name it is billed under where there is room. */
export const MUSIC_PROJECTS = {
  GENERATED: {
    artistId: '3tnTz9WCaghp3PJPSsTxQW',
    label: 'GENERATED',
  },
  Полуживые: {
    artistId: '2rdnjZV6ahlz4pKeh9a8B3',
    label: 'Полуживые (ru. for “Half-Alive”)',
  },
  Downtemple: {
    artistId: '2vN8JKg3rQLxleZ9xsafy6',
    label: 'Downtemple',
  },
} as const satisfies Record<MusicProject, { artistId: string; label: string }>;
