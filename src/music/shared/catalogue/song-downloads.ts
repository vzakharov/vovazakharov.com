import 'server-only';

import type { Locale } from '@/kernel/shared/i18n';

import {
  assertWritten,
  songBilling,
  type SongDocument,
} from '@/music/shared/catalogue';
import {
  type SongFile,
  songFiles,
} from '@/music/shared/catalogue/index.node-safe';

/** The song's files as the locale's page links them, each one a tag run wrote. */
export function songDownloads(
  document: SongDocument,
  locale: Locale,
): SongFile[] {
  const files = songFiles(document.frontmatter, songBilling(document, locale));

  assertWritten(
    document,
    files.flatMap(({ href }) => Object.values(href)),
  );

  return files;
}
