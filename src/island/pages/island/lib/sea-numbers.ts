import { f32, vecf, wgsl } from '@/gpu/shared/shader';

import { DEEP_SPEED, HOUR_SECONDS } from '@/nature/shared/swell';

import type { Vec3 } from '@/island/shared/globe';

import { SUN_ELEVATION } from './day';
import { CLIMB_KEPT } from './sun';

/**
 * The way the open swell runs, a unit vector in space: its crests are the
 * planes square to it, so it rolls strongest where it lies along the sea and
 * dies out toward the two points where it stands up out of it.
 */
const SWELL_AXIS: Vec3 = [0.6, 0.25, -0.758_287_5];

/** Along the swell's crests: square to its axis and level at the equator. */
const SWELL_CREST: Vec3 = (() => {
  const [x, , z] = SWELL_AXIS;
  const size = Math.hypot(x, z);
  return [-z / size, 0, x / size];
})();

/** How far along a crest the cusps' pattern is carried before it wraps, metres: millimetres fine in a float. */
const CREST_WRAPS = 65_536;

const along = (eye: Vec3, axis: Vec3) =>
  eye[0] * axis[0] + eye[1] * axis[1] + eye[2] * axis[2];

/** `value` taken modulo `period`, into `[0, period)`. */
export const intoPeriod = (value: number, period: number) =>
  ((value % period) + period) % period;

/**
 * The swell at `eye` (metres from the planet's centre), `seconds` into the
 * hour, taken in float64 so a shader adds only a fragment's distance from the
 * eye: its clock — the hour's seconds less those the swell takes to reach the
 * eye — and the eye's place along the crests.
 */
export const swellAt = (eye: Vec3, seconds: number): [number, number] => [
  intoPeriod(seconds - along(eye, SWELL_AXIS) / DEEP_SPEED, HOUR_SECONDS),
  intoPeriod(along(eye, SWELL_CREST), CREST_WRAPS),
];

/**
 * The swell's axis and crest, and the sine of the sun's height the eye is set
 * by with the share of a higher sun's growth it lets through (`eyeKeeps` in
 * sun.ts), as WGSL constants.
 */
export const SEA_NUMBERS = wgsl(
  'island/pages/island/lib/sea-numbers',
  /* wgsl */ `
const SEA_SWELL_AXIS = ${vecf(SWELL_AXIS)};
const SEA_SWELL_CREST = ${vecf(SWELL_CREST)};
const SEA_EYE_SET = ${f32(Math.sin((SUN_ELEVATION * Math.PI) / 180))};
const SEA_CLIMB_KEPT = ${f32(CLIMB_KEPT)};
`,
);
