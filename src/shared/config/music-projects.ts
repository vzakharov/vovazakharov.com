/**
 * The projects the songs are released under. Below `pages/` because the song
 * frontmatter schema validates against the same names the music page embeds —
 * `shared/content` and `pages/music` sit on either side of the layer boundary,
 * so the list cannot live in the slice that renders it.
 */

import type { Labeled } from '@/shared/typings';

/** The GitHub organization every song's repository and master is served from. */
export const MUSIC_ORGANIZATION = 'vovas-music';

export const MUSIC_ORGANIZATION_URL = `https://github.com/${MUSIC_ORGANIZATION}`;

/** The repository a song was made in, where its Reaper project and stems live. */
export function songRepositoryUrl(repo: string): string {
  return `${MUSIC_ORGANIZATION_URL}/${repo}`;
}

/** The source of truth: the schema's enum and the page's embeds both derive from it. */
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
 * What a project is billed as, and where it can be followed. Both links are
 * optional and mean different things by their absence: no `artistId` is a
 * project with nothing released on Spotify, no `channel` one with nothing to
 * read. A guest artist is a project with neither, which is what makes the
 * feature list and the release list one roster rather than two.
 */
export type MusicProjectRecord = Labeled & {
  artistId?: string;
  channel?: string;
};

export const MUSIC_PROJECTS: Record<MusicProject, MusicProjectRecord> = {
  GENERATED: {
    label: 'GENERATED',
    artistId: '3tnTz9WCaghp3PJPSsTxQW',
  },
  Полуживые: {
    label: 'Полуживые (ru. for “Half-Alive”)',
    artistId: '2rdnjZV6ahlz4pKeh9a8B3',
    channel: 'https://t.me/papareka',
  },
  Downtemple: {
    label: 'Downtemple',
    artistId: '2vN8JKg3rQLxleZ9xsafy6',
  },
  'Грёбаный бал': {
    label: 'Грёбаный бал',
    channel: 'https://t.me/fknball',
  },
  'за/обложкой': {
    label: 'за/обложкой',
  },
  Yoohie: {
    label: 'Yoohie',
  },
};

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
