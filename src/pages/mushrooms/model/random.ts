import type { Bent } from './geometry';

/** What a creature is grown from: its genes are a pure function of it. */
export type Seeded = { seed: number };
/** The seeds a few creatures will grow from, drawn before they grow, in order. */
export type Seeds = { seeds: readonly number[] };
/** The creature one grew from, by its id: a bee's flower's, a sprout's mushroom. */
export type Parented = { parent: string };

/**
 * A creature's own shift off its base hue, as a fraction of the colour wheel:
 * the base lives in `palette.ts`, the nudge in the genes.
 */
export type Nudged = { hueNudge: number };

/** A thing grown on a stem, a mushroom or a flower: the stem's bend, and its colour's nudge. */
export type Stalked = Bent & Nudged;

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

/**
 * The source for the `index`th draw of one stream off `seed`, `salt` keeping
 * that stream apart from every other grown off the same seed.
 */
export function saltedStream(
  seed: number,
  salt: number,
  index: number,
): Random {
  return mulberry32(((seed ^ salt) + index) >>> 0);
}

export function between(random: Random, min: number, max: number): number {
  return min + random() * (max - min);
}

/** A number from `min` to `max` drawn nearer `min` the higher `skew` is: `between` where it is 1. */
export function skewedBetween(
  random: Random,
  min: number,
  max: number,
  skew: number,
): number {
  return min + random() ** skew * (max - min);
}

/** A whole number from `least` to `most`, each as likely. */
export function countFrom(
  random: Random,
  [least, most]: readonly [number, number],
): number {
  return least + Math.floor(random() * (most - least + 1));
}

/** One of `items`, each as likely as the next. */
export function pick<Item>(
  random: Random,
  items: readonly [Item, ...Item[]],
): Item {
  return items[Math.floor(random() * items.length)] ?? items[0];
}

/**
 * One of `items`, each as likely as its `weight` says: one with weight 3 is
 * three times as likely as one with weight 1. Draws once, as `pick` does, so
 * where every weight is 1 it picks what `pick` would.
 */
export function weighted<Item>(
  random: Random,
  items: readonly [Item, ...Item[]],
  weight: (item: Item) => number,
): Item {
  const total = items.reduce((sum, item) => sum + weight(item), 0);
  let left = random() * total;
  for (const item of items) {
    left -= weight(item);
    if (left < 0) return item;
  }
  return items.at(-1) ?? items[0];
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
