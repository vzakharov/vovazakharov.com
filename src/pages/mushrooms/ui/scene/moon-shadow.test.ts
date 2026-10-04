import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '../../model/geometry';
import { moonShadow } from './moon-shadow';

const MOON = { x: 40, y: -10, r: 20 };
const OFFSET = 0.35;

/** The area `outline` closes, by the shoelace. */
function area(outline: readonly Point[]): number {
  let twice = 0;
  for (const [index, a] of outline.entries()) {
    const b = outline[(index + 1) % outline.length] ?? a;
    twice += a.x * b.y - b.x * a.y;
  }
  return Math.abs(twice) / 2;
}

describe('moonShadow', () => {
  it('closes the area of the disc less the moved disc', () => {
    const { r } = MOON;
    const d = OFFSET * r;
    const lens =
      2 * r * r * Math.acos(d / (2 * r)) -
      (d / 2) * Math.sqrt(4 * r * r - d * d);
    const expected = Math.PI * r * r - lens;
    const got = area(moonShadow(MOON, 0.7, OFFSET, 200));
    assert.ok(
      Math.abs(got - expected) / expected < 0.01,
      `${got} vs ${expected}`,
    );
  });

  it('stays on the disc and off the moved disc', () => {
    const lit = -Math.PI / 4;
    const moved = {
      x: MOON.x + Math.cos(lit) * OFFSET * MOON.r,
      y: MOON.y + Math.sin(lit) * OFFSET * MOON.r,
    };
    for (const point of moonShadow(MOON, lit, OFFSET, 24)) {
      const fromMoon = Math.hypot(point.x - MOON.x, point.y - MOON.y);
      const fromMoved = Math.hypot(point.x - moved.x, point.y - moved.y);
      assert.ok(fromMoon <= MOON.r + 1e-9);
      assert.ok(fromMoved >= MOON.r - 1e-9);
    }
  });

  it('is widest on the side away from the light', () => {
    const outline = moonShadow(MOON, 0, OFFSET, 24);
    const leftmost = Math.min(...outline.map(({ x }) => x));
    assert.ok(Math.abs(leftmost - (MOON.x - MOON.r)) < 1e-9);
    assert.ok(
      outline.every(({ x }) => x < MOON.x + (OFFSET * MOON.r) / 2 + 1e-9),
    );
  });
});
