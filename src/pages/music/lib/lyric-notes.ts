import 'server-only';

import type { WithText } from '@/shared/typings';

import { splitStanzas } from './sections';

/** A stretch of a line, and the note it carries where it has one — a line of markdown, so it can link. */
type LyricSpan = WithText & { note?: string };

/** A line of verse, cut where its notes begin and end — one plain span where it has none. */
export type LyricLine = LyricSpan[];

export type Stanzas = LyricLine[][];

export type WithStanzas = { stanzas: Stanzas };

/**
 * `[phrase][^label]`: the note hangs off that phrase. A bare `[^label]`: off
 * the whole line. The brackets are what GitHub leaves visible around a phrase,
 * which reads as the span the footnote is about.
 */
const NOTE_MARKER = /(?:\[([^[\]]+)])?\[\^([^\s\]]+)]/g;

/** `[^label]: text` on a line of its own: what the note says. */
const NOTE_DEFINITION = /^\[\^([^\s\]]+)]:\s*(\S.*)$/;

/**
 * Every marker must resolve, every definition be used, and a line noted as a
 * whole carry no other note — each fails the build, a silently dropped note
 * being one the author thinks is on the page.
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

  function noteFor(label: string | undefined): string {
    const note = label === undefined ? undefined : notes.get(label);

    if (label === undefined || note === undefined) {
      throw new Error(`${fileName}: [^${String(label)}] has no definition.`);
    }

    used.add(label);

    return note;
  }

  function readLine(line: string): LyricLine {
    const markers = [...line.matchAll(NOTE_MARKER)];
    const whole = markers.find(([, phrase]) => phrase === undefined);

    if (whole !== undefined) {
      const text = line.replace(whole[0], '').trimEnd();

      if (markers.length > 1) {
        throw new Error(
          `${fileName}: “${text}” carries a note on the whole line and another besides.`,
        );
      }

      return [{ text, note: noteFor(whole[2]) }];
    }

    const spans: LyricSpan[] = [];
    let from = 0;

    for (const { 0: marker, 1: phrase = '', 2: label, index } of markers) {
      if (index > from) spans.push({ text: line.slice(from, index) });
      spans.push({ text: phrase, note: noteFor(label) });
      from = index + marker.length;
    }

    if (from < line.length || spans.length === 0) {
      spans.push({ text: line.slice(from) });
    }

    return spans;
  }

  const stanzas = splitStanzas(verse.join('\n')).map((stanza) =>
    stanza.map((line) => readLine(line)),
  );
  const unused = [...notes.keys()].filter((label) => !used.has(label));

  if (unused.length > 0) {
    throw new Error(
      `${fileName} defines notes nothing carries: ${unused.map((label) => `[^${label}]`).join(', ')}.`,
    );
  }

  return stanzas;
}

/**
 * The same verse with its notes left off — for a column the page is not in,
 * whose notes are written in that column's language rather than the reader's.
 */
export function withoutNotes(stanzas: Stanzas): Stanzas {
  return stanzas.map((stanza) =>
    stanza.map((line) => [{ text: line.map(({ text }) => text).join('') }]),
  );
}
