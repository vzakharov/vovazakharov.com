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
 * How far the jaw hangs open at `t`, 0 shut to 1 wide: as loud as the vocal
 * stem sings there, wherever the stem was measured. The words' spans do not
 * gate it: they are Whisper's, which ends a held vowel early and opens a word
 * late by up to a fifth of a second, and the singer runs most lines together,
 * so a jaw shut between spans snaps closed mid-note. Past the stem's end, a
 * bump a syllable inside each word, the wider holding where words overlap.
 */
export function jaw(
  t: number,
  words: readonly Word[] = WORDS,
  loudness: Loudness = voice,
): number {
  const heard = loudness(t);
  if (heard !== undefined) return openFor(heard);
  let open = 0;
  for (const word of words) {
    if (word.from > t) break;
    if (within(word, t)) open = Math.max(open, syllableOpening(word, t));
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
