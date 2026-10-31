import { hush } from './hush';

/** A word and how many times the sites' prose uses it. */
export type Counted = readonly [word: string, count: number];

/** Every word the post knows, filed under how it sounds, commonest first. */
export type Lexicon = ReadonlyMap<string, readonly string[]>;

export function fileBySound(words: readonly Counted[]): Lexicon {
  const lexicon = new Map<string, string[]>();

  // Commonest first overall, so each sound's list comes out in that order too.
  for (const [word] of words.toSorted(([, a], [, b]) => b - a)) {
    const sounds = hush(word);
    const alike = lexicon.get(sounds);

    if (alike) alike.push(word);
    else lexicon.set(sounds, [word]);
  }

  return lexicon;
}

/** The post's reading of a heard word: the commonest that sounds so, and the rest it passed over. */
type Reading =
  | { guess: string; passedOver: readonly string[] }
  | { guess: undefined };

export function readSounds(sounds: string, lexicon: Lexicon): Reading {
  const [guess, ...passedOver] = lexicon.get(sounds) ?? [];

  return guess === undefined ? { guess } : { guess, passedOver };
}
