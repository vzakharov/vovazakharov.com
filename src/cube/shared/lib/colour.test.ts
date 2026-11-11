import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { cssRgb, hex, hsl, hueOf, linear, toHex } from './colour';

const close = (actual: readonly number[], expected: readonly number[]) => {
  for (const [i, value] of expected.entries()) {
    assert.ok(
      Math.abs((actual[i] ?? Number.NaN) - value) < 1e-9,
      actual.join(', '),
    );
  }
};

describe('colour', () => {
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

  it('reads a hex colour and writes it back', () => {
    close(hex(0xff_80_00), [1, 128 / 255, 0]);
    assert.equal(toHex(hex(0x12_ab_9f)), 0x12_ab_9f);
    assert.equal(cssRgb(hex(0x00_ab_9f)), '#00ab9f');
  });

  it('takes sRGB to linear light at both ends and the knee', () => {
    close(linear([0, 1, 0.040_45]), [0, 1, 0.040_45 / 12.92]);
    assert.ok(Math.abs(linear([0.5, 0, 0])[0] - 0.214_041_1) < 1e-6);
  });
});
