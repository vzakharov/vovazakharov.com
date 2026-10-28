import type { Locale } from '@/kernel/shared/i18n';
import type { Script } from '@/kernel/shared/lib/script-preference';
import type { WithText } from '@/kernel/shared/typings';

import type { SongFrontmatter, SungLanguage } from './frontmatter.ts';
import { romanizeRussian } from './romanize.ts';

const LATIN = /\p{Script=Latin}/u;

/** The script each locale's readers read natively, beside the Latin every reader of the site reads. */
const LOCALE_SCRIPTS: Record<Locale, RegExp> = {
  en: LATIN,
  ru: /\p{Script=Cyrillic}/u,
};

/** How the switch to the original names each script a name here is written in. */
const SCRIPT_SAMPLES = [
  [/\p{Script=Cyrillic}/u, 'Абв'],
  [/\p{Script=Arabic}/u, 'أبج'],
  [/\p{Script=Greek}/u, 'Αβγ'],
] as const;

/**
 * A name or a line as one locale shows it. `latin` is there only where the
 * locale does not read the original's script, and is then what shows until
 * the reader switches to the original.
 */
export type Spelled = {
  original: string;
  latin?: string;
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

/**
 * The sample of the script most of the texts' letters are in among those the
 * locale's readers may not read — what a page's switch to the original shows —
 * or `undefined` where they read every letter. A text whose unreadable letters
 * are all in scripts with no sample fails the build when no other text has one.
 */
export function scriptSample(
  texts: readonly string[],
  locale: Locale,
): string | undefined {
  const counts = new Map<string, number>();
  let unsampled: string | undefined;

  for (const letter of texts.flatMap((text) => letters(text))) {
    if (!unreadable(letter, locale)) continue;

    const sample = SCRIPT_SAMPLES.find(([script]) => script.test(letter))?.[1];

    if (sample === undefined) {
      unsampled ??= letter;
    } else {
      counts.set(sample, (counts.get(sample) ?? 0) + 1);
    }
  }

  const [dominant] = [...counts].toSorted(([, a], [, b]) => b - a);

  if (dominant === undefined && unsampled !== undefined) {
    throw new Error(
      `“${unsampled}” is in a script with no sample for the switch to the original; add one to SCRIPT_SAMPLES.`,
    );
  }

  return dominant?.[0];
}

export type WithSpelledName = { name: Spelled };

export type WithSpelledTitle = { title: Spelled };

/** What a text is spelled from: what it is in, and a hand-written Latin spelling where it has one. */
export type Spellable = WithText & {
  language: SungLanguage | 'instrumental';
  latin?: string | undefined;
};

/**
 * A text's spellings under a locale. A hand-written Latin spelling wins over
 * the rule, and only Russian has a rule; anything else the locale cannot read
 * and nothing spells fails the build, naming the text.
 */
export function spell(
  { text, language, latin }: Spellable,
  locale: Locale,
): Spelled {
  if (!needsLatin(text, locale)) return { original: text };

  const spelled = latin ?? (language === 'ru' ? romanizeRussian(text) : null);

  if (spelled === null) {
    throw new Error(
      `“${text}” is in ${language}, which ${locale} readers may not read and no rule romanizes; give it a hand-written Latin spelling.`,
    );
  }

  return { original: text, latin: spelled };
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

  const { title, titleLanguage, language, titleLatin } = frontmatter;

  return spell(
    {
      text: title,
      language: titleLanguage ?? language[0] ?? 'instrumental',
      latin: titleLatin,
    },
    locale,
  );
}

/**
 * The one spelling a string can carry — a page title, a feed item, the lock
 * screen — in the reader's script, Latin where they have not chosen.
 */
export function spelledText(
  { original, latin }: Spelled,
  script: Script = 'latin',
): string {
  return script === 'original' ? original : (latin ?? original);
}
