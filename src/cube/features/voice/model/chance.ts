import { pathHash, roll } from '@/dice/shared/roll';

const UNIT = roll.uniform(0, 1);

/** A draw on `[0, 1)` per path, the same for the same seed and path. */
export type Dice = (path: string) => number;

/** The voice's dice for `seed`, a floor's number or a room's grain. */
export function diceOf(seed: number): Dice {
  const hash = pathHash(String(Math.abs(Math.trunc(seed))));
  return (path) => UNIT.decode(hash(`voice/${path}`));
}

/** `dice` with every path under `prefix`. */
export const rollsUnder =
  (dice: Dice, prefix: string): Dice =>
  (path) =>
    dice(`${prefix}/${path}`);

export type Some<T> = readonly [T, ...T[]];

/** The one of `items` a draw falls on. */
export const among = <T>(items: Some<T>, draw: number): T =>
  items[Math.floor(draw * items.length)] ?? items[0];

/** An integer in `[lo, hi]` from a draw. */
export const between = (lo: number, hi: number, draw: number): number =>
  lo + Math.floor(draw * (hi - lo + 1));
