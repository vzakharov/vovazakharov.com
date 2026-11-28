import { voice } from './energy';
import { through, within } from './span';
import { type Word, WORDS } from './words';

const VOWELS = /[аеёиоуыэюя]/giu;

/** How loud the voice reads with the mouth still shut: breath and consonants. */
const SHUT_BELOW = 0.45;

/** How loud the voice is at `t`, or `undefined` where nothing measured it. */
export type Loudness = (t: number) => number | undefined;

/** How many syllables `text` sings: one a vowel, and at least one. */
export const syllables = (text: string): number =>
  Math.max(1, text.match(VOWELS)?.length ?? 0);

/**
 * How open the mouth is on `word` at `t` with no stem to read: one bump a
 * syllable, the word's span split evenly between them, each opening fast
 * and closing slower.
 */
function syllableOpening(word: Word, t: number): number {
  const count = syllables(word.text);
  const at = through(word, t) * count;
  const share = at - Math.min(count - 1, Math.floor(at));
  return Math.sin(Math.PI * share ** 0.7) ** 0.6;
}

/** How open the mouth is for a voice heard at `level`. */
const openFor = (level: number): number =>
  Math.min(1, Math.max(0, (level - SHUT_BELOW) / (1 - SHUT_BELOW)));

/**
 * How far the jaw hangs open at `t`, 0 shut to 1 wide: shut between words,
 * and inside one as loud as the vocal stem sings it, or a bump a syllable
 * where the stem has nothing. Where words overlap — a call over a line's
 * tail — the wider holds.
 */
export function jaw(
  t: number,
  words: readonly Word[] = WORDS,
  loudness: Loudness = voice,
): number {
  let open = 0;
  for (const word of words) {
    if (word.from > t) break;
    if (!within(word, t)) continue;
    const heard = loudness(t);
    open = Math.max(
      open,
      heard === undefined ? syllableOpening(word, t) : openFor(heard),
    );
  }
  return open;
}

/** The word sung at `t`, the latest begun where two overlap; none between words. */
export function wordAt(
  t: number,
  words: readonly Word[] = WORDS,
): Word | undefined {
  return words.findLast((word) => within(word, t));
}
