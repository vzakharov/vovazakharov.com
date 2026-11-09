import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { smoothedFrameMs } from './frame-time';

/** The smoothed time after `seconds` of frames `ms` long, from `from`. */
function run(from: number, ms: number, seconds: number): number {
  let smoothed = from;
  for (let t = 0; t < seconds * 1000; t += ms) {
    smoothed = smoothedFrameMs(smoothed, ms);
  }
  return smoothed;
}

describe('smoothedFrameMs', () => {
  it('starts at the first frame', () => {
    assert.equal(smoothedFrameMs(undefined, 16.7), 16.7);
  });

  it('holds a steady frame time', () => {
    assert.ok(Math.abs(run(16.7, 16.7, 2) - 16.7) < 1e-12);
  });

  it('settles on a new frame time within two seconds, never past it', () => {
    const settled = run(16.7, 33.3, 2);
    assert.ok(settled < 33.3);
    assert.ok(33.3 - settled < 0.02 * (33.3 - 16.7));
  });

  it('goes two-thirds of the way in half a second at 30 fps and at 120', () => {
    for (const ms of [33.3, 8.3]) {
      const share = run(0, ms, 0.5) / ms;
      assert.ok(Math.abs(share - (1 - Math.exp(-1))) < 0.03, String(share));
    }
  });
});
