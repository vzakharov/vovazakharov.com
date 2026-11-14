import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { jitterOf, lowSizeOf, SHARES, shifted } from './drowsy-phases';

describe('jitterOf', () => {
  for (const share of SHARES) {
    it(`visits each pixel of a ${String(share)}×${String(share)} block once per ${String(share * share)} frames`, () => {
      const cycle = share * share;
      for (const start of [0, 5, 17]) {
        const seen = new Set<string>();
        for (let frame = start; frame < start + cycle; frame += 1) {
          const { x, y } = jitterOf(share, frame);
          assert.ok(x >= 0 && x < share && y >= 0 && y < share);
          seen.add(`${String(x)},${String(y)}`);
        }
        assert.equal(seen.size, cycle);
      }
    });
  }

  it('steps across the diagonal at share 2', () => {
    assert.deepEqual(jitterOf(2, 0), { x: 0, y: 0 });
    assert.deepEqual(jitterOf(2, 1), { x: 1, y: 1 });
  });
});

describe('lowSizeOf', () => {
  it('keeps a pixel for every block, a part block included', () => {
    assert.deepEqual(lowSizeOf({ width: 1920, height: 1081 }, 4), {
      width: 480,
      height: 271,
    });
  });
});

/** Where the pixel centre a clip point lands on a `width` by `height` frame. */
const pixelOf = (
  m: Float32Array,
  point: readonly [number, number, number],
  width: number,
  height: number,
): [number, number] => {
  const row = (r: number): number =>
    (m[r] ?? 0) * point[0] +
    (m[4 + r] ?? 0) * point[1] +
    (m[8 + r] ?? 0) * point[2] +
    (m[12 + r] ?? 0);
  const w = row(3);
  return [((row(0) / w + 1) / 2) * width, ((1 - row(1) / w) / 2) * height];
};

describe('shifted', () => {
  // A perspective-like matrix with a w that varies, column-major.
  const viewProjection = Float32Array.from([
    1.2, 0.1, 0, 0.05, 0.2, 1.5, 0, -0.1, 0.3, -0.2, 0.5, 1, 0.4, 0.6, 2, 3,
  ]);
  const full = { width: 101, height: 57 };

  for (const share of SHARES) {
    it(`lands the low pixel centres on the intended full pixels at share ${String(share)}`, () => {
      const low = lowSizeOf(full, share);
      for (let frame = 0; frame < share * share; frame += 1) {
        const jitter = jitterOf(share, frame);
        const moved = shifted(viewProjection, jitter, full, low, share);
        for (const point of [
          [0.3, -0.7, 1.1],
          [-1.5, 2, 0.2],
        ] as const) {
          const [fx, fy] = pixelOf(
            viewProjection,
            point,
            full.width,
            full.height,
          );
          const [lx, ly] = pixelOf(moved, point, low.width, low.height);
          // Full pixel `share·i + jitter + 0.5` is low pixel `i + 0.5`.
          assert.ok(Math.abs((fx - jitter.x - 0.5) / share + 0.5 - lx) < 1e-4);
          assert.ok(Math.abs((fy - jitter.y - 0.5) / share + 0.5 - ly) < 1e-4);
        }
      }
    });
  }
});
