import { DOORWAY_CUT, ROOM_DOORWAY } from '@/cube/shared/cube-boundary';
import { CEILING_HEIGHT, WALL_HALF } from '@/cube/shared/lib/room-shape';
import type { Surface } from '@/cube/shared/lib/surface';
import { cross3, dot3, type Vec3 } from '@/cube/shared/lib/vec';

import { box, face, type Quad } from './quad';
import type { Room } from './room';
import type { Walls } from './walls';

/** The wall a doorway is cut in: the east (`isEast`) or south wall of `n`, `x`, `y`. */
export type DoorWall = Room & { isEast: boolean };

/**
 * A door's leaf, turned `angle` radians off its wall about the hinge on the
 * doorway's north or west jamb, into the east or south room (`toward` 1) or
 * the west or north one (`toward` -1).
 */
export type Leaf = { angle: number; toward: 1 | -1 };

/** A door standing open: its wall and its leaf as it stands. */
export type Ajar = DoorWall & Leaf;

/** The faces of a doorway's wall drawn: `near` into its west or north room, `far` into the other. */
export type Sides = { near: boolean; far: boolean };

/** Half a leaf's thickness, in room sides: a third of the wall's. */
const LEAF_HALF = WALL_HALF / 3;

/** The leaf's clearance from the jambs, the head and the slab, in room sides. */
const LEAF_CLEAR = 0.002;

/**
 * Floor 1's way out of the cube, as the doorway in its one room's wall: the
 * wall, and the one face of it the room has, the other being the cube's.
 */
export const EXIT: { wall: DoorWall; sides: Sides } = (() => {
  const { wall } = ROOM_DOORWAY;
  const inward = wall === 'east' || wall === 'south';
  return {
    wall: {
      n: 1,
      x: wall === 'west' ? -1n : 0n,
      y: wall === 'north' ? -1n : 0n,
      isEast: wall === 'east' || wall === 'west',
    },
    sides: { near: inward, far: !inward },
  };
})();

export const isSameWall = (a: DoorWall, b: DoorWall): boolean =>
  a.isEast === b.isEast && a.n === b.n && a.x === b.x && a.y === b.y;

/** `walls` with `door`'s wall open, for the eye of the one who opened it. */
export function withOpen(walls: Walls, door: DoorWall | null): Walls {
  if (door === null) return walls;
  const is = (n: number, x: bigint, y: bigint, isEast: boolean) =>
    isSameWall(door, { n, x, y, isEast });
  return {
    isOpenEast: (n, x, y) => is(n, x, y, true) || walls.isOpenEast(n, x, y),
    isOpenSouth: (n, x, y) => is(n, x, y, false) || walls.isOpenSouth(n, x, y),
  };
}

/**
 * A wall's own frame, set in its west or north room's: lengths `along` it
 * from its north or west end, `across` it east or south of its middle line,
 * and `up` from the slab.
 */
type WallFrame = {
  /** A direction in the room's frame. */
  run: (along: number, across: number, up: number) => Vec3;
  /** A point in the room's frame. */
  at: (along: number, across: number, up: number) => Vec3;
  /** `quads` given the room each faces into, moved into that room's frame. */
  own: (quads: readonly Quad[]) => Quad[];
};

function wallFrame({ n, x, y, isEast }: DoorWall): WallFrame {
  const near: Room = { n, x, y };
  const far: Room = isEast ? { n, x: x + 1n, y } : { n, x, y: y + 1n };
  const run = (along: number, across: number, up: number): Vec3 =>
    isEast ? [across, up, along] : [along, up, across];
  const at = (along: number, across: number, up: number): Vec3 =>
    run(along, 1 + across, up);
  // A quad whose middle is past the wall's line stands in the far room,
  // whose frame starts one room side further across.
  const acrossOf = ([east, , south]: Vec3) => (isEast ? east : south);
  const back = ([east, up, south]: Vec3): Vec3 =>
    isEast ? [east - 1, up, south] : [east, up, south - 1];
  const own = (quads: readonly Quad[]): Quad[] =>
    quads.map((quad) => {
      const [a, b, c, d] = quad.corners;
      const middle =
        (acrossOf(a) + acrossOf(b) + acrossOf(c) + acrossOf(d)) / 4;
      return middle <= 1
        ? { ...quad, room: near }
        : {
            ...quad,
            room: far,
            corners: [back(a), back(b), back(c), back(d)],
          };
    });
  return { run, at, own };
}

/** The room a quad has until `own` gives it the one it faces into. */
const PLACEHOLDER: Room = { n: 0, x: 0n, y: 0n };

/** The face from `corner` along `a` and `b`, its normal turned to lean along `toward`. */
const leaning = (
  corner: Vec3,
  [a, b]: readonly [Vec3, Vec3],
  toward: Vec3,
  surface: Surface,
): Quad =>
  dot3(cross3(a, b), toward) > 0
    ? face(corner, a, b, PLACEHOLDER, surface)
    : face(corner, b, a, PLACEHOLDER, surface);

/**
 * `wall` with the doorway cut in it, each quad in the frame of the room it
 * faces into: the faces `sides` asks for, and, where both are drawn, the
 * jambs and the head inside the cut.
 */
export function doorwayWall(wall: DoorWall, sides: Sides): Quad[] {
  const { run, at, own } = wallFrame(wall);
  const { from, to, height: head } = DOORWAY_CUT;
  const panes = [
    [0, from, 0, CEILING_HEIGHT],
    [to, 1, 0, CEILING_HEIGHT],
    [from, to, head, CEILING_HEIGHT],
  ] as const;
  const side = (sign: -1 | 1): Quad[] =>
    panes.map(([a0, a1, h0, h1]) =>
      leaning(
        at(a0, sign * WALL_HALF, h0),
        [run(a1 - a0, 0, 0), run(0, 0, h1 - h0)],
        run(0, sign, 0),
        'wall',
      ),
    );
  const thick = run(0, 2 * WALL_HALF, 0);
  const jamb = (along: number, sign: -1 | 1): Quad =>
    leaning(
      at(along, -WALL_HALF, 0),
      [thick, run(0, 0, head)],
      run(sign, 0, 0),
      'trim',
    );
  const inside =
    sides.near && sides.far
      ? [
          jamb(from, 1),
          jamb(to, -1),
          leaning(
            at(from, -WALL_HALF, head),
            [thick, run(to - from, 0, 0)],
            run(0, 0, -1),
            'trim',
          ),
        ]
      : [];
  return own([
    ...(sides.near ? side(-1) : []),
    ...(sides.far ? side(1) : []),
    ...inside,
  ]);
}

/**
 * The leaf hung in `wall`'s doorway, turned as `leaf` has it, each quad in the
 * frame of the room it stands in: a slab a third of the wall's thickness
 * filling the cut, hinged on its north or west jamb.
 */
export function doorLeaf(wall: DoorWall, { angle, toward }: Leaf): Quad[] {
  const { run, at, own } = wallFrame(wall);
  const { from, to, height } = DOORWAY_CUT;
  const wide = to - from - 2 * LEAF_CLEAR;
  const turn = toward * angle;
  const thick = 2 * LEAF_HALF * toward;
  const p = run(wide * Math.cos(turn), wide * Math.sin(turn), 0);
  const q = run(thick * Math.sin(turn), -thick * Math.cos(turn), 0);
  const r = run(0, 0, height - 2 * LEAF_CLEAR);
  const corner = at(from + LEAF_CLEAR, toward * LEAF_HALF, LEAF_CLEAR);
  const rightHanded = dot3(cross3(p, q), r) > 0;
  return own(
    box(corner, rightHanded ? [p, q, r] : [q, p, r], PLACEHOLDER, 'trim'),
  );
}
