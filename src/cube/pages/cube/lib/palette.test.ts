import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { colourOf, hsl, hueOf } from './palette';

const close = (actual: readonly number[], expected: readonly number[]) => {
  for (const [i, value] of expected.entries()) {
    assert.ok(
      Math.abs((actual[i] ?? Number.NaN) - value) < 1e-9,
      actual.join(', '),
    );
  }
};

describe('the palette', () => {
  it('turns each floor by the golden angle', () => {
    assert.equal(hueOf(0), 0);
    assert.ok(Math.abs(hueOf(1) - 137.508) < 1e-9);
    assert.ok(Math.abs(hueOf(3) - ((3 * 137.508) % 360)) < 1e-9);
  });

  it('converts HSL as CSS does', () => {
    close(hsl(0, 1, 0.5), [1, 0, 0]);
    close(hsl(120, 1, 0.5), [0, 1, 0]);
    close(hsl(240, 1, 0.25), [0, 0, 0.5]);
    close(hsl(77, 0, 0.3), [0.3, 0.3, 0.3]);
  });

  it('paints neighbouring floors different walls', () => {
    assert.notDeepEqual(colourOf(1, 'wall'), colourOf(2, 'wall'));
  });
});
