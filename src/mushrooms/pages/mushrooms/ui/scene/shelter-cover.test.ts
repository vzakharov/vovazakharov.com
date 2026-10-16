import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { boxAround, type Point } from '../../model/geometry';
import type { Cover } from './flower-sight';
import { discCovered, discPoints } from './shelter-cover';

/** A cover standing at `depth` drawn as the square `left`..`left + side` across and `top`..`top + side` down. */
function square(depth: number, left: number, top: number, side = 10): Cover {
  const outline: Point[] = [
    { x: left, y: top },
    { x: left + side, y: top },
    { x: left + side, y: top + side },
    { x: left, y: top + side },
  ];
  return { depth, drawn: [{ outline, box: boxAround(outline) }] };
}

describe('a seat under a cap', () => {
  const middle = { x: 0, y: 0 };

  it('is judged at its middle and round it as far as the radius', () => {
    const points = discPoints(middle, 4);
    assert.deepEqual(points[0], middle);
    const far = Math.max(...points.map(({ x, y }) => Math.hypot(x, y)));
    assert.ok(Math.abs(far - 4) < 1e-9);
  });

  it('is covered where a nearer mushroom is drawn over its middle', () => {
    assert.ok(discCovered(middle, 0, 5, [square(6, -5, -5)]));
  });

  it('is covered where a nearer mushroom reaches only its wings', () => {
    const beside = square(6, 3, -5);
    assert.ok(!discCovered(middle, 2, 5, [beside]));
    assert.ok(discCovered(middle, 4, 5, [beside]));
  });

  it('is not covered by its own cap or one standing behind it', () => {
    const over = square(5, -5, -5);
    assert.ok(!discCovered(middle, 4, 5, [over]));
    assert.ok(!discCovered(middle, 4, 5, [{ ...over, depth: 4 }]));
  });

  it('is not covered with nothing drawn over it', () => {
    assert.ok(!discCovered(middle, 4, 5, [square(6, 20, 20)]));
    assert.ok(!discCovered(middle, 4, 5, []));
  });
});
