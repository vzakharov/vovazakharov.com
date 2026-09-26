import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { clipToConvex, containsPoint, type Point } from './geometry';

const square = (x: number, y: number, side: number): Point[] => [
  { x, y },
  { x: x + side, y },
  { x: x + side, y: y + side },
  { x, y: y + side },
];

function area(outline: readonly Point[]): number {
  let sum = 0;
  for (const [index, a] of outline.entries()) {
    const b = outline[(index + 1) % outline.length] ?? a;
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum / 2);
}

describe('clipToConvex', () => {
  it('keeps what lies inside the opening, whichever way either runs', () => {
    const opening = square(0, 0, 2);
    const shape = square(1, 1, 2);
    for (const clip of [opening, opening.toReversed()]) {
      for (const subject of [shape, shape.toReversed()]) {
        const kept = clipToConvex(subject, clip);
        assert.ok(Math.abs(area(kept) - 1) < 1e-9);
        for (const point of kept) {
          assert.ok(point.x >= 1 - 1e-9 && point.x <= 2 + 1e-9);
          assert.ok(point.y >= 1 - 1e-9 && point.y <= 2 + 1e-9);
        }
      }
    }
  });

  it('keeps a shape inside the opening whole, and nothing of one outside', () => {
    const opening = square(0, 0, 4);
    assert.ok(Math.abs(area(clipToConvex(square(1, 1, 1), opening)) - 1) < 1e-9);
    assert.equal(clipToConvex(square(5, 5, 1), opening).length, 0);
  });

  it('keeps no point outside a round opening', () => {
    const round = Array.from({ length: 24 }, (_, index) => ({
      x: Math.cos((index / 24) * Math.PI * 2),
      y: Math.sin((index / 24) * Math.PI * 2),
    }));
    const kept = clipToConvex(square(0, -2, 4), round);
    assert.ok(kept.length > 0);
    const grown = round.map(({ x, y }) => ({ x: x * 1.001, y: y * 1.001 }));
    for (const point of kept) assert.ok(containsPoint(grown, point));
  });
});
