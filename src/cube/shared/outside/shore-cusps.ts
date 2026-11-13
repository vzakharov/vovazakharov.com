import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import type { Vec2 } from '../lib/vec';
import { f32, wgsl } from '../shader/wgsl';
import { RADIANS_A_TURN, SEA_WORLD, SWELL_RUNS } from './swell';

/**
 * The shore's cusps: a wave is not thrown equally far all along a beach, so
 * its swash runs up the sand in tongues. Three rolled sines of the place along
 * the crest, fixed to the island; written twice, and `swell.test.ts` runs the
 * WGSL against the TypeScript.
 */

/** Each sine's [shortest length, metres; how much longer it may be; size]. */
const CUSPS_IN = [
  [4.5, 3, 0.07],
  [10, 6, 0.1],
  [21, 12, 0.12],
] as const;

const cuspRoll = roll.struct({
  longer: roll.uniform(0, 1),
  start: roll.uniform(0, 1),
});

const hash = pathHash(SEA_WORLD);

const rolled = rollWith(
  roll.struct({ short: cuspRoll, middle: cuspRoll, long: cuspRoll }),
  (path) => hash(`island/sea/cusps/${path}`),
);

/** [turns a metre, size, where it starts in turns]. */
const CUSPS = [rolled.short, rolled.middle, rolled.long].map(
  ({ longer, start }, index) => {
    const [shortest = 1, span = 0, size = 0] = CUSPS_IN[index] ?? [];
    return [1 / (shortest + span * longer), size, start] as const;
  },
);

/** What a wave's swash keeps `across` metres along its crest line, about 1. */
export const cusped = (across: number): number =>
  CUSPS.reduce(
    (total, [turns, size, start]) =>
      total + size * Math.sin(RADIANS_A_TURN * (turns * across + start)),
    1,
  );

/** `cusped` at `xz` in the world frame. */
export const cuspAt = ([x, z]: Vec2): number =>
  cusped(x * SWELL_RUNS[1] - z * SWELL_RUNS[0]);

/** `cusped(across: f32) -> f32` and `cuspAt(xz: vec2f) -> f32`, the twins. */
export const SHORE_CUSPS = wgsl(
  'outside/shore-cusps',
  /* wgsl */ `
fn cusped(across: f32) -> f32 {
  return 1.0
    + ${CUSPS.map(
      ([turns, size, start]) =>
        `${f32(size)} * sin(${f32(RADIANS_A_TURN)} * (${f32(turns)} * across + ${f32(start)}))`,
    ).join('\n    + ')};
}

fn cuspAt(xz: vec2f) -> f32 {
  return cusped(xz.x * ${f32(SWELL_RUNS[1])} - xz.y * ${f32(SWELL_RUNS[0])});
}
`,
);
