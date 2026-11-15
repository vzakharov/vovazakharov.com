import type { Surface } from '@/cube/shared/lib/surface';
import { cross3, dot3, type Vec3 } from '@/cube/shared/lib/vec';

import { box, face, type Quad } from './quad';
import { isRoom, type Room } from './room';

/** The wall a doorway is cut in: the east (`isEast`) or south wall of `n`, `x`, `y`. */
export type DoorWall = Room & { isEast: boolean };

<<<<<<< HEAD
=======
/** Whether `wall` stands between two rooms of its floor, not on its edge or past it. */
export const isInnerWall = ({ n, x, y, isEast }: DoorWall): boolean =>
  isRoom(n, x, y) && (isEast ? isRoom(n, x + 1n, y) : isRoom(n, x, y + 1n));

>>>>>>> origin/claude/cube-board-portal-forks-ilv09n
export const isSameWall = (a: DoorWall, b: DoorWall): boolean =>
  a.isEast === b.isEast && a.n === b.n && a.x === b.x && a.y === b.y;

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

export function wallFrame({ n, x, y, isEast }: DoorWall): WallFrame {
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
export const leaning = (
  corner: Vec3,
  [a, b]: readonly [Vec3, Vec3],
  toward: Vec3,
  surface: Surface,
  paint?: number,
): Quad =>
  dot3(cross3(a, b), toward) > 0
    ? face(corner, a, b, PLACEHOLDER, surface, paint)
    : face(corner, b, a, PLACEHOLDER, surface, paint);

/** The box from `corner` along three edges, in whichever order faces out. */
export const solid = (
  corner: Vec3,
  [a, b, c]: readonly [Vec3, Vec3, Vec3],
  surface: Surface,
  paint: number,
): Quad[] =>
  box(
    corner,
    dot3(cross3(a, b), c) > 0 ? [a, b, c] : [b, a, c],
    PLACEHOLDER,
    surface,
    paint,
  );
