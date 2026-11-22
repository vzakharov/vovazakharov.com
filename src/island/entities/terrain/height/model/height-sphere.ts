import { length, R, type Vec3 } from '@/island/shared/globe';

import { groundSlope } from './bounds';
import { COAST_STEEPEST, type CoastDistance } from './coast-detail';
import { LATTICE_STEEPEST, turned } from './lattice';
import { OCTAVES } from './octaves';
import { upliftAtSphere, upliftSlope } from './ranges';
import { reliefAt } from './relief';
import { sandAt } from './shore';
import { noiseSalt, valueNoise3 } from './value-noise';

/**
 * Each octave's lattice turned against the last about the cube's diagonal so
 * none lines up, with the planet's radius and the octave's frequency folded
 * in: a unit direction times `toLattice` is its lattice coordinates.
 */
const SPHERE_OCTAVES = OCTAVES.map((octave) => ({
  ...octave,
  toLattice: turned(0.618 * (octave.index + 1), R * octave.cyclesPerMetre),
}));

/**
 * How far an octave's lattice point is pushed along each of two lattice axes,
 * in cells, by the noise of the octave before it at full swing: features bend
 * off the lattice's rows, and no two octaves' rows line up anywhere for long.
 */
const BEND = 0.25;

/**
 * The noise's steepest slope per wavelength: the lattice's, steepened by the
 * bend, whose own source is an octave twice as long and as steep.
 */
const NOISE_STEEPEST =
  LATTICE_STEEPEST * (1 + (1.5 * BEND * LATTICE_STEEPEST) / 2);

/**
 * `groundSlope` for the sphere's three-axis lattices, its belts, and a coast
 * whose distance carries `detailedCoast`'s bends.
 */
export const SPHERE_GROUND_SLOPE = groundSlope(
  NOISE_STEEPEST,
  upliftSlope(LATTICE_STEEPEST),
  COAST_STEEPEST,
);

/**
 * Metres above sea level over direction `p` (any length but zero), negative
 * offshore — a pure function of the coast's distance, read at the detail cut
 * `finest`, and the seed (read as a 32-bit integer). The noise is drawn in space at the surface point `R·p̂`,
 * never at an elevated one, so a height does not feed its own noise, and has
 * no seam anywhere on the sphere; each octave's point is bent by the octave
 * before it. `reliefAt` gives the shape, `upliftAtSphere` the mountain belts.
 */
export function heightAtSphere(
  distance: CoastDistance,
  seed: number,
  p: Vec3,
  finest = 0,
): number {
  const scale = 1 / length(p);
  const x = p[0] * scale;
  const y = p[1] * scale;
  const z = p[2] * scale;
  const d = distance([x, y, z], finest);
  /** The noise of the octave before, which bends this one's lattice point. */
  let before = 0;
  return reliefAt(
    d,
    finest,
    SPHERE_OCTAVES,
    ({ index, toLattice: [a, b, c] }) => {
      const bend = BEND * before;
      before = valueNoise3(
        noiseSalt(seed, index),
        a[0] * x + a[1] * y + a[2] * z + bend,
        b[0] * x + b[1] * y + b[2] * z - bend,
        c[0] * x + c[1] * y + c[2] * z + 0.5 * bend,
      );
      return before;
    },
    d > 0 ? upliftAtSphere(seed, x, y, z, d) : 0,
  );
}

/**
 * The share of sand, from 0 to 1, in the ground over direction `p` (any
 * length but zero) standing `height` metres up: `sandAt` of the coast's
 * distance there, read at the detail cut `finest` the height was drawn with.
 */
export const sandAtSphere = (
  distance: CoastDistance,
  p: Vec3,
  height: number,
  finest = 0,
): number => {
  const scale = 1 / length(p);
  return sandAt(
    distance([p[0] * scale, p[1] * scale, p[2] * scale], finest),
    height,
  );
};
