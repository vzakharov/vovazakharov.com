import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { bounds } from './polyline';
import { LATIN, scriptOf } from './script';
import { measure, strokes } from './strokes';

describe('strokes', () => {
  it('writes nothing for nothing', () => {
    assert.deepEqual(strokes('', LATIN), []);
    assert.equal(measure('', LATIN), 0);
  });

  it('sets capitals on the baseline, one em tall, from x = 0', () => {
    const [left, bottom, , top] = bounds(strokes('EXIT', LATIN));
    assert.equal(left, 0);
    assert.equal(bottom, 0);
    assert.equal(top, 1);
  });

  it('measures a line as the sum of its letters, past its last stroke', () => {
    for (const script of [LATIN, scriptOf(30), scriptOf(48)]) {
      const wide = measure('SALE → 50%', script);
      assert.ok(
        Math.abs(wide - measure('SALE ', script) - measure('→ 50%', script)) <
          1e-9,
      );
      assert.ok(bounds(strokes('SALE → 50%', script))[2] < wide);
    }
  });

  it('moves each letter on by the one before', () => {
    const one = bounds(strokes('H', LATIN));
    const two = bounds(strokes('HH', LATIN));
    assert.ok(
      Math.abs(two[2] - one[2] - measure('H', LATIN)) < 1e-9,
      `${two[2]} against ${one[2]}`,
    );
  });

  it('writes the same line the same way every time', () => {
    for (const n of [1, 22, 44, 66]) {
      assert.deepEqual(
        strokes('Actual size', scriptOf(n)),
        strokes('ACTUAL SIZE', scriptOf(n)),
      );
    }
  });
});
