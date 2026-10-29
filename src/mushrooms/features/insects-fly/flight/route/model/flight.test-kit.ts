import type { Perches } from './offered';

export const kind = 'butterfly' as const;

/** No spotted caps, and nowhere to plant: what the butterfly's legs never read. */
export const BARE = { spotted: [], room: [] } as const;

export const CAPS = ['mushroom-1', 'mushroom-2', 'mushroom-3'];
export const FLOWERS = Array.from(
  { length: 7 },
  (_, index) => `flower-${index + 1}`,
);
export const PERCHES: Perches = {
  caps: CAPS,
  flowers: FLOWERS,
  air: [],
  crowded: [],
  ...BARE,
};

export const SEEDS = Array.from(
  { length: 200 },
  (_, index) => index * 7919 + 1,
);

export const within = (value: number, [min, max]: readonly [number, number]) =>
  value >= min && value <= max;
