import 'server-only';

import type { Locale } from '@/shared/i18n';

import { type SongFile, songFiles } from './song-files';
import type { SongDocument } from './song-text';
import { songBilling } from './songs';
import { assertWritten } from './tag-manifest';

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
