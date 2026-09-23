import 'server-only';

import type {
  ContentDocument,
  LocalizedText,
  SongFrontmatter,
} from '@/shared/content';
import { isLocale, type Locale } from '@/shared/i18n';

import {
  readVerse,
  type Stanzas,
  withoutNotes,
  type WithStanzas,
} from './lyric-notes';
import { PREAMBLE, splitSections } from './sections';

export type SongDocument = ContentDocument<SongFrontmatter>;

/**
 * A song as one language sees it: the titles and the story for that locale,
 * lifted out of the one file both languages are authored in.
 */
export type LocalizedSongDocument = ContentDocument<
  SongFrontmatter & LocalizedText
>;

/**
 * The words, and the same words in the reader's language where the two differ.
 * Nothing is shown line for line: a stanza is the unit that survives being read
 * in parallel.
 */
export type SongLyrics = WithStanzas & {
  /** What the vocal is in, which is the column the author wrote. */
  language: Locale;
  /** A crib, not a singing version — and absent where the song is in the reader's language. */
  translation?: Stanzas;
};

function storyKey(locale: Locale): string {
  return `lang:${locale}`;
}

function lyricsKey(language: Locale): string {
  return `lyrics:${language}`;
}

/**
 * One song document, read in one language: the locale's strings raised to the
 * top of the frontmatter, the story cut down to that locale's section, and the
 * canonical route the locale-less address defers to. The preamble — anything
 * before the first marker — belongs to both, so it stays.
 */
export function localizeSong(
  document: SongDocument,
  locale: Locale,
): LocalizedSongDocument {
  const { frontmatter, body, route } = document;
  const sections = splitSections(body);
  const story = [sections.get(PREAMBLE), sections.get(storyKey(locale))]
    .filter((section) => section !== undefined)
    .join('\n\n');

  return {
    ...document,
    locale,
    frontmatter: { ...frontmatter, ...frontmatter[locale] },
    body: story,
    route: `${route}/${locale}`,
  };
}

/**
 * The words as this locale's page shows them, with the notes of the column in
 * the page's language and no other. Unequal stanza counts fail the build: a
 * parallel reading that has slipped by one is worse than none, and it is the one
 * defect here that would look right on the page.
 */
export function songLyrics(
  document: SongDocument,
  locale: Locale,
): SongLyrics | undefined {
  const { frontmatter, body, fileName } = document;
  const { language } = frontmatter;

  if (!isLocale(language)) return undefined;

  const sections = splitSections(body);
  const sung = sections.get(lyricsKey(language));

  if (sung === undefined) return undefined;

  const stanzas = readVerse(sung, fileName);

  if (language === locale) return { language, stanzas };

  const translated = sections.get(lyricsKey(locale));

  if (translated === undefined) {
    return { language, stanzas: withoutNotes(stanzas) };
  }

  const translation = readVerse(translated, fileName);

  if (translation.length !== stanzas.length) {
    throw new Error(
      `${fileName} has ${String(stanzas.length)} ${language} stanzas and ${String(translation.length)} in ${locale}; a parallel reading needs them to match.`,
    );
  }

  return { language, stanzas: withoutNotes(stanzas), translation };
}
