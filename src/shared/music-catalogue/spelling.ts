import type { Locale } from '@/shared/i18n';

import type { SongFrontmatter, SungLanguage } from './frontmatter.ts';
import { romanizeRussian } from './romanize.ts';

const LATIN = /\p{Script=Latin}/u;

/** The script each locale's readers read natively, beside the Latin every reader of the site reads. */
const LOCALE_SCRIPTS: Record<Locale, RegExp> = {
  en: LATIN,
  ru: /\p{Script=Cyrillic}/u,
};

/**
 * A name or a line as one locale shows it. `latin` is there only where the
 * locale does not read the original's script, and is then what shows until
 * the reader switches to the original.
 */
export type Spelled = {
  original: string;
  latin?: string;
  /**
   * The original stays in Latin mode, the romanization beside it rather than
   * in its place — for a sacred text, whose letters are not to be replaced.
   */
  keepsScript?: boolean;
};

function letters(text: string): string[] {
  return text.match(/\p{L}/gu) ?? [];
}

function unreadable(letter: string, locale: Locale): boolean {
  return !LATIN.test(letter) && !LOCALE_SCRIPTS[locale].test(letter);
}

/** Whether any letter of the text is in a script the locale's readers may not read. */
export function needsLatin(text: string, locale: Locale): boolean {
  return letters(text).some((letter) => unreadable(letter, locale));
}

/**
 * Whether most of the text's letters are — the test for a song's words, which
 * go by their main language: a line in a third script inside them, farewell's
 * Chinese among Russian, does not turn the Russian Latin.
 */
export function mostlyNeedsLatin(text: string, locale: Locale): boolean {
  const all = letters(text);

  return (
    all.filter((letter) => unreadable(letter, locale)).length * 2 > all.length
  );
}

/** What a text is spelled from: what it is in, and a hand-written Latin spelling where it has one. */
export type Spellable = {
  text: string;
  language: SungLanguage | 'instrumental';
  latin?: string | undefined;
  keepsScript?: boolean | undefined;
};

/**
 * A text's spellings under a locale. A hand-written Latin spelling wins over
 * the rule, and only Russian has a rule; anything else the locale cannot read
 * and nothing spells fails the build, naming the text.
 */
export function spell(
  { text, language, latin, keepsScript = false }: Spellable,
  locale: Locale,
): Spelled {
  if (!needsLatin(text, locale)) return { original: text };

  const spelled = latin ?? (language === 'ru' ? romanizeRussian(text) : null);

  if (spelled === null) {
    throw new Error(
      `“${text}” is in ${language}, which ${locale} readers may not read and no rule romanizes; give it a hand-written Latin spelling.`,
    );
  }

  return {
    original: text,
    latin: spelled,
    ...(keepsScript && { keepsScript }),
  };
}

/**
 * A song's title under a locale: the locale's own name for the song where it
 * has one, else the song's, spelled as the language the title is in.
 */
export function songTitle(
  frontmatter: SongFrontmatter,
  locale: Locale,
): Spelled {
  const own = frontmatter[locale].title;

  if (typeof own === 'string')
    return spell({ text: own, language: locale }, locale);

  const { title, titleLanguage, language, titleLatin, keepsScript } =
    frontmatter;

  return spell(
    {
      text: title,
      language: titleLanguage ?? language[0] ?? 'instrumental',
      latin: titleLatin,
      keepsScript,
    },
    locale,
  );
}

/** The one spelling a string can carry — a page title, a feed item, the lock screen — before the reader has chosen. */
export function defaultSpelling({ original, latin }: Spelled): string {
  return latin ?? original;
}
