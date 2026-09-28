import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { meadowLayout } from '../ui/scene/layout';
import { VIEWPORTS } from '../ui/scene/viewports';
import type { Point } from './geometry';
import { mushroomGenes } from './mushroom-genes';
import { headOutlines, inkWidth } from './mushroom-outline';

const SEEDS = Array.from({ length: 2000 }, (_, index) => index * 7919 + 3);

/** The smallest any slot on any screen paints a mushroom, in px to its unit. */
const SMALLEST = Math.min(
  ...VIEWPORTS.flatMap(([, width, height]) =>
    meadowLayout(width, height, 1).mushrooms.map(({ size }) => size),
  ),
);
/** One ink line on the smallest slot, in units of size. */
const LINE = inkWidth(SMALLEST) / SMALLEST;

/** The stretch of a closed `outline` from its leftmost point to its rightmost over the top, left to right. */
function topEdge(outline: readonly Point[]): Point[] {
  const xs = outline.map(({ x }) => x);
  const [left, right] = [
    xs.indexOf(Math.min(...xs)),
    xs.indexOf(Math.max(...xs)),
  ];
  const walk = (from: number, to: number) => {
    const stretch: Point[] = [];
    for (let index = from; ; index = (index + 1) % outline.length) {
      const point = outline[index];
      if (point) stretch.push(point);
      if (index === to) return stretch;
    }
  };
  const mean = (stretch: readonly Point[]) =>
    stretch.reduce((sum, { y }) => sum + y, 0) / stretch.length;
  const [one, other] = [walk(left, right), walk(right, left).toReversed()];
  return mean(one) > mean(other) ? one : other;
}

/** The upper convex hull of `points`, left to right: the edge a lid laid over them would take. */
function upperHull(points: readonly Point[]): Point[] {
  const hull: Point[] = [];
  for (const point of points.toSorted((a, b) => a.x - b.x)) {
    for (;;) {
      const [a, b] = [hull.at(-2), hull.at(-1)];
      if (!a || !b) break;
      const turn =
        (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
      if (turn < 0) break;
      hull.pop();
    }
    hull.push(point);
  }
  return hull;
}

/** How high `hull` stands at `x`. */
function hullAt(hull: readonly Point[], x: number): number {
  for (const [index, b] of hull.entries()) {
    const a = hull[index - 1];
    if (a && x <= b.x)
      return b.x === a.x ? b.y : a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x);
  }
  return hull.at(-1)?.y ?? 0;
}

/**
 * The notches in the top of `outline` at least `deep` below the lid laid
 * over it, each as deep as it goes: between two of them stands a lobe as tall
 * as the shallower, so the top shows one lobe more than it has notches.
 */
function notches(outline: readonly Point[], deep: number): number[] {
  const edge = topEdge(outline);
  const hull = upperHull(edge);
  const found: number[] = [];
  let open: number | undefined;
  for (const { x, y } of edge) {
    const depth = hullAt(hull, x) - y;
    if (open === undefined) {
      if (depth >= deep) open = depth;
    } else if (depth <= deep / 4) {
      found.push(open);
      open = undefined;
    } else open = Math.max(open, depth);
  }
  return open === undefined ? found : [...found, open];
}

describe('a chanterelle’s lip', () => {
  it('waves its top in three lobes or more, each an ink line tall on the smallest slot', () => {
    for (const seed of SEEDS) {
      const genes = mushroomGenes({ seed, species: 'chanterelle' });
      const [lip] = headOutlines(genes);
      const lobes = notches(lip, LINE).length + 1;
      if (lobes < 3) assert.fail(`seed ${seed}: ${lobes} lobes`);
    }
  });
});
