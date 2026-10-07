import type { Labeled, WithText } from '@/shared/typings';

import { splitStanzas } from './sections';

/** A stretch of a line, and the note it carries where it has one — a line of markdown, so it can link. */
type LyricSpan = WithText & { note?: string };

/**
 * A line of verse, cut where its notes begin and end — one plain span where it
 * has none. Consecutive lines under one whole-line note are one entry, a single
 * span whose text keeps their line breaks, so the page marks them as one block.
 */
export type LyricLine = LyricSpan[];

export type Stanzas = LyricLine[][];

export type WithStanzas = { stanzas: Stanzas };

/**
 * `[phrase][^label]`: the note hangs off that phrase. A bare `[^label]`: off
 * the whole line, and off every consecutive line of the stanza ending in the
 * same one. The brackets are what GitHub leaves visible around a phrase, which
 * reads as the span the footnote is about.
 */
const NOTE_MARKER = /(?:\[([^[\]]+)])?\[\^([^\s\]]+)]/g;

/**
 * A backslash before ASCII punctuation, which is how markdown — and Prettier,
 * formatting the file — writes a literal `*` in a masked `f*ck`. The page sets
 * the words as text, so it drops the escape GitHub would have consumed.
 */
const MARKDOWN_ESCAPE = /\\([!-/:-@[-`{-~])/g;

function unescaped(text: string): string {
  return text.replaceAll(MARKDOWN_ESCAPE, '$1');
}

/** A line's note on the whole of it, which the next line can extend by ending in the same label. */
type Whole = Labeled & { span: LyricSpan };

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

  function readLine(line: string): { spans: LyricLine; whole?: Whole } {
    const markers = [...line.matchAll(NOTE_MARKER)];
    const whole = markers.find(([, phrase]) => phrase === undefined);

    if (whole !== undefined) {
      const [marker, , label = ''] = whole;
      const text = unescaped(line.replace(marker, '').trimEnd());

      if (markers.length > 1) {
        throw new Error(
          `${fileName}: “${text}” carries a note on the whole line and another besides.`,
        );
      }

      const span = { text, note: noteFor(label) };

      return { spans: [span], whole: { label, span } };
    }

    const spans: LyricSpan[] = [];
    let from = 0;

    for (const { 0: marker, 1: phrase = '', 2: label, index } of markers) {
      if (index > from)
        spans.push({ text: unescaped(line.slice(from, index)) });
      spans.push({ text: unescaped(phrase), note: noteFor(label) });
      from = index + marker.length;
    }

    if (from < line.length || spans.length === 0) {
      spans.push({ text: unescaped(line.slice(from)) });
    }

    return { spans };
  }

  function readStanza(lines: string[]): LyricLine[] {
    const read: LyricLine[] = [];
    let open: Whole | undefined;

    for (const line of lines) {
      const { spans, whole } = readLine(line);

      if (whole !== undefined && whole.label === open?.label) {
        open.span.text += `\n${whole.span.text}`;
        continue;
      }

      read.push(spans);
      open = whole;
    }

    return read;
  }

  // Trimmed, or the blank line before trailing definitions is left as an empty
  // last line of the last stanza.
  const stanzas = splitStanzas(verse.join('\n').trim()).map((stanza) =>
    readStanza(stanza),
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
