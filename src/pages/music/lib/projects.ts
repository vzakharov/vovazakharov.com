/** How the projects the songs are released under are shown and addressed. */

import { inLocale, type Locale, type Localizable } from '@/shared/i18n';
// The node-safe barrel, which `projects.test.ts` runs under: the other one
// carries the schema and its `server-only`.
import {
  MUSIC_ORGANIZATION,
  type MusicProject,
} from '@/shared/song/index.node-safe';

export const MUSIC_ORGANIZATION_URL = `https://github.com/${MUSIC_ORGANIZATION}`;

/** The repository a song was made in, where its Reaper project and stems live. */
export function songRepositoryUrl(repo: string): string {
  return `${MUSIC_ORGANIZATION_URL}/${repo}`;
}

/** The projects shown under another name in some language; the key is the one the frontmatter uses. */
const PROJECT_DISPLAY_NAMES: Partial<Record<MusicProject, Localizable>> = {
  Yoohie: { en: 'Yoohie', ru: 'Йухи' },
};

/**
 * Each project's address under `/music/artists/` — ASCII where the name is not,
 * and unique, which `projects.test.ts` holds. Keyed by every name, so a
 * project added to `shared/song` without one fails to compile.
 */
export const MUSIC_PROJECT_SLUGS: Record<MusicProject, string> = {
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
};

export function projectName(project: MusicProject, locale: Locale): string {
  return inLocale(PROJECT_DISPLAY_NAMES[project] ?? project, locale);
}

/**
 * The projects with a picture at `artistImage`'s path: a 600px square, the one
 * the artist's Apple Music page shows — often its latest release's cover.
 */
const PICTURED_PROJECTS: ReadonlySet<MusicProject> = new Set([
  'GENERATED',
  'Полуживые',
  'Downtemple',
  'за/обложкой',
  'Yoohie',
  'Trending Today',
  'Дамы и господа',
]);

/** The picture's site-root path, under `apps/vova/public/`. */
export function artistImage(project: MusicProject): string | undefined {
  return PICTURED_PROJECTS.has(project)
    ? `/music/assets/artists/${MUSIC_PROJECT_SLUGS[project]}.jpg`
    : undefined;
}

/**
 * How a song is billed — the artist first, whoever is featured after it — over
 * any rendering of a name, so a page can bill in links what `billing` bills in
 * text. One order in both languages: the order really is per-release, and
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

export function billing(
  projects: readonly MusicProject[],
  locale: Locale,
): string {
  return bill(projects, (project) => projectName(project, locale)).join('');
}
