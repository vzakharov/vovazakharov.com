import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { meadowLayout } from '../ui/scene/layout';
import { VISITS } from '../ui/scene/viewports';
import { PICTOGRAM_LIGHT, sunLight } from './light';

describe('sunLight', () => {
  for (const [name, width, height, side] of [
    ['tablet', 1180, 820, 1],
    ['phone', 390, 844, -1],
  ] as const) {
    it(`points up and to the ${side > 0 ? 'right' : 'left'}, at unit length, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, 50)) {
        const { toward } = sunLight(meadowLayout(width, height, seed));
        assert.ok(Math.sign(toward.x) === side, `x ${toward.x}`);
        assert.ok(toward.y < 0, `y ${toward.y}`);
        assert.ok(Math.abs(Math.hypot(toward.x, toward.y) - 1) < 1e-9);
      }
    });
  }
});

describe('PICTOGRAM_LIGHT', () => {
  it('comes from the upper left, at unit length', () => {
    const { toward } = PICTOGRAM_LIGHT;
    assert.ok(toward.x < 0 && toward.y < 0);
    assert.ok(Math.abs(Math.hypot(toward.x, toward.y) - 1) < 1e-9);
  });
});
