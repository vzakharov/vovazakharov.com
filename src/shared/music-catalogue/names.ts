// Generated from apps/vova/public/music/albums/ and artists/ by `pnpm music:codegen`.
// Add or rename a file there, not here — the vet run regenerates this
// file and fails when it had to.

/**
 * The artist and album names a song's frontmatter may use — the enums its
 * schema validates against; how each is shown is `pages/music`'s. Reached by
 * `index.node-safe.ts`, so it stays free of `server-only` and of every barrel.
 */

/** By file name; the music index lists them by what they released. */
export const MUSIC_PROJECT_NAMES = [
  'Дамы и господа',
  'Dead Pixel Lounge',
  'Downtemple',
  'GENERATED',
  'Грёбаный бал',
  'Иске Кормаш',
  'Киндерштайн',
  'Листопад',
  'Полуживые',
  'Trending Today',
  'Yoohie',
  'за/обложкой',
] as const;

export type MusicProject = (typeof MUSIC_PROJECT_NAMES)[number];

/** Each artist's address under `/music/artists/`, its file's name. */
export const MUSIC_PROJECT_SLUGS = {
  'Дамы и господа': 'damy-i-gospoda',
  'Dead Pixel Lounge': 'dead-pixel-lounge',
  Downtemple: 'downtemple',
  GENERATED: 'generated',
  'Грёбаный бал': 'grebanyy-bal',
  'Иске Кормаш': 'iske-kormash',
  Киндерштайн: 'kinderstein',
  Листопад: 'listopad',
  Полуживые: 'poluzhivye',
  'Trending Today': 'trending-today',
  Yoohie: 'yoohie',
  'за/обложкой': 'za-oblozhkoy',
} as const satisfies Record<MusicProject, string>;

/** Each one the address of the album's page under `/music/albums/`, its file's name. */
export const MUSIC_ALBUM_SLUGS = [
  'ctfu',
  'divine-discontent',
  'father-river',
  'father-sea',
  'five-romances',
  'for-none-and-for-all',
  'ghosts-of-flesh',
  'hamlet',
  'ignite',
  'let-the-stories-spin',
  'nsfl',
  'nursery-rhymes',
  'old-shite',
  'prototypes',
  'pschpthy',
  'punctuation-marks',
  'stronger-than-love',
  'vagabond',
  'who-is-happy-in-russia',
  'wings',
] as const;

export type MusicAlbum = (typeof MUSIC_ALBUM_SLUGS)[number];
