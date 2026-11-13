import { CEILING_HEIGHT } from '@/cube/shared/lib/room-shape';
import {
  HOLE_SIDE,
  holeMiddle,
  type Quad,
  type Setting,
  type Vec3,
  WALL_HALF,
} from '@/cube/entities/world';

import { spun } from '../lib/spin';

/** An upright box in a room's frame, by its least and greatest corners. */
export type Bounds = { least: Vec3; most: Vec3 };

/** How deep the strip along an open side is that stays clear to walk through. */
export const WALKWAY = 0.25;

/** How far round the hole and the shelf nothing stands. */
const REACH = 0.15;

/** Where signs and posters hang on a closed wall: its middle third, this high. */
export const HUNG = { from: 0.18, to: 0.42, least: 1 / 3, most: 2 / 3 };

/** How far out from a wall something still stands in front of what hangs on it. */
const IN_FRONT = 0.1;

export function boundsOf(quads: readonly Quad[]): Bounds {
  const corners = quads.flatMap((quad) => quad.corners);
  const along = (axis: 0 | 1 | 2) => corners.map((corner) => corner[axis]);
  return {
    least: [
      Math.min(...along(0)),
      Math.min(...along(1)),
      Math.min(...along(2)),
    ],
    most: [Math.max(...along(0)), Math.max(...along(1)), Math.max(...along(2))],
  };
}

/** Whether `a` and `b` share any room, nearer than `spare` counting as sharing. */
export const overlap = (a: Bounds, b: Bounds, spare = 0): boolean =>
  ([0, 1, 2] as const).every(
    (axis) =>
      a.least[axis] < b.most[axis] + spare &&
      b.least[axis] < a.most[axis] + spare,
  );

/** Whether `inner` lies within `outer`, give or take a rounding. */
export const within = (inner: Bounds, outer: Bounds): boolean =>
  ([0, 1, 2] as const).every(
    (axis) =>
      inner.least[axis] > outer.least[axis] - 1e-9 &&
      inner.most[axis] < outer.most[axis] + 1e-9,
  );

/** Whether `bounds` keeps out of every one of `zones`, give or take a rounding. */
export const isClear = (bounds: Bounds, zones: readonly Bounds[]): boolean =>
  !zones.some((zone) => overlap(bounds, zone, -1e-9));

/** A room's inside: wall face to wall face, floor to ceiling. */
export const INSIDE: Bounds = {
  least: [WALL_HALF, 0, WALL_HALF],
  most: [1 - WALL_HALF, CEILING_HEIGHT, 1 - WALL_HALF],
};

/** The full-height box over the floor from `[x0, z0]` to `[x1, z1]`. */
const column = (x0: number, z0: number, x1: number, z1: number): Bounds => ({
  least: [x0, 0, z0],
  most: [x1, CEILING_HEIGHT, z1],
});

/** The same box seen from the room's side `side`, where it lies along the east. */
function turned({ least, most }: Bounds, side: number): Bounds {
  const [a, b] = [spun(side, 0.5)(least), spun(side, 0.5)(most)];
  const each = (pick: (...of: number[]) => number): Vec3 => [
    pick(a[0], b[0]),
    pick(a[1], b[1]),
    pick(a[2], b[2]),
  ];
  return { least: each(Math.min), most: each(Math.max) };
}

/**
 * Where the shelf of a room with a hole in `setting.hole` is: on the hole
 * quarter's east or west wall level with the hole where that side is closed,
 * else on its north or south wall, else on a post in that corner — the choice
 * `shelfOf` makes, read off the setting's sides.
 */
export function shelfSpot({ hole, closed }: Setting): [number, number] | null {
  if (hole === null) return null;
  const { u, v } = holeMiddle(hole);
  const [east, south, west, north] = closed;
  if (hole.qx === 0 ? west : east) return [hole.qx, v];
  if (hole.qy === 0 ? north : south) return [u, hole.qy];
  return [hole.qx, hole.qy];
}

/**
 * Everything of `setting`'s room that nothing may stand in: the walkway
 * along each open side, round the hole and the shelf, and in front of where
 * each closed wall's signs hang.
 */
export function clearZones(setting: Setting): Bounds[] {
  const { hole, closed } = setting;
  const round = (x: number, z: number, reach: number): Bounds =>
    column(x - reach, z - reach, x + reach, z + reach);
  const shelf = shelfSpot(setting);
  return [
    ...closed.map((isClosed, side) =>
      turned(
        isClosed
          ? {
              least: [1 - WALL_HALF - IN_FRONT, HUNG.from, HUNG.least],
              most: [1, HUNG.to, HUNG.most],
            }
          : column(1 - WALKWAY, 0, 1, 1),
        side,
      ),
    ),
    ...(hole === null
      ? []
      : [round(holeMiddle(hole).u, holeMiddle(hole).v, HOLE_SIDE / 2 + REACH)]),
    ...(shelf === null ? [] : [round(shelf[0], shelf[1], REACH)]),
  ];
}
