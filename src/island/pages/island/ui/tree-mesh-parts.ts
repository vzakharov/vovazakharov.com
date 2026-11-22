import type { Rgb } from '../lib/land-colour';
import type { TreeKind } from '../model/tree-placing';

/**
 * How finely a tree is drawn: `near` to stand among, `mid` across a clearing,
 * `far` where it is a few pixels of a canopy.
 */
export const TREE_DETAILS = ['near', 'mid', 'far'] as const;

export type TreeDetail = (typeof TREE_DETAILS)[number];

export type P3 = readonly [number, number, number];

/** Bark and leaf colours, linear: the leaves' are the kind's mid green, which each tree tints. */
const BARK: Rgb = [0.115, 0.085, 0.06];
export const LEAF: Readonly<Record<TreeKind, Rgb>> = {
  broadleaf: [0.058, 0.14, 0.024],
  conifer: [0.028, 0.082, 0.036],
  bush: [0.05, 0.115, 0.03],
  tuft: [0.2, 0.2, 0.085],
};

/**
 * How far a leaf mass's normals lean to the sky, against lengths near 6: a
 * crown stands among others that shade its flanks, which no lamp here knows,
 * so its flanks take a grazing sun little more than the ground under it does.
 */
const SKYWARD = 4;

/** A mesh being built: a tree one unit tall, its foot at the origin, `y` up. */
export type Build = {
  readonly positions: number[];
  readonly normals: number[];
  readonly colours: number[];
  readonly indices: number[];
};

const unit3 = ([x, y, z]: P3): P3 => {
  const k = 1 / (Math.hypot(x, y, z) || 1);
  return [x * k, y * k, z * k];
};

export const shaded = ([r, g, b]: Rgb, light: number): P3 => [
  r * light,
  g * light,
  b * light,
];

export function vertex(build: Build, at: P3, normal: P3, colour: P3): number {
  build.positions.push(...at);
  build.normals.push(...unit3(normal));
  build.colours.push(...colour);
  return build.positions.length / 3 - 1;
}

/** Joins two rings of `around` vertices each, `lower` first, into a band facing outward. */
export function band(
  build: Build,
  lower: number,
  upper: number,
  around: number,
) {
  for (let s = 0; s < around; s++) {
    const next = (s + 1) % around;
    build.indices.push(
      lower + s,
      upper + s,
      lower + next,
      lower + next,
      upper + s,
      upper + next,
    );
  }
}

/** A tapering limb through `spine` (each a centre and a radius), `around` sides, closed at its tip. */
export function limb(
  build: Build,
  spine: ReadonlyArray<readonly [P3, number]>,
  around: number,
) {
  let below = -1;
  for (const [[cx, cy, cz], radius] of spine) {
    const ring = build.positions.length / 3;
    for (let s = 0; s < around; s++) {
      const a = (s / around) * 2 * Math.PI;
      const nx = Math.cos(a);
      const nz = Math.sin(a);
      vertex(
        build,
        [cx + nx * radius, cy, cz + nz * radius],
        [nx, 0.45, nz],
        shaded(BARK, 0.75 + 0.25 * nx),
      );
    }
    if (below >= 0) band(build, below, ring, around);
    below = ring;
  }
}

/**
 * A mass of leaves: an ellipsoid about `centre`, lumpy, its normals leaning
 * out from the crown's middle `heart` so the whole crown takes the light as
 * one body with the masses standing out of it, darker underneath and inside.
 */
export function mass(
  build: Build,
  leaf: Rgb,
  centre: P3,
  radii: P3,
  heart: P3,
  around: number,
  rows: number,
  phase: number,
) {
  const first = build.positions.length / 3;
  for (let r = 0; r <= rows; r++) {
    const polar = (r / rows) * Math.PI;
    for (let s = 0; s < around; s++) {
      const a = (s / around) * 2 * Math.PI;
      const lump =
        1 +
        0.16 * Math.sin(3 * a + phase) * Math.sin(2 * polar + phase * 1.7) +
        0.09 * Math.sin(5 * a - phase * 2.3) * Math.sin(3 * polar);
      const dx = Math.sin(polar) * Math.cos(a);
      const dy = -Math.cos(polar);
      const dz = Math.sin(polar) * Math.sin(a);
      const at: P3 = [
        centre[0] + dx * radii[0] * lump,
        centre[1] + dy * radii[1] * lump,
        centre[2] + dz * radii[2] * lump,
      ];
      const out = unit3([at[0] - heart[0], at[1] - heart[1], at[2] - heart[2]]);
      const normal: P3 = [
        dx / radii[0] + out[0] * 2,
        dy / radii[1] + out[1] * 2 + SKYWARD,
        dz / radii[2] + out[2] * 2,
      ];
      const light = 0.5 + 0.5 * (0.5 + 0.5 * dy) + 0.12 * (lump - 1) * 6;
      vertex(build, at, normal, shaded(leaf, light));
    }
  }
  for (let r = 0; r < rows; r++) {
    band(build, first + r * around, first + (r + 1) * around, around);
  }
}
