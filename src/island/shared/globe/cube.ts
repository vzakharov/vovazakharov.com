/**
 * The cube laid on the sphere, equal-angle: face coordinates `(u, v) ∈ [−1, 1]²`
 * go to `normal + tan(πu/4)·U + tan(πv/4)·V`, normalised, where `U`, `V` are the
 * face frame's axes. Every frame axis is a signed world axis, so two faces
 * sharing an edge agree on its points bit for bit: the coordinate along the
 * edge is equal or negated on the two sides, and `slope` is exactly odd and
 * exactly `±1` at `±1`.
 */

import { unit, type Vec3 } from './vec3';

export const FACES = ['px', 'nx', 'py', 'ny', 'pz', 'nz'] as const;

/** A cube face, named for the sign and world axis of its normal. */
export type Face = (typeof FACES)[number];

export type WithFace = { readonly face: Face };

/** A signed world axis. */
export type Axis = { readonly index: 0 | 1 | 2; readonly sign: 1 | -1 };

/** A face's frame, right-handed: `u × v = normal`. */
export type FaceFrame = {
  readonly normal: Axis;
  readonly u: Axis;
  readonly v: Axis;
};

/** A point on the cube: a face and its coordinates there, each in `[−1, 1]`. */
export type FacePoint = WithFace & {
  readonly u: number;
  readonly v: number;
};

const X = 0;
const Y = 1;
const Z = 2;

const axis = (index: 0 | 1 | 2, sign: 1 | -1): Axis => ({ index, sign });

/**
 * `px` is centred on the `+X` meridian at the equator with `u` east (`−Z`) and
 * `v` north, so its coordinates read as east and north there.
 */
export const FACE_FRAMES: Readonly<Record<Face, FaceFrame>> = {
  px: { normal: axis(X, 1), u: axis(Z, -1), v: axis(Y, 1) },
  nx: { normal: axis(X, -1), u: axis(Z, 1), v: axis(Y, 1) },
  py: { normal: axis(Y, 1), u: axis(Z, -1), v: axis(X, -1) },
  ny: { normal: axis(Y, -1), u: axis(Z, -1), v: axis(X, 1) },
  pz: { normal: axis(Z, 1), u: axis(X, 1), v: axis(Y, 1) },
  nz: { normal: axis(Z, -1), u: axis(X, -1), v: axis(Y, 1) },
};

const QUARTER = Math.PI / 4;

/** `0 − t` rather than `−t`, so a zero stays `+0` and shared points compare bit-equal. */
const signed = (sign: 1 | -1, t: number) => (sign === 1 ? t : 0 - t);

/**
 * `tan(πc/4)`, exactly odd in `c` and exactly `±1` at `c = ±1` —
 * `Math.tan(Math.PI / 4)` is `0.9999999999999999`.
 */
function slope(c: number): number {
  const magnitude = Math.abs(c);
  const t = magnitude === 1 ? 1 : Math.tan(magnitude * QUARTER);
  return c < 0 ? 0 - t : t;
}

/** The inverse of `slope` for `|r| ≤ 1`, exactly `±1` at `r = ±1`. */
function angle(r: number): number {
  const magnitude = Math.abs(r);
  const c = magnitude === 1 ? 1 : Math.atan(magnitude) / QUARTER;
  return r < 0 ? 0 - c : c;
}

/** The unit vector at coordinates `(u, v)` of `face`. */
export function faceToSphere(face: Face, u: number, v: number): Vec3 {
  const frame = FACE_FRAMES[face];
  const out: [number, number, number] = [0, 0, 0];
  out[frame.normal.index] = frame.normal.sign;
  out[frame.u.index] = signed(frame.u.sign, slope(u));
  out[frame.v.index] = signed(frame.v.sign, slope(v));
  return unit(out);
}

const along = (p: Vec3, { index, sign }: Axis) => signed(sign, p[index]);

function faceOver([x, y, z]: Vec3): Face {
  const [ax, ay, az] = [Math.abs(x), Math.abs(y), Math.abs(z)];
  if (ax >= ay && ax >= az) return x < 0 ? 'nx' : 'px';
  if (ay >= az) return y < 0 ? 'ny' : 'py';
  return z < 0 ? 'nz' : 'pz';
}

/**
 * The cube point over direction `p` (any length but zero). On a face edge or
 * corner the face is the first in `FACES` order whose normal ties for largest.
 */
export function sphereToFace(p: Vec3): FacePoint {
  const face = faceOver(p);
  const frame = FACE_FRAMES[face];
  const depth = along(p, frame.normal);
  return {
    face,
    u: angle(along(p, frame.u) / depth),
    v: angle(along(p, frame.v) / depth),
  };
}
