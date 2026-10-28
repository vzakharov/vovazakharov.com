import { isLocale, type Locale, LOCALES } from '@/kernel/shared/i18n';

import { songFileName, songFileNames } from './file-name.ts';
import { songUrl } from './song-files.ts';
import type { SongDocument } from './song-text.ts';
import { songBilling } from './songs.ts';

/** The locale whose page calls the song by its own name, the one it is sung in first. */
function ownLocale({ frontmatter }: SongDocument): Locale {
  const keepsName = (locale: Locale) =>
    typeof frontmatter[locale].title !== 'string';
  const sung = frontmatter.titleLanguage ?? frontmatter.language[0];

  return isLocale(sung) && keepsName(sung)
    ? sung
    : (LOCALES.find((locale) => keepsName(locale)) ?? 'en');
}

/** Every name a page saves the song's file under, its own name in its own locale's spelling first. */
export function savedNames(
  document: SongDocument,
  extension: string,
): [string, ...string[]] {
  const own = songFileName(
    songBilling(document, ownLocale(document)),
    'original',
    extension,
  );
  const pages = LOCALES.flatMap((locale) =>
    Object.values(songFileNames(songBilling(document, locale), extension)),
  );

  return [own, ...new Set(pages).difference(new Set([own]))];
}

/** The song's MP3 under its own name, which the songs feeds enclose. */
export function mp3Url(document: SongDocument): string {
  const [own] = savedNames(document, 'mp3');

  return songUrl(document.frontmatter, own);
}
