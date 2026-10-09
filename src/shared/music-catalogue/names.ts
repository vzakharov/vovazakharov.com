/**
 * The project and album names a song's frontmatter may use — the enums its
 * schema validates against; how each is shown is `pages/music`'s. Reached by
 * `index.node-safe.ts`, so it stays free of `server-only` and of every barrel.
 */

/** The GitHub organization a song's `repo` names a repository in. */
export const MUSIC_ORGANIZATION = 'vovas-music';

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

/** Each one the address of the album's page under `/music/albums/`. */
export const MUSIC_ALBUM_SLUGS = [
  'cheer-the-fuck-up',
  'vagabond',
  'divine-discontent',
  'ghosts-of-flesh',
  'pschpthy',
  'not-safe-for-life',
  'let-the-stories-spin',
  'father-river',
  'hamlet',
  'father-sea',
  'who-is-happy-in-russia',
  'five-romances',
  'ignite',
  'old-shite',
  'nursery-rhymes',
  'prototypes',
  'for-none-and-for-all',
  'stronger-than-love',
] as const;

export type MusicAlbum = (typeof MUSIC_ALBUM_SLUGS)[number];
