import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';
import {
  type Ajar,
  type DoorWall,
  EXIT,
  type InRoom,
  isSameWall,
  leafLine,
  type Pose,
} from '@/cube/entities/world';

import { onWall, type Ways } from './door';

/**
 * The radius of a whole body's collision circle, in room sides: 0.6 m across
 * on floor 1. A body's own is this times its `scale`.
 */
export const BODY_RADIUS = 0.06;

/** Push-out passes per sub-step; a corner needs two, a wall end three. */
const PASSES = 4;

type Segment = { a: InRoom; b: InRoom };

/** A length of a wall, from and to, in room sides from its north or west end. */
type Span = readonly [number, number];

const WHOLE: readonly Span[] = [[0, 1]];

/** What stands of a wall a doorway is cut in: either side of the cut. */
const JAMBS: readonly Span[] = [
  [0, DOORWAY_CUT.from],
  [DOORWAY_CUT.to, 1],
];

/**
 * The closed walls a body in `pose`'s room can touch, as segments on the
 * lines `u = 0`, `u = 1`, `v = 0` and `v = 1` of that room's frame. The closed
 * walls' ends are the door jambs; floor 1's wall stands either side of the
 * doorway out of the cube, and so does the wall of the door `walls` holds
 * ajar, whose leaf stands where it has turned to.
 */
export function closedWalls(pose: Pose, walls: Ways): Segment[] {
  const { n, x, y } = pose;
  const ajar = walls.ajar ?? null;
  const standing = (wall: DoorWall): readonly Span[] =>
    isSameWall(wall, EXIT.wall) || (ajar !== null && isSameWall(wall, ajar))
      ? JAMBS
      : WHOLE;
  const segments: Segment[] = ajar === null ? [] : [leafOf(pose, ajar)];
  for (const d of [-1, 0, 1]) {
    const big = BigInt(d);
    for (const line of [0, 1]) {
      const edge = BigInt(line - 1);
      const east = { n, x: x + edge, y: y + big, isEast: true };
      if (!walls.isOpenEast(n, east.x, east.y)) {
        for (const [from, to] of standing(east)) {
          segments.push({
            a: { u: line, v: d + from },
            b: { u: line, v: d + to },
          });
        }
      }
      const south = { n, x: x + big, y: y + edge, isEast: false };
      if (!walls.isOpenSouth(n, south.x, south.y)) {
        for (const [from, to] of standing(south)) {
          segments.push({
            a: { u: d + from, v: line },
            b: { u: d + to, v: line },
          });
        }
      }
    }
  }
  return segments;
}

/** The leaf of `ajar` as a segment in the frame of `pose`'s room, hinge to edge. */
function leafOf(pose: Pose, ajar: Ajar): Segment {
  const { hinge, edge } = leafLine(ajar);
  return { a: onWall(pose, ajar, hinge, 0), b: onWall(pose, ajar, ...edge) };
}

function closestOn({ a, b }: Segment, p: InRoom): InRoom {
  const du = b.u - a.u;
  const dv = b.v - a.v;
  const t = ((p.u - a.u) * du + (p.v - a.v) * dv) / (du * du + dv * dv);
  const clamped = Math.min(1, Math.max(0, t));
  return { u: a.u + clamped * du, v: a.v + clamped * dv };
}

/** `p` pushed straight out of every segment it overlaps, which slides it. */
function pushOut(p: InRoom, segments: Segment[], radius: number): InRoom {
  let { u, v } = p;
  for (let pass = 0; pass < PASSES; pass += 1) {
    let moved = false;
    for (const segment of segments) {
      const q = closestOn(segment, { u, v });
      const distance = Math.hypot(u - q.u, v - q.v);
      if (distance < radius && distance > 0) {
        const scale = radius / distance;
        u = q.u + (u - q.u) * scale;
        v = q.v + (v - q.v) * scale;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return { u, v };
}

/**
 * One coordinate re-based into `[0, 1)` and the room shift that took. `w - 1`
 * is exact on `[1, 2)`; `w + 1` for a `w` within half an ulp of 1 below zero
 * rounds to 1, so that `w` reads as 0 in its own room instead.
 */
function rebase(w: number): [number, bigint] {
  if (w >= 1) return [w - 1, 1n];
  if (w >= 0) return [w, 0n];
  const up = w + 1;
  return up < 1 ? [up, -1n] : [0, 0n];
}

/**
 * `pose` moved by `(du, dv)` room sides, colliding as a body of its scale and
 * changing rooms. Each sub-step moves under half the radius, so a centre that
 * starts clear of a zero-thickness wall cannot reach its far side in one.
 */
export function walk<P extends Pose>(
  pose: P,
  du: number,
  dv: number,
  walls: Ways,
): P {
  const radius = BODY_RADIUS * pose.scale;
  const steps = Math.max(1, Math.ceil(Math.hypot(du, dv) / (radius / 2)));
  let { x, y, u, v } = pose;
  let segments = closedWalls(pose, walls);
  for (let index = 0; index < steps; index += 1) {
    ({ u, v } = pushOut(
      { u: u + du / steps, v: v + dv / steps },
      segments,
      radius,
    ));
    const [nu, sx] = rebase(u);
    const [nv, sy] = rebase(v);
    u = nu;
    v = nv;
    if (sx !== 0n || sy !== 0n) {
      x += sx;
      y += sy;
      segments = closedWalls({ ...pose, x, y }, walls);
    }
  }
  return { ...pose, x, y, u, v };
}
