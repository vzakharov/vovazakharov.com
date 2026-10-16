import 'server-only';

import type { Locale } from '@/shared/i18n';
import type { MusicProject, TitleGloss } from '@/shared/music-catalogue';
import type { Spelled } from '@/shared/music-catalogue/index.node-safe';

import { artistFile, localGloss, localName } from './catalogue-files';

/** A project's name under a locale, romanized by the Russian rule where the locale cannot read it. */
export function projectName(project: MusicProject, locale: Locale): Spelled {
  return localName(
    project,
    artistFile(project).frontmatter[locale].name,
    locale,
  );
}

export function projectGloss(
  project: MusicProject,
  locale: Locale,
): TitleGloss | undefined {
  return localGloss(artistFile(project).frontmatter[locale].name);
}
