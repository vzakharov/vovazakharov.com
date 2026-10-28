import 'server-only';

import type { Locale } from '@/kernel/shared/i18n';

import { artistFile, localGloss, localName } from './catalogue-files.ts';
import type { TitleGloss } from './frontmatter.ts';
import type { MusicProject } from './names.ts';
import type { Spelled } from './spelling.ts';

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
