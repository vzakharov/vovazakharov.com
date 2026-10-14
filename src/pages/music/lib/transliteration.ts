import type { Locale } from '@/shared/i18n';
import type { SungLanguage } from '@/shared/music-catalogue';
import {
  needsLatin,
  romanizeRussian,
  scriptLetters,
} from '@/shared/music-catalogue/index.node-safe';

import {
  carriesNote,
  entryText,
  type LyricLine,
  type Stanzas,
} from './lyric-notes';
import { splitStanzas } from './sections';

/**
 * The words in Latin letters, entry for entry with their read stanzas, where
 * the reader needs them. An entry of several lines under one note has as many
 * romanized lines, joined by line breaks as its text is.
 */
export type Transliteration = Array<Array<string | undefined>>;

/**
 * The BCP 47 tag of a language written in Latin letters — its section's name
 * and its `lang`. Lowercase, as a section marker takes it; BCP 47 ignores case.
 */
export function romanizedTag(language: SungLanguage): string {
  return `${language}-latn`;
}

/** The authored lines a read entry stands for. */
function entryLines(entry: LyricLine): string[] {
  return entryText(entry).split('\n');
}

function sectionMarker(language: SungLanguage): string {
  return `lyrics:${romanizedTag(language)}`;
}

/**
 * A romanized section's stanzas, failing on a note: notes hang off the words,
 * and a romanization is a reading aid for those same words.
 */
function sectionStanzas(section: string, fileName: string): string[][] {
  const stanzas = splitStanzas(section);
  const noted = stanzas.flat().find((line) => carriesNote(line));

  if (noted !== undefined) {
    throw new Error(
      `${fileName}: the transliteration line “${noted}” carries a note; notes go on the words it romanizes.`,
    );
  }

  return stanzas;
}

const LATIN = /\p{Script=Latin}/u;

/** The letters of the script a language is written in. */
function languageScript(language: SungLanguage): RegExp {
  const { script } = new Intl.Locale(language).maximize();

  if (script === undefined) {
    throw new Error(`No script is known for the language “${language}”.`);
  }

  // ISO 15924 tells simplified Chinese from traditional; Unicode has one Han.
  const code = script === 'Hans' || script === 'Hant' ? 'Hani' : script;

  return new RegExp(String.raw`\p{Script=${code}}`, 'u');
}

/** A sung language's own `-latn` section, where the song has one. */
export type RomanizedSection = (language: SungLanguage) => string | undefined;

type LineSource = {
  /** The song's languages written in a script other than Latin, each with its letters. */
  scripts: Array<{ language: SungLanguage; letters: RegExp }>;
  /** The lines of each such language's own section, consumed in order. */
  queues: Map<SungLanguage, string[]>;
  fileName: string;
};

/**
 * One authored line in Latin letters: as written where it has no letters of
 * another script, else from the next line of its language's section, else by
 * rule for Russian.
 */
function romanizeLine(line: string, { scripts, queues, fileName }: LineSource) {
  const sung = scripts.filter(({ letters }) => letters.test(line));
  const [only, other] = sung;
  const unsung = scriptLetters(line).some(
    (letter) =>
      !LATIN.test(letter) && !sung.some(({ letters }) => letters.test(letter)),
  );

  if (unsung) {
    throw new Error(
      `${fileName}: “${line}” has letters in a script none of the song’s languages is written in; name the language in its \`language\`.`,
    );
  }

  if (only === undefined) return line;

  if (other !== undefined) {
    throw new Error(
      `${fileName}: “${line}” mixes ${only.language} and ${other.language} letters; a line is romanized from one language’s section.`,
    );
  }

  const queue = queues.get(only.language);

  if (queue !== undefined) {
    const next = queue.shift();

    if (next === undefined) {
      throw new Error(
        `${fileName}: “${line}” has no line left in the “${sectionMarker(only.language)}” section, which holds one per line with ${only.language} letters, in order.`,
      );
    }

    return next;
  }

  if (only.language === 'ru') return romanizeRussian(line);

  throw new Error(
    `${fileName}: “${line}” is in ${only.language}, which no rule romanizes; give it a line in a “${sectionMarker(only.language)}” section.`,
  );
}

/**
 * Every line in Latin letters, where the main language has no section of its
 * own: each language's section romanizes, in order, only the lines with its
 * letters. Lines left in a section fail the build, as lines short of one do.
 */
function romanizeLines(
  stanzas: Stanzas,
  languages: readonly SungLanguage[],
  romanized: RomanizedSection,
  fileName: string,
): Transliteration {
  const scripts = languages
    .map((language) => ({ language, letters: languageScript(language) }))
    .filter(({ letters }) => !letters.test('a'));
  const queues = new Map(
    scripts.flatMap(({ language }) => {
      const section = romanized(language);

      return section === undefined
        ? []
        : [[language, sectionStanzas(section, fileName).flat()] as const];
    }),
  );
  const source = { scripts, queues, fileName };
  const lines = stanzas.map((entries) =>
    entries.map((entry) =>
      entryLines(entry)
        .map((line) => romanizeLine(line, source))
        .join('\n'),
    ),
  );
  const left = [...queues].find(([, queue]) => queue.length > 0);

  if (left !== undefined) {
    const [language, queue] = left;

    throw new Error(
      `${fileName}: the “${sectionMarker(language)}” section has ${String(queue.length)} line(s) more than the words have lines with ${language} letters.`,
    );
  }

  return lines;
}

/** An entry's Latin spelling, line by line where the reader needs it, else its own. */
function forReader(
  entry: LyricLine,
  latin: string,
  locale: Locale,
): string | undefined {
  const lines = entryLines(entry);
  const romanized = latin.split('\n');
  const needed = lines.map((line) => needsLatin(line, locale));

  if (!needed.includes(true)) return undefined;

  return lines
    .map((line, index) => (needed[index] === true ? romanized[index] : line))
    .join('\n');
}

export type WordsInLatinInput = {
  stanzas: Stanzas;
  locale: Locale;
  /** What the words are sung in, the main language first. */
  languages: readonly SungLanguage[];
  romanized: RomanizedSection;
  fileName: string;
};

/**
 * The words' Latin spelling for one locale's reader: a line has one where it
 * has a letter the reader may not read. The main language's section, where it
 * has one, romanizes the words line under line; otherwise each line goes by
 * `romanizeLine`. Undefined where no line needs it.
 */
export function wordsInLatin({
  stanzas,
  locale,
  languages,
  romanized,
  fileName,
}: WordsInLatinInput): Transliteration | undefined {
  const [main] = languages;
  const full = main === undefined ? undefined : romanized(main);
  const latin =
    full === undefined
      ? romanizeLines(stanzas, languages, romanized, fileName)
      : alignTransliteration(stanzas, full, fileName);
  const shown = stanzas.map((entries, stanza) =>
    entries.map((entry, index) => {
      const spelled = latin[stanza]?.[index];

      return spelled === undefined
        ? undefined
        : forReader(entry, spelled, locale);
    }),
  );

  return shown.flat().some((line) => line !== undefined) ? shown : undefined;
}

/**
 * Pairs a transliteration with the words it romanizes, stanza for stanza and
 * line for line, so the page can set each romanized line under its own. Any
 * misalignment fails the build: a romanization one line off reads as the wrong
 * words under every line after it.
 */
export function alignTransliteration(
  stanzas: Stanzas,
  section: string,
  fileName: string,
): Transliteration {
  const romanized = sectionStanzas(section, fileName);

  if (romanized.length !== stanzas.length) {
    throw new Error(
      `${fileName} has ${String(stanzas.length)} stanzas and ${String(romanized.length)} in its transliteration; they are read line under line, so they must match.`,
    );
  }

  return stanzas.map((entries, index) => {
    const lines = romanized[index] ?? [];
    const counts = entries.map((entry) => entryLines(entry).length);
    const expected = counts.reduce((sum, count) => sum + count, 0);

    if (lines.length !== expected) {
      throw new Error(
        `${fileName}: stanza ${String(index + 1)} has ${String(expected)} lines and ${String(lines.length)} in its transliteration; they are read line under line, so they must match.`,
      );
    }

    let from = 0;

    return counts.map((count) => {
      const under = lines.slice(from, from + count).join('\n');

      from += count;

      return under;
    });
  });
}
