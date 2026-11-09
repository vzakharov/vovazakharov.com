import { length, R, type Vec3 } from '@/island/shared/globe';

import { groundSlope, OCTAVES, reliefAt } from './relief';
import { noiseSalt, valueNoise3 } from './value-noise';

/** Rows of a 3 × 3 matrix. */
type Matrix = readonly [Vec3, Vec3, Vec3];

const AXIS = 1 / Math.sqrt(3);

/** The rotation by `angle` about `(1, 1, 1)/√3`, scaled by `k` (Rodrigues). */
function turned(angle: number, k: number): Matrix {
  const c = Math.cos(angle);
  const s = Math.sin(angle) * AXIS;
  const diagonal = k * (c + (1 - c) / 3);
  const plus = k * ((1 - c) / 3 + s);
  const minus = k * ((1 - c) / 3 - s);
  return [
    [diagonal, minus, plus],
    [plus, diagonal, minus],
    [minus, plus, diagonal],
  ];
}

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
 * An octave's steepest slope per unit of amplitude over its wavelength: the
 * quintic lattice ramp (15/8 of a step of 2, along all three axes) bent by
 * the hump (×1.4), its coastal fade (a smoothstep, 1.5, over a distance
 * changing up to √2 per metre) and its detail fade (under 1).
 */
const OCTAVE_STEEPEST = 3.75 * Math.sqrt(3) * 1.4 + 1.5 * Math.SQRT2 + 1;

/** `groundSlope` for the sphere's three-axis lattices. */
export const SPHERE_GROUND_SLOPE = groundSlope(OCTAVE_STEEPEST);

/** Signed metres from direction `p` (unit) to the coast, positive inland. */
export type CoastDistance = (p: Vec3) => number;

/**
 * Metres above sea level over direction `p` (any length but zero), negative
 * offshore — a pure function of the coast's distance and the seed (read as a
 * 32-bit integer). The noise is drawn in space at the surface point `R·p̂`,
 * never at an elevated one, so a height does not feed its own noise, and has
 * no seam anywhere on the sphere. `reliefAt` gives the shape.
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
  return reliefAt(
    distance([x, y, z]),
    finest,
    SPHERE_OCTAVES,
    ({ index, toLattice: [a, b, c] }) =>
      valueNoise3(
        noiseSalt(seed, index),
        a[0] * x + a[1] * y + a[2] * z,
        b[0] * x + b[1] * y + b[2] * z,
        c[0] * x + c[1] * y + c[2] * z,
      ),
  );
}
