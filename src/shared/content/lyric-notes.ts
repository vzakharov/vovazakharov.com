import 'server-only';

import type { WithText } from '@/shared/typings';

import { splitStanzas } from './sections';

/**
 * A line of verse, and what the author wrote about it where he wrote something
 * — markdown, one line of it, so a note can carry a link.
 */
export type LyricLine = WithText & { note?: string };

export type Stanzas = LyricLine[][];

export type WithStanzas = { stanzas: Stanzas };

/** `[^label]` on a line: the note that line carries. */
const NOTE_MARKER = /\[\^([^\]\s]+)\]/g;

/** `[^label]: text` on a line of its own: what the note says. */
const NOTE_DEFINITION = /^\[\^([^\]\s]+)\]:\s*(\S.*)$/;

/**
 * Footnotes rather than a syntax of the site's own, because the file is read
 * raw too: GitHub renders a footnote as one, so the served `.md` shows the note
 * where the page shows it on demand. Every marker must resolve, every
 * definition must be used and a line carries one note at most — each of the
 * three fails the build, since a note that is silently dropped is one the
 * author thinks is on the page.
 */
export function readVerse(section: string, fileName: string): Stanzas {
  const notes = new Map<string, string>();
  const verse = section.split('\n').filter((line) => {
    const [, label, note] = NOTE_DEFINITION.exec(line.trim()) ?? [];

    if (label === undefined || note === undefined) return true;
    if (notes.has(label)) {
      throw new Error(`${fileName} defines the note [^${label}] twice.`);
    }

    notes.set(label, note);

    return false;
  });
  const used = new Set<string>();

  const stanzas = splitStanzas(verse.join('\n')).map((stanza) =>
    stanza.map((line): LyricLine => {
      const labels = [...line.matchAll(NOTE_MARKER)].flatMap(([, label]) =>
        label === undefined ? [] : [label],
      );
      const text = line.replaceAll(NOTE_MARKER, '').trimEnd();
      const [label, ...extra] = labels;

      if (label === undefined) return { text };
      if (extra.length > 0) {
        throw new Error(`${fileName}: “${text}” carries more than one note.`);
      }

      const note = notes.get(label);

      if (note === undefined) {
        throw new Error(`${fileName}: [^${label}] has no definition.`);
      }

      used.add(label);

      return { text, note };
    }),
  );

  const unused = [...notes.keys()].filter((label) => !used.has(label));

  if (unused.length > 0) {
    throw new Error(
      `${fileName} defines notes no line carries: ${unused.map((label) => `[^${label}]`).join(', ')}.`,
    );
  }

  return stanzas;
}

/**
 * The same verse with its notes left off — for a column the page is not in,
 * whose notes are written in that column's language rather than the reader's.
 */
export function withoutNotes(stanzas: Stanzas): Stanzas {
  return stanzas.map((stanza) => stanza.map(({ text }) => ({ text })));
}
