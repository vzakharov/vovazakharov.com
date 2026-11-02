import type { Typed } from '@/kernel/shared/typings';

/**
 * What the bug hears of a keystroke: one of sixteen sounds. The real GUNMAN
 * encoding was never published; this one keeps its shape — four bits a key,
 * several letters to a sound — and assigns letters by frequency, `index % 16`,
 * so each sound pairs a common letter with a rare one.
 */
const ALPHABETS = [
  'оеаинтсрвлкмдпуяыьгзбчйхжшюцщэфъ',
  'etaoinshrdlcumwfgypbvkjxqz',
] as const;

const SOUNDS = '0123456789ABCDEF';

const SOUND_OF = new Map(
  ALPHABETS.flatMap((alphabet) =>
    Array.from(
      alphabet,
      (letter, index) => [letter, SOUNDS[index % 16]] as const,
    ),
  ),
);

/** The spelling both the lexicon and the bug go by. */
export const fold = (word: string) => word.toLowerCase().replaceAll('ё', 'е');

/** A word as the listening post receives it: one sound a letter. */
export function hush(word: string): string {
  return Array.from(fold(word), (letter) => {
    const sound = SOUND_OF.get(letter);

    if (sound === undefined) throw new Error(`No sound for “${letter}”`);

    return sound;
  }).join('');
}

export type Stretch = Typed &
  ({ word: true; sounds: string } | { word: false });

/** Splits typing into words, which the bug hears, and what lies between, which it hears only as a pause. */
export function overhear(text: string): Stretch[] {
  return [...text.matchAll(/([a-zа-яё]+)|[^a-zа-яё]+/gi)].map(
    ([typed, word]) =>
      word === undefined
        ? { typed, word: false }
        : { typed, word: true, sounds: hush(word) },
  );
}
