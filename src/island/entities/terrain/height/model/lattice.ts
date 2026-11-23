import type { Vec3 } from '@/island/shared/globe';

/** Rows of a 3 × 3 matrix. */
export type Matrix = readonly [Vec3, Vec3, Vec3];

const AXIS = 1 / Math.sqrt(3);

/** The rotation by `angle` about `(1, 1, 1)/√3`, scaled by `k` (Rodrigues). */
export function turned(angle: number, k: number): Matrix {
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
 * Value noise's steepest slope per wavelength on a lattice taken through a
 * `turned` matrix: the quintic ramp, 15/8 of a step of 2, along all three axes.
 */
export const LATTICE_STEEPEST = 3.75 * Math.sqrt(3);
