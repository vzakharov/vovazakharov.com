import type { Ranged, WithText } from '@/kernel/shared/typings';

import { CALL_WORDS, CHANT_WORDS, SUNG_LINES, type Word } from './words';

/** Who sings a line: the lead, the verse's shouted call, or the chant. */
const LINE_KINDS = ['sung', 'call', 'chant'] as const;

export type LineKind = (typeof LINE_KINDS)[number];

/** One line of the song as the words publish it, from its first word's onset to its last word's end. */
export type Line = Ranged &
  WithText & {
    kind: LineKind;
    words: readonly Word[];
    /** Where each word begins in `text`, in characters. */
    starts: readonly number[];
  };

/**
 * How soon after a sung line a chanted «Хорошо» must come to finish it, in
 * seconds: «Не сдохнуть бы, как» is answered by the chant, which the lyrics
 * print as the line's last word.
 */
const CLOSES_WITHIN = 0.5;

/** The words joined as printed — a word ending in a hyphen runs into the next — and where each begins. */
function lineOf(kind: LineKind, words: readonly Word[]): Line {
  const [first] = words;
  const last = words.at(-1);
  if (!first || !last) throw new Error('A line needs a word');
  let text = '';
  const starts: number[] = [];
  for (const word of words) {
    if (text !== '' && !text.endsWith('-')) text += ' ';
    starts.push(text.length);
    text += word.text;
  }
  const { from } = first;
  const { to } = last;
  return { kind, words, starts, text, from, to };
}

/**
 * Every line in order of onset: each published line of the lead's, each of
 * the verse's calls and each chanted «Хорошо» a line of its own, save a chant
 * that finishes the sung line just before it.
 */
export function linesOf(
  sung: ReadonlyArray<readonly Word[]>,
  calls: readonly Word[],
  chant: readonly Word[],
): readonly Line[] {
  const closing = new Set<Word>();
  const lines = sung.map((words) => {
    const end = words.at(-1)?.to ?? -Infinity;
    const closer = chant.find(
      ({ from }) => from >= end && from - end <= CLOSES_WITHIN,
    );
    if (!closer) return lineOf('sung', words);
    closing.add(closer);
    return lineOf('sung', [
      ...words,
      { ...closer, text: closer.text.toLowerCase() },
    ]);
  });
  return [
    ...lines,
    ...calls.map((call) => lineOf('call', [call])),
    ...chant
      .filter((word) => !closing.has(word))
      .map((word) => lineOf('chant', [word])),
  ].toSorted((a, b) => a.from - b.from);
}

/** The song's lines. */
export const LYRIC_LINES: readonly Line[] = linesOf(
  SUNG_LINES,
  CALL_WORDS,
  CHANT_WORDS,
);

/** The latest line begun by `t`, whether or not it is still being sung; none before the first. */
export const lineAt = (
  t: number,
  lines: readonly Line[] = LYRIC_LINES,
): Line | undefined => lines.findLast((line) => line.from <= t);
