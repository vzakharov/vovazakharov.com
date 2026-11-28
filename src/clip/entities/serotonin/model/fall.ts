import type { Angled, Seeded, Sized } from '@/kernel/shared/typings';

import type { Point as ScenePoint } from '@/scene/shared/lib/plane';

import { rng } from '@/clip/shared/ink';

/** What falls: a two-tone capsule, a scored tablet, a flake of one broken. */
export const KINDS = ['capsule', 'tablet', 'flake'] as const;
export type Kind = (typeof KINDS)[number];

/** Far to near: far flecks are small and slow, near ones big and quick. */
export const DEPTHS = [0, 1, 2] as const;
export type Depth = (typeof DEPTHS)[number];

/** One fleck in the fall, fixed for good by the pool's seed. */
export type Fleck = {
  shape: Kind;
  layer: Depth;
  /** Where it falls across the area, 0 to 1. */
  lane: number;
  /** How far through its fall it is at time 0, 0 to 1. */
  headStart: number;
  /** Which of the kind's colourings it wears. */
  colouring: number;
  /** Its size against its depth's, about 1. */
  bulk: number;
  /** Whole turns per period, either way. */
  spin: number;
  /** Whole sways per period, and how far each sways against its size. */
  swayTimes: number;
  swayAmount: number;
};

export type Fall = Partial<Seeded> &
  Sized & {
    /** How thick it falls, 0 to 1 of the pool; 0.5 by default. */
    density?: number;
    /** Stage units sideways per unit fallen; slants the fall. 0.15 by default. */
    wind?: number;
    /** Seconds before the fall repeats exactly; 12 by default. */
    period?: number;
  };

/** Where a fleck is at a moment, and how it is turned. */
export type FleckState = ScenePoint &
  Angled & {
    /** Its drawn size in stage units. */
    fleckSize: number;
  };

/** The largest fall there is; `density` takes a prefix of it. */
export const POOL_SIZE = 260;

// Per depth: whole falls per period, and a fleck's size in stage units.
const FALLS_PER_PERIOD: Readonly<Record<Depth, number>> = { 0: 1, 1: 2, 2: 3 };
const ACROSS: Readonly<Record<Depth, number>> = { 0: 11, 1: 20, 2: 34 };

const pools = new Map<number, readonly Fleck[]>();

/**
 * The fall's flecks, fixed by `seed`. A thinner fall is a prefix of a
 * thicker one, so turning `density` up adds flecks and moves none.
 */
export function fleckPool(seed: number): readonly Fleck[] {
  const cached = pools.get(seed);
  if (cached) return cached;
  const next = rng(seed);
  const pick = <T>(of: readonly [T, ...T[]]): T =>
    of[Math.floor(next() * of.length)] ?? of[0];
  const pool = Array.from({ length: POOL_SIZE }, (): Fleck => {
    const roll = next();
    return {
      shape: roll < 0.45 ? 'capsule' : roll < 0.8 ? 'tablet' : 'flake',
      layer: pick(DEPTHS),
      lane: next(),
      headStart: next(),
      colouring: Math.floor(next() * 3),
      bulk: 0.8 + next() * 0.4,
      spin: pick([-2, -1, 1, 2]),
      swayTimes: pick([1, 2, 3]),
      swayAmount: 0.6 + next() * 1.4,
    };
  });
  pools.set(seed, pool);
  return pool;
}

const fraction = (value: number): number => value - Math.floor(value);

/**
 * Where `fleck` is at `t`. Every motion repeats a whole number of times per
 * `period`, so the fall at `t` and at `t + period` is the same picture and
 * a loop of it has no seam.
 */
export function fleckAt(fleck: Fleck, t: number, fall: Fall): FleckState {
  const { width, height, wind = 0.15, period = 12 } = fall;
  const { layer, lane, headStart, bulk, spin, swayTimes, swayAmount } = fleck;
  const fleckSize = ACROSS[layer] * bulk;
  const cycle = t / period;
  const fallen = fraction(headStart + cycle * FALLS_PER_PERIOD[layer]);
  // It enters above the area and leaves below it, never popping in sight.
  const span = height + fleckSize * 4;
  const y = fallen * span - fleckSize * 2;
  const sway =
    Math.sin((cycle * swayTimes + headStart) * Math.PI * 2) *
    fleckSize *
    swayAmount;
  const run = width + fleckSize * 4;
  const x =
    fraction((lane * run + wind * y + sway) / run) * run - fleckSize * 2;
  const angle = (headStart + cycle * spin) * Math.PI * 2;
  return { x, y, angle, fleckSize };
}

/** The flecks falling at `density`, far ones first so near ones cover them. */
export function fallingFlecks(fall: Fall): readonly Fleck[] {
  const { density = 0.5, seed = 0 } = fall;
  const count = Math.round(Math.min(1, Math.max(0, density)) * POOL_SIZE);
  return fleckPool(seed)
    .slice(0, count)
    .toSorted((a, b) => a.layer - b.layer);
}
