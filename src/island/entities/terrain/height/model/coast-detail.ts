/**
 * The coastline's bends under the coast field's grid: the field read at a
 * point pushed along the ground by a fractal sum of seeded noise, so the line
 * and every band behind it bend together, and every reader of the distance
 * draws the same wandering coast.
 */
import { length, R, type Vec3 } from '@/island/shared/globe';

import { LATTICE_STEEPEST, turned } from './lattice';
import { total } from './relief-numbers';
import { ramp } from './shore';
import { noiseSalt, valueNoise3, valueNoise3x3 } from './value-noise';

/**
 * Signed metres from direction `p` (unit) to the coast, positive inland, with
 * the bends shorter than `finest` metres left out (none when it is 0); and,
 * where the coast has stretches, the share of calm in the one at `p`, 0 to 1
 * (all calm without it).
 */
export type CoastDistance = ((p: Vec3, finest?: number) => number) & {
  readonly calm?: (p: Vec3) => number;
};

/**
 * The noise layers the bends are drawn from, one per bend and one for the
 * roughness, clear of every other layer.
 */
const COAST_LAYER = 3000;
const ROUGHNESS_LAYER = COAST_LAYER + 99;
/** The longest bend, about the coast field's cell; each next one halves it. */
const LONGEST_BEND_METRES = 20_000;
/** Bends down to ~5 m: as fine as the eye at 2 m can tell a waterline. */
const BEND_COUNT = 13;
/**
 * A bend pushes the ground up to `BEND_GAIN` of its wavelength, self-similar
 * from `SIMILAR_METRES` down; longer ones push less the longer they are, so
 * Earth's coast holds to a few kilometres.
 */
const BEND_GAIN = 0.3;
const SIMILAR_METRES = 4000;

/**
 * The roughness scales every bend between `CALM` and `ROUGH` along the coast,
 * by noise `ROUGHNESS_METRES` long: long calm beaches, broken rocky stretches.
 */
const CALM = 0.3;
const ROUGH = 1.6;
const ROUGHNESS_METRES = 50_000;
const ROUGHNESS_TO_LATTICE = turned(0.3, R / ROUGHNESS_METRES);

/** Each bend's lattice turned against the others' and the relief's. */
const BENDS = Array.from({ length: BEND_COUNT }, (_, index) => {
  const wavelength = LONGEST_BEND_METRES / 2 ** index;
  return {
    index,
    wavelength,
    amplitude:
      BEND_GAIN *
      Math.min(
        wavelength,
        SIMILAR_METRES * Math.sqrt(SIMILAR_METRES / wavelength),
      ),
    toLattice: turned(0.618 * (index + 1) + 0.5, R / wavelength),
  };
});

const overBends = (of: (bend: (typeof BENDS)[number]) => number) =>
  total(BENDS.map((bend) => of(bend)));

/** The farthest the bends push the ground: three axes at full roughness. */
const PUSHED_METRES =
  ROUGH * Math.sqrt(3) * overBends(({ amplitude }) => amplitude);
/**
 * The bends act whole within `FULL_METRES` of the field's coast and fade out
 * over `FADE_METRES` past it, so ground farther inland or out at sea reads
 * the field's distance unchanged.
 */
const FULL_METRES = 6000;
const FADE_METRES = 10_000;

/** The steepest the field's own distance is, metres per metre. */
const FIELD_STEEPEST = Math.SQRT2;

/**
 * How sharply the share of calm turns with the roughness noise: all or none
 * on about a third of the coast each, a turn between them on the rest.
 */
const CALM_TURN = 3;

/** The share of calm at lattice value `n`. */
const calmAt = (n: number) => 1 - ramp(0.5 + CALM_TURN * n);

/** The steepest the share of calm is, per metre of ground. */
export const CALM_STEEPEST =
  (1.5 * CALM_TURN * LATTICE_STEEPEST) / ROUGHNESS_METRES;

/** The roughness's lattice value at direction `p` (unit). */
const roughnessNoise = (seed: number, [x, y, z]: Vec3) => {
  const [a, b, c] = ROUGHNESS_TO_LATTICE;
  return valueNoise3(
    noiseSalt(seed, ROUGHNESS_LAYER),
    a[0] * x + a[1] * y + a[2] * z,
    b[0] * x + b[1] * y + b[2] * z,
    c[0] * x + c[1] * y + c[2] * z,
  );
};

/**
 * A bound on how steep the bent distance is, metres per metre: the field's
 * slope times how far the push stretches the ground — by the fade across the
 * farthest push, the roughness's change across every bend, and each bend's
 * own slope at full roughness.
 */
export const COAST_STEEPEST =
  FIELD_STEEPEST *
  (1 +
    (1.5 * PUSHED_METRES) / FADE_METRES +
    (PUSHED_METRES / ROUGH) * (ROUGH - CALM) * CALM_STEEPEST +
    ROUGH *
      Math.sqrt(3) *
      overBends(
        ({ amplitude, wavelength }) =>
          (amplitude * LATTICE_STEEPEST) / wavelength,
      ));

/**
 * How far the coast read with detail cut `finest` stands from the coast read
 * whole, at most: the field's slope across the push the cut leaves out or
 * fades in.
 */
export const coastCutReach = (finest: number): number =>
  finest <= 0
    ? 0
    : FIELD_STEEPEST *
      ROUGH *
      Math.sqrt(3) *
      overBends(({ amplitude, wavelength }) =>
        wavelength < 2 * finest ? amplitude : 0,
      );

/**
 * The coast `distance` traces (it reads any nonzero length), bent by `seed`'s
 * noise (read as a 32-bit integer): a pure function of the seed and the place.
 * Bends shorter than `finest` are left out and those up to twice it faded in,
 * as the relief's octaves are, so a far tile draws a smooth coast and each
 * nearer one adds the next bend. Calm stretches bend least, rough ones most.
 */
export const detailedCoast = (
  distance: (p: Vec3) => number,
  seed: number,
): CoastDistance => {
  const bent = (p: Vec3, finest = 0) => {
    const d = distance(p);
    const near = 1 - ramp((Math.abs(d) - FULL_METRES) / FADE_METRES);
    if (near === 0 || finest >= LONGEST_BEND_METRES) return d;
    const [x, y, z] = p;
    const calm = calmAt(roughnessNoise(seed, p));
    const reach = (near / R) * (ROUGH - (ROUGH - CALM) * calm);
    let qx = x;
    let qy = y;
    let qz = z;
    for (const {
      index,
      wavelength,
      amplitude,
      toLattice: [a, b, c],
    } of BENDS) {
      if (wavelength <= finest) break;
      const resolved = finest === 0 ? 1 : ramp(wavelength / finest - 1);
      const push = reach * amplitude * resolved;
      const [nx, ny, nz] = valueNoise3x3(
        noiseSalt(seed, COAST_LAYER + index),
        a[0] * x + a[1] * y + a[2] * z,
        b[0] * x + b[1] * y + b[2] * z,
        c[0] * x + c[1] * y + c[2] * z,
      );
      qx += push * nx;
      qy += push * ny;
      qz += push * nz;
    }
    const scale = 1 / length([qx, qy, qz]);
    return distance([qx * scale, qy * scale, qz * scale]);
  };
  return Object.assign(bent, {
    calm: (p: Vec3) => calmAt(roughnessNoise(seed, p)),
  });
};
