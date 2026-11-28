import { through, within } from './span';
import { type Word, WORDS } from './words';

const VOWELS = /[аеёиоуыэюя]/giu;

/** How many syllables `text` sings: one a vowel, and at least one. */
export const syllables = (text: string): number =>
  Math.max(1, text.match(VOWELS)?.length ?? 0);

/**
 * How open the mouth is on `word` at `t`: one bump a syllable, the word's
 * span split evenly between them, each opening fast and closing slower.
 */
function opening(word: Word, t: number): number {
  if (!within(word, t)) return 0;
  const count = syllables(word.text);
  const at = through(word, t) * count;
  const share = at - Math.min(count - 1, Math.floor(at));
  return Math.sin(Math.PI * share ** 0.7) ** 0.6;
}

/**
 * How far the jaw hangs open at `t`, 0 shut to 1 wide: a bump on every sung
 * syllable, shut between words. Where words overlap — a call over a line's
 * tail — the wider of the two holds.
 */
export function jaw(t: number, words: readonly Word[] = WORDS): number {
  let open = 0;
  for (const word of words) {
    if (word.from > t) break;
    open = Math.max(open, opening(word, t));
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
