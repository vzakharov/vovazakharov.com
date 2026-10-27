import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { bakeTiles, faceFrame, onPixels } from './baking';

const HOMES = [
  { x: 37.3, y: 61.85, r: 28.4 },
  { x: 1143.2, y: 402.7, r: 44.1 },
  { x: 12, y: 12, r: 22 },
];
const RATIOS = [1, 1.5, 2, 2.625, 3];

describe('faceFrame', () => {
  it('lays a face at rest texel for pixel, its middle on the button’s own', () => {
    for (const home of HOMES) {
      for (const ratio of RATIOS) {
        const { left, top, side, origin } = faceFrame(home, ratio);
        assert.ok(Number.isInteger(left) && Number.isInteger(top));
        assert.ok(side % 2 === 0, `side ${String(side)} is odd`);
        // Where the face's origin lands on screen, in device pixels.
        assert.ok(Math.abs(left + origin.x * side - home.x * ratio) < 1e-9);
        assert.ok(Math.abs(top + origin.y * side - home.y * ratio) < 1e-9);
      }
    }
  });

  it('holds the whole disc, its ink ring and the shadow under it', () => {
    for (const home of HOMES) {
      for (const ratio of RATIOS) {
        const { left, top, side } = faceFrame(home, ratio);
        // The disc's outer edge: its radius, half its ink ring (`drawDisc`),
        // and its shadow's drop below it, with a pixel's antialiasing.
        const ring = Math.max(2, home.r * 0.1) / 2;
        const reach = (home.r + ring + 1) * ratio;
        const below = (home.r * 1.07 + 1) * ratio;
        assert.ok(left <= home.x * ratio - reach);
        assert.ok(left + side >= home.x * ratio + reach);
        assert.ok(top <= home.y * ratio - reach);
        assert.ok(top + side >= home.y * ratio + below);
      }
    }
  });
});

describe('bakeTiles', () => {
  it('covers every texel of a picture exactly once', () => {
    for (const [width, height, tile] of [
      [2360, 1640, 1024],
      [1170, 2532, 1024],
      [1024, 1024, 1024],
      [7, 5, 3],
    ] as const) {
      const covered = new Uint8Array(width * height);
      for (const { left, top } of bakeTiles(width, height, tile)) {
        for (let y = top; y < Math.min(height, top + tile); y++) {
          for (let x = left; x < Math.min(width, left + tile); x++) {
            covered[y * width + x] = (covered[y * width + x] ?? 0) + 1;
          }
        }
      }
      assert.ok(covered.every((count) => count === 1));
    }
  });
});

describe('a stretch on whole device pixels', () => {
  it('widens to the device pixels it touches, whole at the ratio', () => {
    for (const ratio of [1, 1.5, 2, 3]) {
      const [from, to] = onPixels(10.37, 211.9, ratio);
      assert.ok(from <= 10.37 && to >= 211.9);
      assert.ok(Number.isInteger(Math.round(from * ratio * 1e9) / 1e9));
      assert.ok(Number.isInteger(Math.round(to * ratio * 1e9) / 1e9));
      assert.ok(10.37 - from < 1 / ratio && to - 211.9 < 1 / ratio);
    }
  });
});
