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

export function pick<Item>(random: Random, items: readonly Item[]): Item {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) throw new Error('pick from an empty list');
  return item;
}

export function chance(random: Random, probability: number): boolean {
  return random() < probability;
}

/** A fresh 32-bit seed, for whatever is about to be grown. */
export function nextSeed(random: Random): number {
  return Math.floor(random() * 2 ** 32);
}
