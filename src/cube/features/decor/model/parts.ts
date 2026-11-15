import { dot3 } from '@/cube/shared/lib/vec';
import { minus, type Quad, type Vec3 } from '@/cube/entities/world';

import { type Bounds, boundsOf } from './clear';

/** How near two corners lie to be one, in the room's frame. */
const SAME = 1e-6;

const same = (a: Vec3, b: Vec3): boolean =>
  Math.abs(a[0] - b[0]) < SAME &&
  Math.abs(a[1] - b[1]) < SAME &&
  Math.abs(a[2] - b[2]) < SAME;

const middle = ({ corners }: Quad): Vec3 => {
  const sum = (axis: 0 | 1 | 2) =>
    corners.reduce((total, corner) => total + corner[axis], 0) / 4;
  return [sum(0), sum(1), sum(2)];
};

/** Whether `b` lies behind `a`'s face, as a solid's other faces do. */
const behind = (a: Quad, b: Quad): boolean =>
  dot3(minus(middle(b), a.corners[0]), a.normal) < -SAME;

/**
 * Whether `a` and `b` are faces of one solid: they meet along an edge, two
 * corners shared, at an outward corner, each behind the other. Two parts
 * set against each other meet flat or in an inward corner, and are not
 * joined.
 */
const oneSolid = (a: Quad, b: Quad): boolean =>
  Math.abs(dot3(a.normal, b.normal)) < 0.99 &&
  behind(a, b) &&
  behind(b, a) &&
  a.corners.filter((corner) => b.corners.some((other) => same(corner, other)))
    .length >= 2;

/**
 * The bounds of each solid `quads` are built of, in their frame: faces that
 * meet along an edge at an outward corner are one solid, as a block's are.
 * Parts that do meet that way, edge on edge, come out as one, so a part is
 * never smaller than a solid, only sometimes larger.
 */
export function partsOf(quads: readonly Quad[]): Bounds[] {
  const root = quads.map((_, index) => index);
  const find = (index: number): number => {
    let at = index;
    while (root[at] !== at) at = root[at] ?? at;
    return at;
  };
  for (const [i, a] of quads.entries()) {
    for (const [j, b] of quads.entries()) {
      if (j > i && oneSolid(a, b)) root[find(j)] = find(i);
    }
  }
  const groups = Map.groupBy(quads, (_, index) => find(index));
  return [...groups.values()].map((group) => boundsOf(group));
}
