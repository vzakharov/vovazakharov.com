/**
 * The names a song's frontmatter may give its project and album — the enums the
 * schema validates against, and nothing the pages show of them, which
 * `pages/music` holds. `scripts/scaffold-song.ts` imports this module under
 * tsx, so it stays free of `server-only` and of every barrel.
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
  'ctfu',
  'vagabond',
  'divine',
  'ghosts',
  'pschpthy',
  'nsfl',
  'stories',
  'papa-reka',
  'papa-more',
  'rus',
  'dng',
  'ignite',
  'old-shite',
  'nursery',
  'prototypes',
  'nikogo',
  'polzat',
] as const;

export type MusicAlbum = (typeof MUSIC_ALBUM_SLUGS)[number];
