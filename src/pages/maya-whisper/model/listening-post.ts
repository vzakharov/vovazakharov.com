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

/**
 * The post's reading of one heard word: the commonest word that sounds so, and
 * the others it passed over. No guess where nothing in the lexicon sounds so.
 */
type Reading =
  | { guess: string; passedOver: readonly string[] }
  | { guess: undefined };

export function readSounds(sounds: string, lexicon: Lexicon): Reading {
  const [guess, ...passedOver] = lexicon.get(sounds) ?? [];

  return guess === undefined ? { guess } : { guess, passedOver };
}
