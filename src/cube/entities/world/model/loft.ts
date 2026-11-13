import {
  cross3 as cross,
  dot3 as dot,
  scaled as times,
  unit3 as unit,
  type Vec3,
} from '@/cube/shared/lib/vec';

import { minus, plus, type Quad, type Stuff } from './quad';
import type { Room } from './room';

/**
 * One cross-section of a lofted surface: an ellipse round `centre` whose
 * half-axes are `wide` and `thick`.
 */
export type Ring = { centre: Vec3; wide: Vec3; thick: Vec3 };

/** What a loft is made of, and how much of the way round it goes. */
export type Lofted = Stuff & {
  /** How many quads go round between two rings. */
  sides: number;
  /**
   * The part of the way round the surface covers, in turns from `wide`
   * towards `thick`; all of it where absent.
   */
  arc?: readonly [from: number, to: number];
};

const lengthOf = (a: Vec3): number => Math.hypot(...a);

/** `ring`'s point `turns` of the way round. */
const onRing = ({ centre, wide, thick }: Ring, turns: number): Vec3 => {
  const angle = 2 * Math.PI * turns;
  return plus(
    centre,
    plus(times(wide, Math.cos(angle)), times(thick, Math.sin(angle))),
  );
};

/**
 * The surface through `rings` in turn, facing out of them: a tube, or with a
 * last ring drawn nearly shut, a rounded end. Every corner carries the
 * surface's own normal, so the quads are lit as one curve whichever way the
 * rings turn.
 */
export function loft(
  rings: readonly Ring[],
  room: Room,
  { surface, paint, sides, arc }: Lofted,
): Quad[] {
  const [from, to] = arc ?? [0, 1];
  const closed = arc === undefined;
  const points = rings.map((ring) =>
    Array.from({ length: sides + 1 }, (_, side) =>
      onRing(ring, from + ((to - from) * side) / sides),
    ),
  );
  /** `ring` held to the first and last, where a normal looks past either end. */
  const inRange = (ring: number): number =>
    Math.min(Math.max(ring, 0), rings.length - 1);
  const at = (ring: number, side: number): Vec3 => {
    const row = points[inRange(ring)];
    const wrapped = closed
      ? (side + sides) % sides
      : Math.min(Math.max(side, 0), sides);
    const point = row?.[wrapped];
    if (point === undefined) throw new RangeError('A loft needs a ring');
    return point;
  };
  const centreOf = (ring: number): Vec3 => {
    const found = rings[inRange(ring)];
    if (found === undefined) throw new RangeError('A loft needs a ring');
    return found.centre;
  };
  /** The surface's outward normal at a grid point, from its neighbours. */
  const normalAt = (ring: number, side: number): Vec3 => {
    const around = minus(at(ring, side + 1), at(ring, side - 1));
    const along = minus(at(ring + 1, side), at(ring - 1, side));
    const square = cross(around, along);
    const out = minus(at(ring, side), centreOf(ring));
    // A ring drawn shut has no way round: its normal is the tube's own way.
    if (lengthOf(square) < 1e-18 || lengthOf(out) < 1e-12) {
      const tip = ring > 0 ? ring : ring + 1;
      const onward = minus(centreOf(tip), centreOf(tip - 1));
      return unit(ring > 0 ? onward : times(onward, -1));
    }
    const normal = unit(square);
    return dot(normal, out) < 0 ? times(normal, -1) : normal;
  };
  return rings.slice(1).flatMap((_, ring) =>
    Array.from({ length: sides }, (__, side): Quad => {
      const grid = [
        [ring, side],
        [ring, side + 1],
        [ring + 1, side + 1],
        [ring + 1, side],
      ] as const;
      const [a, b, c, d] = grid.map(([i, j]) => at(i, j));
      const [na, nb, nc, nd] = grid.map(([i, j]) => normalAt(i, j));
      if (!a || !b || !c || !d || !na || !nb || !nc || !nd) {
        throw new RangeError('A loft quad has four corners');
      }
      const normal = unit(plus(plus(na, nb), plus(nc, nd)));
      // The diagonals' cross points the way the corners turn round.
      const turnsOut = dot(cross(minus(c, a), minus(d, b)), normal) >= 0;
      return {
        corners: turnsOut ? [a, b, c, d] : [a, d, c, b],
        normals: turnsOut ? [na, nb, nc, nd] : [na, nd, nc, nb],
        normal,
        room,
        surface,
        ...(paint === undefined ? {} : { paint }),
      };
    }),
  );
}
