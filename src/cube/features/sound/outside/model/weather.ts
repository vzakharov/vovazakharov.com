import { clamp01 } from '@/cube/shared/lib/ease';

import { CYCLE } from '../../dsp';

/** Seconds in the hour every motion outside comes round in. */
export const HOUR = 3600;

/**
 * The gusts' schedule: how many times an hour each of its slow waves comes
 * round, and where in its turn it starts. Whole numbers of turns, none a
 * multiple of another, so the hour repeats and nothing within it does.
 */
const WAVES = [
  { turns: 23, starts: 0.11, weight: 1 },
  { turns: 41, starts: 0.53, weight: 0.9 },
  { turns: 73, starts: 0.87, weight: 0.7 },
  { turns: 127, starts: 0.29, weight: 0.5 },
  { turns: 211, starts: 0.71, weight: 0.3 },
] as const;

const WEIGHT = WAVES.reduce((sum, { weight }) => sum + weight, 0);

/**
 * How hard the wind is gusting `seconds` into the hour, from 0 (the steady
 * breeze) to 1 (the hour's hardest gust): most of the time near nothing, a
 * gust every half minute or so, a hard one every few minutes.
 */
export function gustAt(seconds: number): number {
  const x = seconds / HOUR;
  let sum = 0;
  for (const { turns, starts, weight } of WAVES) {
    sum += weight * Math.sin(CYCLE * (turns * x + starts));
  }
  // Only where the waves pile up is there a gust.
  return clamp01((sum / WEIGHT + 0.12) / 0.62) ** 2;
}

/**
 * Where the wind comes from, as a unit step on the ground toward it: off the
 * sea to the west-south-west, behind whoever wakes on the beach and looks at
 * the cube.
 */
export const UPWIND = [-0.8, 0.6] as const;
