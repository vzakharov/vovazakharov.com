import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ellipse, type Point } from '../../model/geometry';
import { contrast, luminance, nudgeHue } from './colour';
import {
  facingArc,
  inkFor,
  outwardNormals,
  shadowFall,
  taperedLine,
  weightedOutline,
} from './ink';
import { PALETTE } from './palette';
import { CREATURES } from './palette-creatures';

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
/** A fill light enough that an ink can stand off it at 3:1. */
const INKABLE = 0.15;

const grounds = Object.entries(PALETTE)
  .filter(([name]) => name === 'ground' || name === 'groundLit')
  .flatMap(([, colour]) => (typeof colour === 'number' ? [colour] : []));

describe('inkFor', () => {
  const fills = coloursIn(CREATURES).flatMap((fill) => [
    fill,
    nudgeHue(fill, -NUDGE),
    nudgeHue(fill, NUDGE),
  ]);

  it('reads against the ground, whatever it edges', () => {
    assert.ok(grounds.length > 0);
    for (const fill of fills) {
      for (const ground of grounds) {
        const ink = inkFor(fill);
        assert.ok(
          contrast(ink, ground) >= 3,
          `${fill.toString(16)}'s ink ${ink.toString(16)} on ${ground.toString(16)}`,
        );
      }
    }
  });

  it('stands off its own fill, wherever the fill is light enough to allow it', () => {
    for (const fill of fills.filter((colour) => luminance(colour) >= INKABLE)) {
      assert.ok(
        contrast(inkFor(fill), fill) >= 3,
        `${fill.toString(16)} against its ink ${inkFor(fill).toString(16)}`,
      );
    }
  });

  it('is never lighter than the silhouette allows', () => {
    for (const fill of fills) assert.ok(luminance(inkFor(fill)) <= 0.06);
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
