/**
 * The 3D half of a placement: a shaping fold (any angle but 180°) lifts a flap
 * out of the table plane, and its rotation composes into the piece's `Mat4`
 * on top of the flat placement.
 */
import { type Line, normalize } from './geometry.ts';

export type Vec3 = readonly [number, number, number];
/** A 4×4 affine matrix, column-major as three.js stores it. */
export type Mat4 = readonly number[];

export const sub3 = (a: Vec3, b: Vec3): Vec3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];
export const dot3 = (a: Vec3, b: Vec3): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross3 = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export const IDENTITY4: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

/** How far two shapings may differ, entry by entry, and still be one. */
const SAME_SHAPING = 1e-6;
export const differ = (a: Mat4, b: Mat4): boolean =>
  a.length !== b.length ||
  a.some((x, i) => Math.abs(x - (b[i] ?? x)) > SAME_SHAPING);

function cell(m: Mat4, row: number, column: number): number {
  const x = m[column * 4 + row];
  if (x === undefined) throw new Error('Mat4: not 16 entries');
  return x;
}

/** `outer · inner`: apply `inner` first. */
export function multiply(outer: Mat4, inner: Mat4): Mat4 {
  return Array.from({ length: 16 }, (_, index) => {
    const row = index % 4;
    const column = Math.floor(index / 4);
    let sum = 0;
    for (let k = 0; k < 4; k++)
      sum += cell(outer, row, k) * cell(inner, k, column);
    return sum;
  });
}

export const transform = (m: Mat4, [x, y, z]: Vec3): Vec3 => [
  cell(m, 0, 0) * x + cell(m, 0, 1) * y + cell(m, 0, 2) * z + cell(m, 0, 3),
  cell(m, 1, 0) * x + cell(m, 1, 1) * y + cell(m, 1, 2) * z + cell(m, 1, 3),
  cell(m, 2, 0) * x + cell(m, 2, 1) * y + cell(m, 2, 2) * z + cell(m, 2, 3),
];

const translation = ([x, y]: readonly [number, number]): Mat4 => [
  1,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  1,
  0,
  x,
  y,
  0,
  1,
];

/** Rotation by `theta` radians about `line`, lying in the table plane. */
export function rotationAbout(line: Line, theta: number): Mat4 {
  const [x, y] = normalize(line.d);
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const t = 1 - c;
  const rotation: Mat4 = [
    t * x * x + c,
    t * x * y,
    -s * y,
    0,
    t * x * y,
    t * y * y + c,
    s * x,
    0,
    s * y,
    -s * x,
    c,
    0,
    0,
    0,
    0,
    1,
  ];
  return multiply(
    translation(line.p),
    multiply(rotation, translation([-line.p[0], -line.p[1]])),
  );
}

/** The inverse of a rigid motion — a rotation and a translation, which is all
 * a shaping ever composes. Wrong for any matrix that scales or shears. */
export function invertRigid(m: Mat4): Mat4 {
  const r = (row: number, column: number) => cell(m, column, row);
  const t = [cell(m, 0, 3), cell(m, 1, 3), cell(m, 2, 3)] as const;
  const moved = (row: number) =>
    -(r(row, 0) * t[0] + r(row, 1) * t[1] + r(row, 2) * t[2]);
  return [
    r(0, 0),
    r(1, 0),
    r(2, 0),
    0,
    r(0, 1),
    r(1, 1),
    r(2, 1),
    0,
    r(0, 2),
    r(1, 2),
    r(2, 2),
    0,
    moved(0),
    moved(1),
    moved(2),
    1,
  ];
}
