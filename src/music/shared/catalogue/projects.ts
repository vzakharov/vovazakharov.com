/** Where a song's project is made and how a song is billed; a project's shown name is `artists.ts`'s. */

import type { MusicProject } from './name-brands.ts';
import { MUSIC_ORGANIZATION } from './organization.ts';

const MUSIC_ORGANIZATION_URL = `https://github.com/${MUSIC_ORGANIZATION}`;

/** The repository a song was made in, where its Reaper project and stems live. */
export function songRepositoryUrl(repo: string): string {
  return `${MUSIC_ORGANIZATION_URL}/${repo}`;
}

/**
 * How a song is billed — the artist first, whoever is featured after it — over
 * any rendering of a name, so a page bills in links what the lock screen bills
 * in text. One order in both languages: the order really is per-release, and
 * carrying that would localize a field identical in every other song.
 */
export function bill<T>(
  projects: readonly MusicProject[],
  render: (project: MusicProject) => T,
): Array<T | string> {
  const [artist, ...featured] = projects;

  if (artist === undefined) return [];

  return [
    render(artist),
    ...featured.flatMap((project, index) => [
      index === 0 ? ' feat. ' : ', ',
      render(project),
    ]),
  ];
}
