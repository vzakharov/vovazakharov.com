import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pace, STRIDE } from './pace';

describe('pace', () => {
  it('lands no step short of a stride', () => {
    assert.deepEqual(pace(0, 0), { intoStride: 0, landed: 0 });
    assert.equal(pace(0, STRIDE * 0.9).landed, 0);
    assert.equal(pace(STRIDE * 0.5, STRIDE * 0.4).landed, 0);
  });

  it('lands one as the stride is completed, and keeps the rest', () => {
    const { intoStride: walked, landed: steps } = pace(
      STRIDE * 0.75,
      STRIDE * 0.5,
    );
    assert.equal(steps, 1);
    assert.ok(Math.abs(walked - STRIDE * 0.25) < 1e-12);
  });

  it('lands several over a long frame', () => {
    assert.equal(pace(0, STRIDE * 3.5).landed, 3);
  });

  it('counts a way back as a way', () => {
    assert.deepEqual(pace(0.1, -0.1), pace(0.1, 0.1));
  });

  it('lands a step a stride however the way is cut into frames', () => {
    for (const frame of [0.001, 0.0047, 0.02, 0.11]) {
      let walked = 0;
      let landed = 0;
      const frames = Math.round((40 * STRIDE) / frame);
      for (let index = 0; index < frames; index += 1) {
        const paced = pace(walked, frame);
        walked = paced.intoStride;
        landed += paced.landed;
      }
      assert.ok(Math.abs(landed - (frames * frame) / STRIDE) <= 1, `${frame}`);
      assert.ok(walked >= 0 && walked < STRIDE);
    }
  });
});
