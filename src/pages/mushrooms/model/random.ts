/** What a creature is grown from: its genes are a pure function of it. */
export type Seeded = { seed: number };

/** A source of uniform numbers in `[0, 1)`. */
export type Random = () => number;

/**
 * A seeded source, so a seed alone reproduces everything grown from it. The
 * algorithm is mulberry32: 32 bits of state, fast, and well spread even for
 * neighbouring seeds, which is what a meadow of consecutive seeds needs.
 */
export function mulberry32(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d_2b_79_f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 2 ** 32;
  };
}

export function between(random: Random, min: number, max: number): number {
  return min + random() * (max - min);
}

/** Each named gene's `[min, max]`, the bounds it is drawn between. */
export type GeneRanges<Name extends string = string> = Record<
  Name,
  readonly [number, number]
>;

/** Draws a gene between its bounds in `ranges`, one call to `random` each. */
export function geneFrom<Name extends string>(
  random: Random,
  ranges: GeneRanges<Name>,
): (name: Name) => number {
  return (name) => {
    const [min, max] = ranges[name];
    return between(random, min, max);
  };
}

/** A fresh 32-bit seed, for whatever is about to be grown. */
export function nextSeed(random: Random): number {
  return Math.floor(random() * 2 ** 32);
}
