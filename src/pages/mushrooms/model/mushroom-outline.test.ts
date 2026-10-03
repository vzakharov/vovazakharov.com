import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { everyPlace } from '../ui/scene/clump-layout';
import { meadowLayout } from '../ui/scene/layout';
import { VIEWPORTS } from '../ui/scene/viewports';
import { containsPoint, type Point } from './geometry';
import { HEAD_KIND, MUSHROOM_SPECIES, mushroomGenes } from './mushroom-genes';
import {
  capOutlines,
  capUnder,
  gillLines,
  headOutlines,
  stemOutline,
} from './mushroom-outline';
import { capSeat, stemAt } from './mushroom-pose';
import { SHELTER_SEATS } from './shelter';

const SEEDS = Array.from({ length: 2000 }, (_, index) => index * 7919 + 3);

/** The smallest any place on any screen paints a mushroom, in px to its unit. */
const SMALLEST = Math.min(
  ...VIEWPORTS.flatMap(([, width, height]) =>
    everyPlace(meadowLayout(width, height, 1).mushrooms).map(
      ({ size }) => size,
    ),
  ),
);
/**
 * The least step a cap's outline shows, in units of size on the smallest
 * place: a whole CSS pixel, which a screen draws as a step rather than
 * blurring away, and which reads as the edge of the 2 px ink line there
 * (`inkWidth`) stepping.
 */
const STEP = 1 / SMALLEST;

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
  it('waves its top in three lobes or more, each a pixel tall on the smallest place', () => {
    for (const seed of SEEDS) {
      const genes = mushroomGenes({ seed, species: 'chanterelle' });
      const [lip] = headOutlines(genes);
      const lobes = notches(lip, STEP).length + 1;
      if (lobes < 3) assert.fail(`seed ${seed}: ${lobes} lobes`);
    }
  });
});

/** The least `y` along `outline`: its lowest point. */
const lowest = (outline: readonly Point[]) =>
  Math.min(...outline.map(({ y }) => y));

/** How far a closed `outline`'s top stands at its middle below its highest point. */
function dipAtMiddle(outline: readonly Point[]): number {
  const edge = topEdge(outline);
  const middle = edge.toSorted((a, b) => Math.abs(a.x) - Math.abs(b.x))[0];
  assert.ok(middle);
  return Math.max(...edge.map(({ y }) => y)) - middle.y;
}

/** How deep the underside must show below the cap, in the cap's width. */
const UNDERSIDE_SHOWN = 0.06;

describe('every head but the fly agaric’s', () => {
  it('shows its underside well below its cap', () => {
    const species = MUSHROOM_SPECIES.filter((kind) => kind !== 'fly-agaric');
    assert.equal(species.length, MUSHROOM_SPECIES.length - 1);
    for (const kind of species) {
      for (const seed of SEEDS) {
        const genes = mushroomGenes({ seed, species: kind });
        const [cap, under] = headOutlines(genes);
        const shown = (lowest(cap) - lowest(under)) / genes.capWidth;
        if (shown < UNDERSIDE_SHOWN)
          assert.fail(
            `${kind} seed ${seed}: ${(shown * 100).toFixed(1)}% shown`,
          );
      }
    }
  });

  it('dips a russula’s top at its middle, a pixel deep on the smallest place', () => {
    for (const seed of SEEDS) {
      const genes = mushroomGenes({ seed, species: 'russula' });
      const [cap] = headOutlines(genes);
      const dip = dipAtMiddle(cap);
      if (dip < STEP) assert.fail(`seed ${seed}: dips ${dip.toFixed(4)}`);
    }
  });

  it('runs every russula gill down its band as filled', () => {
    for (const seed of SEEDS.slice(0, 400)) {
      const genes = mushroomGenes({ seed, species: 'russula' });
      assert.ok(genes.species === 'russula');
      const [, band] = headOutlines(genes);
      for (const point of gillLines(genes).flat()) {
        if (!containsPoint(band, point))
          assert.fail(`seed ${seed}: a gill off at ${JSON.stringify(point)}`);
      }
    }
  });
});

describe('capUnder', () => {
  it('seats a sheltering insect on the lowest edge under every dome, clear of its stem, one to either side', () => {
    for (const species of MUSHROOM_SPECIES.filter(
      (each) => HEAD_KIND[each] === 'dome',
    )) {
      for (const seed of SEEDS.slice(0, 400)) {
        const genes = mushroomGenes({ seed, species });
        const under = capOutlines(genes);
        const [left, right] = SHELTER_SEATS.map((seat) =>
          capUnder(genes, seat),
        );
        assert.ok(left && right && left.x < right.x, `${species} ${seed}`);
        for (const [seat, across] of [
          [left, -0.55],
          [right, 0.55],
        ] as const) {
          const name = `${species} ${seed} ${String(across)}`;
          const drawn = (dy: number) =>
            under.some((outline) =>
              containsPoint(outline, { ...seat, y: seat.y + dy }),
            );
          assert.ok(!containsPoint(stemOutline(genes), seat), name);
          assert.ok(drawn(genes.capHeight * 0.03), name);
          assert.ok(!drawn(-genes.capHeight * 0.03), name);
          assert.ok(seat.y < capSeat(genes, across).y, name);
          assert.ok(seat.y > stemAt(genes, 0.5).y, name);
        }
      }
    }
  });
});
