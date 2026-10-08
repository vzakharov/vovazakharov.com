/**
 * The projects the songs are released under. Below `pages/` because the song
 * frontmatter schema validates against the same names the music page bills —
 * `shared/content` and `pages/music` sit on either side of the layer boundary,
 * so the list cannot live in the slice that renders it.
 */

// `scripts/scaffold-song.ts` imports this module under tsx: the next-intl-free
// leaf, never the `@/shared/i18n` barrel.
import { inLocale, type Locale, type Localizable } from '@/shared/i18n/locales';

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
  'Trending Today',
  'Дамы и господа',
  'Иске Кормаш',
  'Киндерштайн',
  'Velvet Static',
  'Листопад',
] as const;

export type MusicProject = (typeof MUSIC_PROJECT_NAMES)[number];

/** The projects shown under another name in some language; the key is the one the frontmatter uses. */
const PROJECT_DISPLAY_NAMES: Partial<Record<MusicProject, Localizable>> = {
  Yoohie: { en: 'Yoohie', ru: 'Йухи' },
};

/**
 * Each project's address under `/music/artists/` — ASCII where the name is not,
 * and unique, which `music-projects.test.ts` holds. Keyed by every name, so a
 * project added above without one fails to compile.
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
  Киндерштайн: 'kindershtayn',
  'Velvet Static': 'velvet-static',
  Листопад: 'listopad',
};

export function projectName(project: MusicProject, locale: Locale): string {
  return inLocale(PROJECT_DISPLAY_NAMES[project] ?? project, locale);
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
