import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import { f32, wgsl } from '../lib/wgsl';
import { RADIANS_A_TURN, SEA_WORLD } from './swell';

/**
 * The shore's cusps: a wave does not arrive equally tall all along a beach,
 * so its breaker stands higher here than there and its swash runs up the
 * sand in tongues. Three rolled sines of the place along the crest, fixed to
 * the island; written twice, and `swell.test.ts` runs the WGSL against the
 * TypeScript.
 */

/** Each sine's [shortest length, metres; how much longer it may be; size]. */
const CUSPS_IN = [
  [4.5, 3, 0.07],
  [10, 6, 0.09],
  [21, 12, 0.1],
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

/**
 * What a wave keeps of its height `across` metres along its own crest line,
 * about 1.
 */
export const cusped = (across: number): number =>
  CUSPS.reduce(
    (total, [turns, size, start]) =>
      total + size * Math.sin(RADIANS_A_TURN * (turns * across + start)),
    1,
  );

/** `cusped(across: f32) -> f32`, the twin of the function above. */
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
`,
);
