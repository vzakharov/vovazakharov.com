import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import { clamp01 } from '@/cube/shared/lib/ease';

import { CYCLE } from '../../dsp';

/** Seconds in the hour every motion outside comes round in. */
export const SECONDS_AN_HOUR = 3600;

const Turns = roll.uniform(0, 1);

const Weather = roll.struct({
  gusts: roll.struct({
    a: Turns,
    b: Turns,
    c: Turns,
    d: Turns,
    e: Turns,
  }),
  wash: roll.struct({ left: Turns, right: Turns }),
});

const weatherHash = pathHash('0');
const rolled = rollWith(Weather, (path) =>
  weatherHash(`cube/sound/weather/${path}`),
);

/**
 * Where in its swell, as a fraction of a turn, each ear's open-sea wash
 * starts: the two ears are never quite in step.
 */
export const WASH_TURNS = rolled.wash;

/**
 * The gusts' schedule: how many times an hour each of its slow waves comes
 * round, and where in its turn it starts. Whole numbers of turns, none a
 * multiple of another, so the hour repeats and nothing within it does.
 */
const GUST_WAVES = [
  { turns: 23, starts: rolled.gusts.a, weight: 1 },
  { turns: 41, starts: rolled.gusts.b, weight: 0.9 },
  { turns: 73, starts: rolled.gusts.c, weight: 0.7 },
  { turns: 127, starts: rolled.gusts.d, weight: 0.5 },
  { turns: 211, starts: rolled.gusts.e, weight: 0.3 },
] as const;

const WEIGHT = GUST_WAVES.reduce((sum, { weight }) => sum + weight, 0);

/**
 * How hard the wind is gusting `seconds` into the hour, from 0 (the steady
 * breeze) to 1 (the hour's hardest gust): most of the time near nothing, a
 * gust every half minute or so, a hard one every few minutes.
 */
export function gustAt(seconds: number): number {
  const x = seconds / SECONDS_AN_HOUR;
  let sum = 0;
  for (const { turns, starts, weight } of GUST_WAVES) {
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
