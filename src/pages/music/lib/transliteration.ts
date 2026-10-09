import type { SungLanguage } from '@/shared/music-catalogue';

import { carriesNote, type LyricLine, type Stanzas } from './lyric-notes';
import { splitStanzas } from './sections';

/**
 * The words in Latin letters, entry for entry with their read stanzas. An entry
 * of several lines under one note has as many romanized lines, joined by line
 * breaks as its text is.
 */
export type Transliteration = string[][];

/**
 * The BCP 47 tag of a language written in Latin letters — its section's name
 * and its `lang`. Lowercase, as a section marker takes it; BCP 47 ignores case.
 */
export function romanizedTag(language: SungLanguage): string {
  return `${language}-latn`;
}

/** How many authored lines a read entry stands for. */
function linesIn(entry: LyricLine): number {
  return entry
    .map(({ text }) => text)
    .join('')
    .split('\n').length;
}

/**
 * Pairs a transliteration with the words it romanizes, stanza for stanza and
 * line for line, so the page can set each romanized line under its own. Any
 * misalignment fails the build — a romanization one line off reads as the
 * wrong words under every line after it — and so does a note: notes hang off
 * the words, and a romanization is a reading aid for those same words.
 */
export function alignTransliteration(
  stanzas: Stanzas,
  section: string,
  fileName: string,
): Transliteration {
  const romanized = splitStanzas(section);
  const noted = romanized.flat().find((line) => carriesNote(line));

  if (noted !== undefined) {
    throw new Error(
      `${fileName}: the transliteration line “${noted}” carries a note; notes go on the words it romanizes.`,
    );
  }

  if (romanized.length !== stanzas.length) {
    throw new Error(
      `${fileName} has ${String(stanzas.length)} stanzas and ${String(romanized.length)} in its transliteration; they are read line under line, so they must match.`,
    );
  }

  return stanzas.map((entries, index) => {
    const lines = romanized[index] ?? [];
    const counts = entries.map((entry) => linesIn(entry));
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
