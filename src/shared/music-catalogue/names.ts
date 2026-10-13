// Generated from apps/vova/public/music/albums/ and artists/ by `pnpm music:codegen`.
// Add, rename or reorder a file there, not here — the vet run regenerates this
// file and fails when it had to.

/**
 * The artist and album names a song's frontmatter may use — the enums its
 * schema validates against; how each is shown is `pages/music`'s. Reached by
 * `index.node-safe.ts`, so it stays free of `server-only` and of every barrel.
 */

/** In each artist's `order`, which is where the music index lists it. */
export const MUSIC_PROJECT_NAMES = [
  'GENERATED',
  'Полуживые',
  'Downtemple',
  'Грёбаный бал',
  'за/обложкой',
  'Yoohie',
  'Trending Today',
  'Дамы и господа',
  'Иске Кормаш',
  'Киндерштайн',
  'Dead Pixel Lounge',
  'Листопад',
] as const;

export type MusicProject = (typeof MUSIC_PROJECT_NAMES)[number];

/** Each artist's address under `/music/artists/`, its file's name. */
export const MUSIC_PROJECT_SLUGS = {
  GENERATED: 'generated',
  Полуживые: 'poluzhivye',
  Downtemple: 'downtemple',
  'Грёбаный бал': 'grebanyy-bal',
  'за/обложкой': 'za-oblozhkoy',
  Yoohie: 'yoohie',
  'Trending Today': 'trending-today',
  'Дамы и господа': 'damy-i-gospoda',
  'Иске Кормаш': 'iske-kormash',
  Киндерштайн: 'kinderstein',
  'Dead Pixel Lounge': 'dead-pixel-lounge',
  Листопад: 'listopad',
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
