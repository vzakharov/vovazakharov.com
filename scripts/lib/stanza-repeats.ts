/**
 * Runs of identical consecutive stanzas in a song's lyrics, and the rewrite
 * that collapses each into its first stanza closed by `xN` — how the catalogue
 * writes a repeat (`schadina.md`). A stanza already closed by `xN` counts N
 * times, so a run that continues past one adds to it.
 *
 * Every lyrics section of a song is read stanza for stanza against the others —
 * the crib beside the words, a romanization under them — so a repeat collapses
 * only where every section repeats at the same stanza, which keeps them
 * aligned. One that repeats in some sections and not the rest is not a
 * repeat; one in a song whose sections have already slipped apart is refused
 * and left to a person.
 */

import { splitSections } from '../../src/pages/music/index.node-safe.ts';
import type { Named, WithText } from '../../src/shared/typings/index.ts';
import { frontmatterSpan, type WithStart } from './public-markdown.ts';

const LYRICS = 'lyrics:';

/** `x2`, `x3` …: the stanza it closes is sung that many times. */
const REPEAT = /^x(\d+)$/;

/**
 * `[^label]: …`, a note's definition, which the page lifts out of the verse —
 * so a block of nothing else is no stanza. The syntax is `NOTE_DEFINITION`'s in
 * `src/pages/music/lib/lyric-notes.ts`, a module bare Node cannot import.
 */
const NOTE_DEFINITION = /^\[\^[^\s\]]+]:/;

/** A blank line, however many, between two blocks; captured so a split keeps it. */
const BETWEEN_BLOCKS = /(\n\s*\n)/;

/** Offset of the stanza's first character in the file. */
type WithOffset = { offset: number };

type Stanza = WithOffset &
  // `text`: the lines, trimmed, without a closing `xN`.
  WithText & {
    /** Index into the section's parts. */
    part: number;
    times: number;
  };

type Section = Named &
  // `start`: offset of the section's text in the file.
  WithStart & {
    /** Blocks at even indices, the blank lines between them at odd ones. */
    parts: string[];
    stanzas: Stanza[];
  };

/** A stanza that repeats the one before it; `refused` says why it stays when it cannot collapse. */
type Repeat = WithOffset & { section: string; refused?: string };

export type StanzaRepeats = {
  repeats: Repeat[];
  /** The file with every repeat that can collapse collapsed. */
  fixed: string;
};

/** The block's closing `xN`, matched, where it has one under at least one line. */
function closingRepeat(lines: readonly string[]): RegExpExecArray | null {
  return lines.length > 1 ? REPEAT.exec(lines.at(-1)?.trim() ?? '') : null;
}

function readStanza(block: string): Pick<Stanza, 'text' | 'times'> | undefined {
  const lines = block.split('\n').map((line) => line.trim());
  if (lines.every((line) => NOTE_DEFINITION.test(line))) return undefined;
  const times = closingRepeat(lines);
  return times
    ? { text: lines.slice(0, -1).join('\n'), times: Number(times[1]) }
    : { text: lines.join('\n'), times: 1 };
}

function readSection(name: string, text: string, start: number): Section {
  const parts = text.split(BETWEEN_BLOCKS);
  const stanzas: Stanza[] = [];
  let offset = start;
  for (const [part, block] of parts.entries()) {
    const stanza = part % 2 === 0 ? readStanza(block) : undefined;
    if (stanza) stanzas.push({ part, offset, ...stanza });
    offset += block.length;
  }
  return { name, start, parts, stanzas };
}

/** The song's lyrics sections, in file order, each located in `source`. */
function lyricsSections(source: string): Section[] {
  let cursor = frontmatterSpan(source)?.end ?? 0;
  const sections: Section[] = [];
  // `splitSections` hands back each section's text trimmed and in file order,
  // so the first occurrence past the previous one is that section's own.
  for (const [key, text] of splitSections(source.slice(cursor))) {
    const at = source.indexOf(text, cursor);
    cursor = at + text.length;
    if (key.startsWith(LYRICS)) sections.push(readSection(key, text, at));
  }
  return sections;
}

function repeatsBefore({ stanzas }: Section, index: number): boolean {
  const [previous, stanza] = [stanzas[index - 1], stanzas[index]];
  return previous !== undefined && previous.text === stanza?.text;
}

function closeWith(block: string, times: number): string {
  const lines = block.split('\n');
  const closed = closingRepeat(lines) !== null;
  return [...(closed ? lines.slice(0, -1) : lines), `x${String(times)}`].join(
    '\n',
  );
}

/** The section's text with the stanzas at `collapsing` folded into the ones they repeat. */
function collapse(section: Section, collapsing: ReadonlySet<number>): string {
  const parts = [...section.parts];
  let head: Stanza | undefined;
  let times = 0;

  function closeHead(): void {
    if (head && times !== head.times)
      parts[head.part] = closeWith(parts[head.part] ?? '', times);
  }

  for (const [index, stanza] of section.stanzas.entries()) {
    if (collapsing.has(index)) {
      times += stanza.times;
      // The block and the blank lines before it; a note block between the two
      // stanzas keeps the blank lines on its own side.
      parts[stanza.part] = '';
      parts[stanza.part - 1] = '';
      continue;
    }
    closeHead();
    head = stanza;
    times = stanza.times;
  }
  closeHead();
  return parts.join('');
}

export function stanzaRepeats(source: string): StanzaRepeats {
  const sections = lyricsSections(source);
  const counts = new Set(sections.map(({ stanzas }) => stanzas.length));
  const aligned = counts.size <= 1;
  const longest = Math.max(0, ...counts);
  const collapsing = new Set<number>();
  const repeats: Repeat[] = [];

  for (let index = 1; index < longest; index++) {
    const repeating = sections.filter((section) =>
      repeatsBefore(section, index),
    );
    // A stanza that repeats in one section and not another is not a repeat of
    // the song: `sonnet-74` sings its couplet again in a variant, and the
    // crib, being Shakespeare's own text, repeats it unchanged.
    if (
      repeating.length === 0 ||
      (aligned && repeating.length < sections.length)
    )
      continue;
    const refused = aligned
      ? undefined
      : 'its lyrics sections have different stanza counts, so collapsing one would misalign them';
    if (refused === undefined) collapsing.add(index);
    for (const { name, stanzas } of repeating)
      repeats.push({
        section: name,
        offset: stanzas[index]?.offset ?? 0,
        ...(refused !== undefined && { refused }),
      });
  }

  const fixed = sections
    .toReversed()
    .reduce(
      (text, section) =>
        text.slice(0, section.start) +
        collapse(section, collapsing) +
        text.slice(section.start + section.parts.join('').length),
      source,
    );

  return { repeats, fixed };
}
