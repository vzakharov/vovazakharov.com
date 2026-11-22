/**
 * The coastline's bends under the coast field's grid: a fractal sum of seeded
 * noise added to the signed distance near its zero line, so every reader of
 * the distance draws the same wandering coast.
 */
import { R, type Vec3 } from '@/island/shared/globe';

import { LATTICE_STEEPEST, turned } from './lattice';
import { total } from './relief-numbers';
import { ramp } from './shore';
import { noiseSalt, valueNoise3 } from './value-noise';

/**
 * Signed metres from direction `p` (unit) to the coast, positive inland, with
 * the bends shorter than `finest` metres left out (none when it is 0).
 */
export type CoastDistance = (p: Vec3, finest?: number) => number;

/** The noise layers the bends are drawn from, clear of every other layer. */
const COAST_LAYER = 3000;
/** The longest bend, about the coast field's cell; each next one halves it. */
const LONGEST_BEND_METRES = 20_000;
/** Bends down to ~5 m: as fine as the eye at 2 m can tell a waterline. */
const BEND_COUNT = 13;
/**
 * A bend's amplitude is `BEND_GAIN · λ^BEND_POWER` metres for wavelength `λ`:
 * a coast of fractal dimension ~1.15, half a kilometre at the longest.
 */
const BEND_GAIN = 0.12;
const BEND_POWER = 0.85;

/** Each bend's lattice turned against the others' and the relief's. */
const BENDS = Array.from({ length: BEND_COUNT }, (_, index) => {
  const wavelength = LONGEST_BEND_METRES / 2 ** index;
  return {
    index,
    wavelength,
    amplitude: BEND_GAIN * wavelength ** BEND_POWER,
    toLattice: turned(0.618 * (index + 1) + 0.5, R / wavelength),
  };
});

const overBends = (of: (bend: (typeof BENDS)[number]) => number) =>
  total(BENDS.map((bend) => of(bend)));

/** The farthest all the bends together move the coast. */
const BENT_METRES = overBends(({ amplitude }) => amplitude);
/**
 * How far from the field's coast the bends reach, fading out across it, so
 * ground farther inland or out at sea reads the field's distance unchanged.
 */
const FADE_METRES = 4 * BENT_METRES;

/** The steepest the field's own distance is, metres per metre. */
const FIELD_STEEPEST = Math.SQRT2;

/**
 * A bound on how steep the bent distance is, metres per metre: the field's
 * slope, scaled by the fade's change across the bends, plus every bend's own.
 */
export const COAST_STEEPEST =
  FIELD_STEEPEST * (1 + (1.5 * BENT_METRES) / FADE_METRES) +
  overBends(
    ({ amplitude, wavelength }) => (amplitude * LATTICE_STEEPEST) / wavelength,
  );

/**
 * How far the coast read with detail cut `finest` stands from the coast read
 * whole, at most: the bends the cut leaves out or fades in.
 */
export const coastCutReach = (finest: number): number =>
  finest <= 0
    ? 0
    : overBends(({ amplitude, wavelength }) =>
        wavelength < 2 * finest ? amplitude : 0,
      );

/**
 * The coast `distance` traces, bent by `seed`'s noise (read as a 32-bit
 * integer): a pure function of the seed and the place. Bends shorter than
 * `finest` are left out and those up to twice it faded in, as the relief's
 * octaves are, so a far tile draws a smooth coast and each nearer one adds
 * the next bend. The bends fade out by `FADE_METRES` from the field's coast.
 */
export const detailedCoast =
  (distance: (p: Vec3) => number, seed: number): CoastDistance =>
  (p, finest = 0) => {
    const d = distance(p);
    const near = 1 - ramp(Math.abs(d) / FADE_METRES);
    if (near === 0) return d;
    const [x, y, z] = p;
    let bent = 0;
    for (const {
      index,
      wavelength,
      amplitude,
      toLattice: [a, b, c],
    } of BENDS) {
      if (wavelength <= finest) break;
      const resolved = finest === 0 ? 1 : ramp(wavelength / finest - 1);
      bent +=
        amplitude *
        resolved *
        valueNoise3(
          noiseSalt(seed, COAST_LAYER + index),
          a[0] * x + a[1] * y + a[2] * z,
          b[0] * x + b[1] * y + b[2] * z,
          c[0] * x + c[1] * y + c[2] * z,
        );
    }
    return d + near * bent;
  };
