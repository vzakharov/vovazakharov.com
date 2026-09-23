/**
 * The projects the songs are released under. Below `pages/` because the song
 * frontmatter schema validates against the same names the music page bills —
 * `shared/content` and `pages/music` sit on either side of the layer boundary,
 * so the list cannot live in the slice that renders it.
 */

/** The GitHub organization every song's repository and master is served from. */
export const MUSIC_ORGANIZATION = 'vovas-music';

export const MUSIC_ORGANIZATION_URL = `https://github.com/${MUSIC_ORGANIZATION}`;

/** The repository a song was made in, where its Reaper project and stems live. */
export function songRepositoryUrl(repo: string): string {
  return `${MUSIC_ORGANIZATION_URL}/${repo}`;
}

/** The source of truth: the schema's enum and the registry below both derive from it. */
export const MUSIC_PROJECT_NAMES = [
  'GENERATED',
  'Полуживые',
  'Downtemple',
  'Грёбаный бал',
  'за/обложкой',
  'Yoohie',
] as const;

export type MusicProject = (typeof MUSIC_PROJECT_NAMES)[number];

/**
 * How a song is billed: the artist first, whoever is featured after it. One
 * order in both languages — the order really is per-release, and carrying that
 * would localize a field identical in every other song.
 */
export function billing(projects: readonly MusicProject[]): string {
  const [artist, ...featured] = projects;

  if (artist === undefined) return '';

  return featured.length === 0
    ? artist
    : `${artist} feat. ${featured.join(', ')}`;
}
