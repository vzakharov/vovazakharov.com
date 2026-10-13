/** How the projects the songs are released under are shown and addressed. */

import { inLocale, type Locale, type Localizable } from '@/shared/i18n';
import type { TitleGloss } from '@/shared/music-catalogue';
// The node-safe barrel, which `projects.test.ts` runs under: the other one
// carries the schema and its `server-only`.
import {
  MUSIC_ORGANIZATION,
  type MusicProject,
  spell,
  type Spelled,
} from '@/shared/music-catalogue/index.node-safe';

const MUSIC_ORGANIZATION_URL = `https://github.com/${MUSIC_ORGANIZATION}`;

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
 * project added to `shared/music-catalogue` without one fails to compile.
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

/** A project's name under a locale, romanized by the Russian rule where the locale cannot read it. */
export function projectName(project: MusicProject, locale: Locale): Spelled {
  return spell(
    {
      text: inLocale(PROJECT_DISPLAY_NAMES[project] ?? project, locale),
      language: 'ru',
    },
    locale,
  );
}

/** What each locale tells its reader about a project's name, as a song's gloss does. */
const PROJECT_GLOSSES: Partial<
  Record<MusicProject, Partial<Record<Locale, TitleGloss>>>
> = {
  Полуживые: {
    en: { translation: 'The Half-Alive' },
  },
  'Грёбаный бал': {
    en: { translation: 'The Fucking Ball' },
  },
  'за/обложкой': {
    en: { translation: 'Behind the Cover' },
  },
  'Дамы и господа': {
    en: {
      translation: 'Ladies and Gentlemen',
    },
  },
  Листопад: { en: { translation: 'Leaf Fall' } },
};

export function projectGloss(
  project: MusicProject,
  locale: Locale,
): TitleGloss | undefined {
  return PROJECT_GLOSSES[project]?.[locale];
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
