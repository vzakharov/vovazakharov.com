import 'server-only';

import type { Locale } from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';

import type { ContentDocument } from '@/blog/shared/content';

import type {
  ScriptKept,
  SongFrontmatter,
  SungLanguage,
  TitleGloss,
  UntitledSongText,
} from './frontmatter.ts';
import {
  entryText,
  readVerse,
  type Stanzas,
  withoutNotes,
  type WithStanzas,
} from './lyric-notes.ts';
import type { MusicAlbum } from './names.ts';
import { localeProse, splitSections } from './sections.ts';
import { mostlyNeedsLatin } from './spelling.ts';
import {
  alignTransliteration,
  romanizedTag,
  romanizeStanzas,
  type Transliteration,
} from './transliteration.ts';

export type SongDocument = ContentDocument<SongFrontmatter>;

export type SongOnRelease = {
  document: SongDocument;
  /** The release the page shows the song on, named first. */
  album: MusicAlbum | null;
};

/**
 * A locale's strings, its title aside — `songTitle` spells that — and what the
 * locale tells its reader about a title it keeps.
 */
type LocalizedSongText = UntitledSongText & { gloss?: TitleGloss };

/**
 * A song as one language sees it: the titles and the story for that locale,
 * lifted out of the one file both languages are authored in.
 */
export type LocalizedSongDocument = ContentDocument<
  SongFrontmatter & LocalizedSongText
>;

/** The words as sung, and what the vocal is in, which is the column the author wrote. */
type SungWords = WithStanzas & { language: SungLanguage };

/**
 * The words, and the same words in the reader's language where the two differ.
 * Nothing is shown line for line: a stanza is the unit that survives being read
 * in parallel.
 */
export type SongLyrics = SungWords & {
  /** A crib, not a singing version — and absent where the song is in the reader's language. */
  translation?: Stanzas;
  /** The words in Latin letters, where most of them are in a script the reader may not read. */
  transliteration?: Transliteration;
} & ScriptKept;

/** The words as plain text, a line to an entry, for what reads their letters. */
export function wordsText(stanzas: Stanzas): string {
  return stanzas
    .flat()
    .map((entry) => entryText(entry))
    .join('\n');
}

function lyricsKey(language: string): string {
  return `lyrics:${language}`;
}

function wordsInLatin(
  stanzas: Stanzas,
  sections: ReadonlyMap<string, string>,
  language: SungLanguage,
  fileName: string,
): Transliteration {
  const key = lyricsKey(romanizedTag(language));
  const romanized = sections.get(key);

  if (romanized !== undefined) {
    return alignTransliteration(stanzas, romanized, fileName);
  }

  if (language === 'ru') return romanizeStanzas(stanzas);

  throw new Error(
    `${fileName} is sung in ${language}, which no rule romanizes, and has no "${key}" section.`,
  );
}

function localeText(
  frontmatter: SongFrontmatter,
  locale: Locale,
): LocalizedSongText {
  const { title, ...text } = frontmatter[locale];

  return typeof title === 'object' ? { ...text, gloss: title } : text;
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

  return {
    ...document,
    locale,
    frontmatter: { ...frontmatter, ...localeText(frontmatter, locale) },
    body: localeProse(body, locale),
    route: `${route}/${locale}`,
  };
}

type SungVerse = SungWords & {
  sections: ReadonlyMap<string, string>;
};

function sungVerse({
  frontmatter,
  body,
  fileName,
}: SongDocument): SungVerse | undefined {
  // The main language's words are the ones shown; another sung in the song
  // appears inside them, glossed by notes.
  const [language] = frontmatter.language;

  if (language === undefined || language === 'instrumental') return undefined;

  const sections = splitSections(body);
  const sung = sections.get(lyricsKey(language));

  if (sung === undefined) {
    throw new Error(
      `${fileName} is sung in ${language} and has no "${lyricsKey(language)}" section; a song that is not instrumental carries its words.`,
    );
  }

  return { language, sections, stanzas: readVerse(sung, fileName) };
}

/** The words as sung, notes and all; none for an instrumental. */
export function sungStanzas(document: SongDocument): Stanzas | undefined {
  return sungVerse(document)?.stanzas;
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
  const { frontmatter, fileName } = document;
  const verse = sungVerse(document);

  if (verse === undefined) return undefined;

  const { language, sections, stanzas } = verse;
  const words = {
    language,
    ...pick(frontmatter, 'keepsScript'),
    ...(mostlyNeedsLatin(wordsText(stanzas), locale) && {
      transliteration: wordsInLatin(stanzas, sections, language, fileName),
    }),
  };

  if (language === locale) return { ...words, stanzas };

  const translated = sections.get(lyricsKey(locale));

  if (translated === undefined) {
    return { ...words, stanzas: withoutNotes(stanzas) };
  }

  const translation = readVerse(translated, fileName);

  if (translation.length !== stanzas.length) {
    throw new Error(
      `${fileName} has ${String(stanzas.length)} ${language} stanzas and ${String(translation.length)} in ${locale}; a parallel reading needs them to match.`,
    );
  }

  return { ...words, stanzas: withoutNotes(stanzas), translation };
}
