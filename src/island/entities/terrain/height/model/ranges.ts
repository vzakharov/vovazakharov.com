import { R } from '@/island/shared/globe';

import { UPLIFT_METRES } from './relief-numbers';
import { ramp } from './shore';
import { noiseSalt, valueNoise3 } from './value-noise';

/** The noise layers the belts are drawn from, clear of the relief's octaves. */
const BELT_LAYER = 2000;
const BEND_LAYER = 2001;
const REGION_LAYER = 2002;

/** The wavelength of the field whose zero lines the inland belts follow. */
const BELT_METRES = 2_400_000;
/** The wavelength over which a belt's line bends, and by how much of a cell. */
const BEND_METRES = 1_100_000;
const BEND = 0.3;
/** The wavelength of the field that says which regions have ranges at all. */
const REGION_METRES = 3_300_000;
/** How far from zero the belt field is at a belt's foot. */
const BELT_HALF_WIDTH = 0.14;
/** The region field's span from no range to a full one. */
const REGION_SPAN = 0.3;
/** Where a coastal range's foot, crest side and far foot lie, metres inland. */
const COASTAL_RISE_METRES = 80_000;
const COASTAL_FADE_FROM_METRES = 140_000;
const COASTAL_FADE_METRES = 220_000;

/**
 * A bound on `upliftAtSphere`'s slope, metres per metre, for value noise at
 * most `noiseSteepest` steep per wavelength: the belt field's across a belt's
 * half-width, with its bend; the region field's across its span; and a
 * coastal range's rise, over a coast distance changing up to √2 per metre;
 * each under the uplift's smoothstep (1.5).
 */
export const upliftSlope = (noiseSteepest: number) =>
  1.5 *
  UPLIFT_METRES *
  ((noiseSteepest *
    (1 + (1.5 * BEND * noiseSteepest * BELT_METRES) / BEND_METRES)) /
    (BELT_HALF_WIDTH * BELT_METRES) +
    (1.5 * noiseSteepest) / (REGION_SPAN * REGION_METRES) +
    (1.5 * Math.SQRT2) / COASTAL_RISE_METRES);

/** The noise of `layer`, `wavelength` metres long, over unit direction `(x, y, z)`. */
function slowNoise(
  seed: number,
  layer: number,
  wavelength: number,
  x: number,
  y: number,
  z: number,
) {
  const k = R / wavelength;
  return valueNoise3(noiseSalt(seed, layer), x * k, y * k, z * k);
}

/**
 * How high a mountain belt lifts the ground over unit direction `(x, y, z)`,
 * `d` metres inland: 0 over most land, up to `UPLIFT_METRES` along a belt's
 * middle. A pure function of the seed, the direction and `d`.
 *
 * Belts are long and narrow: inland ones follow the zero lines of a slow
 * field, bent by a second, a few hundred kilometres wide from foot to foot;
 * coastal ones run a couple of hundred kilometres behind a shore. A third
 * field says where each kind stands, so a range ends, and most coasts and
 * most land have none.
 */
export function upliftAtSphere(
  seed: number,
  x: number,
  y: number,
  z: number,
  d: number,
): number {
  const s = slowNoise(seed, REGION_LAYER, REGION_METRES, x, y, z);
  const coastal =
    ramp((-0.2 - s) / REGION_SPAN) *
    ramp(d / COASTAL_RISE_METRES) *
    (1 - ramp((d - COASTAL_FADE_FROM_METRES) / COASTAL_FADE_METRES));
  const inlandShare = ramp((s + 0.05) / REGION_SPAN);
  let inland = 0;
  if (inlandShare > 0) {
    const b = BEND * slowNoise(seed, BEND_LAYER, BEND_METRES, x, y, z);
    const belt = R / BELT_METRES;
    const t = valueNoise3(
      noiseSalt(seed, BELT_LAYER),
      x * belt + b,
      y * belt - b,
      z * belt + 0.5 * b,
    );
    inland = inlandShare * Math.max(0, 1 - Math.abs(t) / BELT_HALF_WIDTH);
  }
  return UPLIFT_METRES * ramp(Math.max(inland, coastal));
}
