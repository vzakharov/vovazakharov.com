import type { Vec3 } from '@/island/shared/globe';

/**
 * What a camera at the eye sees: the inward unit normals of the four side
 * planes of its view, each through the eye.
 */
export type Frustum = { readonly sides: readonly Vec3[] };

/**
 * How far past the screen's edges, radians, a frustum keeps tiles: enough
 * that a small turn finds its new edge already drawn.
 */
const MARGIN = 0.1;

const scaled = (v: Vec3, k: number): Vec3 => [v[0] * k, v[1] * k, v[2] * k];
const sum = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * The frustum of a camera looking along unit `forward` with unit `up` square
 * to it, `fov` radians high on a screen `aspect` wide per unit of height,
 * widened by `MARGIN` on every side.
 */
export function frustumOf(
  forward: Vec3,
  up: Vec3,
  fov: number,
  aspect: number,
): Frustum {
  const right = cross(forward, up);
  const vertical = Math.min(Math.PI / 2, fov / 2 + MARGIN);
  const horizontal = Math.min(
    Math.PI / 2,
    Math.atan(Math.tan(fov / 2) * aspect) + MARGIN,
  );
  const side = (half: number, across: Vec3, sign: 1 | -1) =>
    sum(scaled(forward, Math.sin(half)), scaled(across, sign * Math.cos(half)));
  return {
    sides: [
      side(vertical, up, -1),
      side(vertical, up, 1),
      side(horizontal, right, -1),
      side(horizontal, right, 1),
    ],
  };
}

/**
 * Whether every one of `points` (world metres) lies more than `slack` metres
 * outside one side of `frustum` placed at `eye`: then their convex hull, and
 * anything within `slack` of it, is out of view.
 */
export function outside(
  frustum: Frustum,
  eye: Vec3,
  points: readonly Vec3[],
  slack: number,
): boolean {
  const relative = points.map(
    (p): Vec3 => [p[0] - eye[0], p[1] - eye[1], p[2] - eye[2]],
  );
  return frustum.sides.some((normal) =>
    relative.every((p) => dot(normal, p) < -slack),
  );
}
