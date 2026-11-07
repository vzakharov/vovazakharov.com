/**
 * The hand that turns a flat step's flap: each vertex wholly on the flap is
 * sprung to where a rigid turn about the crease carries it, so the turn is a
 * force from outside and no crease has to drive it.
 */
import type { Meshed } from './mesh.ts';
import type { Pose } from './pose.ts';
import type { Guide, Spring } from './simulator.ts';
import { add3, cross3, dot3, sub3, type Vec3, vertexAt } from './space.ts';
import type { Moved, Piece } from './state.ts';

/** Power-iteration rounds for the crease's direction; it converges in a few
 * when the points lie near one line. */
const ROUNDS = 50;

/** A line through `centre` along unit `direction`. */
export type Axis = { readonly centre: Vec3; readonly direction: Vec3 };

const scale3 = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const unit = (a: Vec3): Vec3 => scale3(a, 1 / Math.hypot(...a));

/** The line through the points' mean along their principal direction, by
 * power iteration seeded with last − first. */
export function fitAxis(points: readonly Vec3[]): Axis {
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last || points.length < 2) {
    throw new Error('hand: an axis needs two points');
  }
  let total: Vec3 = [0, 0, 0];
  for (const p of points) total = add3(total, p);
  const centre = scale3(total, 1 / points.length);
  let direction = sub3(last, first);
  for (let round = 0; round < ROUNDS; round++) {
    let next: Vec3 = [0, 0, 0];
    for (const p of points) {
      const r = sub3(p, centre);
      next = add3(next, scale3(r, dot3(r, direction)));
    }
    direction = unit(next);
  }
  return { centre, direction };
}

/** The sign of the turn about `direction` that lifts `flap` (its offset from
 * the axis) toward `up`, times `sense`: +1 lifts it off the still paper's top
 * face, −1 off its bottom. A turn by +θ moves the flap along `direction × flap`. */
export const turnSense = (
  direction: Vec3,
  flap: Vec3,
  up: Vec3,
  sense: number,
): number => Math.sign(dot3(cross3(direction, flap), up)) * sense;

/** `r` turned by `angle` about unit `axis` through the origin (Rodrigues). */
export function rodrigues(r: Vec3, axis: Vec3, angle: number): Vec3 {
  const cs = Math.cos(angle);
  const sn = Math.sin(angle);
  const kr = cross3(axis, r);
  const kd = dot3(axis, r);
  return [
    r[0] * cs + kr[0] * sn + axis[0] * kd * (1 - cs),
    r[1] * cs + kr[1] * sn + axis[1] * kd * (1 - cs),
    r[2] * cs + kr[2] * sn + axis[2] * kd * (1 - cs),
  ];
}

/** The step's moved pieces, and the hand's spring and how long it pulls. */
export type Turn = Moved &
  Spring & {
    /** +1 lifts the flap off the still paper's top face, −1 off its bottom. */
    readonly sense: number;
    readonly degrees: number;
  };

/** The hand turning the flap of `pose`'s step from where the paper is in `x`
 * (packed xyz): about the line through the vertices both moved and still
 * pieces meet at, the flap's vertices each sprung to the turn at the ramp's
 * share. */
export function handGuide(
  mesh: Meshed,
  x: Float64Array,
  pose: Pose,
  { moved, sense, degrees, k, until }: Turn,
): Guide {
  const at = (v: number): Vec3 => vertexAt(x, v);
  const isMoved = (p: Piece) => moved.has(p.id);
  const crease = pose.around.flatMap((pieces, v) =>
    pieces.some((p) => isMoved(p)) && !pieces.every((p) => isMoved(p))
      ? [v]
      : [],
  );
  const onCrease = new Set(crease);
  const mask = Uint8Array.from(pose.around, (pieces) =>
    pieces.every((p) => isMoved(p)) ? 1 : 0,
  );
  const { centre, direction } = fitAxis(crease.map((v) => at(v)));
  // The still paper's top: each still triangle at the crease, its normal
  // turned by which way it faces.
  let up: Vec3 = [0, 0, 0];
  for (const [t, triangle] of mesh.triangles.entries()) {
    const piece = pose.ofTriangle[t];
    if (!piece || isMoved(piece) || !triangle.some((v) => onCrease.has(v))) {
      continue;
    }
    const [p, q, r] = triangle.map((v) => at(v));
    if (!p || !q || !r) continue;
    const normal = unit(cross3(sub3(q, p), sub3(r, p)));
    const facing = pose.stack.faces[t]?.facing ?? 0;
    up = add3(up, scale3(normal, facing));
  }
  let flap: Vec3 = [0, 0, 0];
  for (const [v, on] of mask.entries()) {
    if (on === 0) continue;
    const r = sub3(at(v), centre);
    const off = sub3(r, scale3(direction, dot3(r, direction)));
    flap = add3(flap, off);
  }
  const full =
    ((degrees * Math.PI) / 180) * turnSense(direction, flap, up, sense);
  const start = Float64Array.from(x);
  return {
    mask,
    k,
    until,
    target: (i, share, out) => {
      const r = sub3(vertexAt(start, i), centre);
      const turned = rodrigues(r, direction, full * share);
      out[0] = centre[0] + turned[0];
      out[1] = centre[1] + turned[1];
      out[2] = centre[2] + turned[2];
    },
  };
}
