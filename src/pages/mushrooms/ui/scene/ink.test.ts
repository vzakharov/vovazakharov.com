import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ellipse, type Point } from '../../model/geometry';
import { groundAt } from './backdrop-tones';
import { contrast, luminance, mix, nudgeHue } from './colour';
import {
  facingArc,
  inkFor,
  outwardNormals,
  shadowFall,
  taperedLine,
  weightedOutline,
} from './ink';
import { meadowLayout } from './layout';
import { PALETTE } from './palette';
import { CREATURES } from './palette-creatures';
import { VIEWPORTS, VISITS } from './viewports';

/** Every colour a section holds, its nested families' included. */
function coloursIn(section: object): number[] {
  return Object.values(section).flatMap((value: unknown) =>
    typeof value === 'number'
      ? [value]
      : typeof value === 'object' && value !== null
        ? coloursIn(value)
        : [],
  );
}

/** The widest a gene nudges any creature's hue, either way. */
const NUDGE = 0.04;
/** The contrast a child reads an edge by, against the ground and against its own fill. */
const READS = 3;
/** The least a dark ink stands off a fill too dark for 3:1, yet too light to stand off every ground itself. */
const STANDS_OFF = 1.7;

/** A foot's depth down the ground, from 0 at its top to 1 at the bottom edge, and the haze what stands there takes. */
type Foot = { down: number; haze: number };

/**
 * Where every creature stands: the mushrooms' slots (a house is one), the
 * flowers' feet, which the insects perch over, on every screen and a spread
 * of visits, and the bottom edge's `groundDeep`. Each foot's ground is the
 * darkest behind what stands there, the ground lightening up the screen.
 */
const FEET: readonly Foot[] = [
  ...VIEWPORTS.flatMap(([, width, height]) =>
    VISITS.slice(0, 40).flatMap((seed) => {
      const layout = meadowLayout(width, height, seed);
      const depth = height - layout.groundTop;
      const down = (y: number) => (y - layout.groundTop) / depth;
      return [
        ...layout.mushrooms.map(({ y, haze }) => ({ down: down(y), haze })),
        ...layout.flowers.map(({ y }) => ({ down: down(y), haze: 0 })),
      ];
    }),
  ),
  { down: 1, haze: 0 },
];

/** The ink drawn round `fill` hazed by `haze`, and the fill as drawn. */
function drawn(fill: number, haze: number): { ink: number; fill: number } {
  const hazed = mix(fill, PALETTE.air, haze);
  return { ink: inkFor(hazed), fill: hazed };
}

/** The creature colours only ever laid over at low alpha, which no ink edges. */
const OVERLAYS: ReadonlySet<string> = new Set<keyof typeof CREATURES>([
  'shadowCool',
  'shadeCool',
]);

describe('inkFor', () => {
  const edged = Object.fromEntries(
    Object.entries(CREATURES).filter(([name]) => !OVERLAYS.has(name)),
  );
  const fills = coloursIn(edged).flatMap((fill) => [
    fill,
    nudgeHue(fill, -NUDGE),
    nudgeHue(fill, NUDGE),
  ]);

  it('stands every creature off the ground under it, by its ink or its fill', () => {
    assert.ok(FEET.some(({ haze }) => haze > 0));
    assert.ok(FEET.some(({ down }) => down > 0.9));
    const failing = fills.flatMap((fill) =>
      FEET.flatMap(({ down, haze }) =>
        [0, haze].flatMap((by) => {
          const ground = groundAt(down);
          const shown = drawn(fill, by);
          return Math.max(
            contrast(shown.ink, ground),
            contrast(shown.fill, ground),
          ) >= READS
            ? []
            : [
                `${fill.toString(16)} hazed ${by.toFixed(2)} at ${down.toFixed(2)}`,
              ];
        }),
      ),
    );
    assert.deepEqual([...new Set(failing)], []);
  });

  it('stands off its own fill, lighter round a dark one', () => {
    const hazes = [0, ...new Set(FEET.map(({ haze }) => haze))];
    const failing = fills.flatMap((fill) =>
      hazes.flatMap((haze) => {
        const shown = drawn(fill, haze);
        const off = contrast(shown.ink, shown.fill);
        const darker = luminance(shown.ink) < luminance(shown.fill);
        return off >= READS || (darker && off >= STANDS_OFF)
          ? []
          : [
              `${fill.toString(16)} hazed ${haze.toFixed(2)}: ${off.toFixed(2)}`,
            ];
      }),
    );
    assert.deepEqual([...new Set(failing)], []);
  });

  it('is never black', () => {
    for (const fill of fills) assert.ok(luminance(inkFor(fill)) >= 0.01);
  });
});

const FROM_RIGHT = { x: 1, y: 0 };

function widthAt(
  outline: readonly Point[],
  grown: readonly Point[],
  index: number,
): number {
  const [a, b] = [outline[index], grown[index]];
  assert.ok(a && b);
  return Math.hypot(b.x - a.x, b.y - a.y);
}

describe('weightedOutline', () => {
  const circle = ellipse({ x: 0, y: 0 }, 10);
  const rightmost = circle.findIndex(
    ({ x }) => x === Math.max(...circle.map((p) => p.x)),
  );
  const leftmost = circle.findIndex(
    ({ x }) => x === Math.min(...circle.map((p) => p.x)),
  );

  for (const [name, outline] of [
    ['running one way', circle],
    ['running the other', circle.toReversed()],
  ] as const) {
    it(`is thin on the lit side and heavy in the shade, ${name}`, () => {
      const grown = weightedOutline(outline, 2, FROM_RIGHT);
      const [right, left] =
        outline === circle
          ? [rightmost, leftmost]
          : [circle.length - 1 - rightmost, circle.length - 1 - leftmost];
      assert.ok(widthAt(outline, grown, right) < 0.5 * 2);
      assert.ok(widthAt(outline, grown, left) > 1.2 * 2);
      // Outward, never in.
      const at = grown[left];
      assert.ok(at && Math.hypot(at.x, at.y) > 10);
    });
  }

  it('never thins under its least', () => {
    const grown = weightedOutline(circle, 1, FROM_RIGHT, 0.8);
    assert.ok(widthAt(circle, grown, rightmost) >= 0.8 - 1e-9);
  });
});

describe('taperedLine', () => {
  const line = [
    { x: 0, y: 0 },
    { x: 10, y: 2 },
    { x: 20, y: 0 },
    { x: 30, y: 5 },
  ];
  it('is as wide at each end as asked', () => {
    const ribbon = taperedLine(line, [3, 1]);
    const n = line.length;
    const gap = (a: number, b: number) => {
      const [p, q] = [ribbon[a], ribbon[b]];
      assert.ok(p && q);
      return Math.hypot(p.x - q.x, p.y - q.y);
    };
    assert.ok(Math.abs(gap(0, 2 * n - 1) - 3) < 1e-9);
    assert.ok(Math.abs(gap(n - 1, n) - 1) < 1e-9);
  });
});

describe('facingArc', () => {
  it('runs along the side that faces the light', () => {
    const circle = ellipse({ x: 0, y: 0 }, 10);
    const arc = facingArc(circle, FROM_RIGHT, 0.3);
    assert.ok(arc.length > 3 && arc.length < circle.length / 2);
    for (const point of arc) assert.ok(point.x > 0);
    const normals = outwardNormals(circle);
    assert.equal(normals.length, circle.length);
  });
});

describe('shadowFall', () => {
  it('falls away from the sun', () => {
    assert.ok(shadowFall(FROM_RIGHT, 10) < 0);
    assert.ok(shadowFall({ x: -0.6, y: -0.8 }, 10) > 0);
  });
});
