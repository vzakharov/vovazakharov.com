import assert from 'node:assert/strict';

import type { Point } from '@/scene/shared/lib/plane';

export function near(
  actual: number,
  expected: number,
  tolerance: number,
): void {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} is not within ${tolerance} of ${expected}`,
  );
}

export function nearPoint(
  actual: Point,
  expected: Point,
  tolerance: number,
): void {
  near(actual.x, expected.x, tolerance);
  near(actual.y, expected.y, tolerance);
}
