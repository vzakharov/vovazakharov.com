import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { grainPixels, grainStrips } from './grain';
import { meadowLayout } from './layout';
import { seamReach } from './skyline';
import { VIEWPORTS } from './viewports';

describe('the grain', () => {
  it('is the same from the same seed and differs from another', () => {
    assert.deepEqual(grainPixels(7, 32), grainPixels(7, 32));
    assert.notDeepEqual(grainPixels(7, 32), grainPixels(8, 32));
  });

  it('tiles with no seam: across its edges it changes no more than between any two neighbours', () => {
    const side = 256;
    const pixels = grainPixels(0x5e_ed, side);
    // Each pixel's lift, from -1 (black at full alpha) to 1 (white).
    const lift = (x: number, y: number) => {
      const index = (((y + side) % side) * side + ((x + side) % side)) * 4;
      const sign = (pixels[index] ?? 0) > 0 ? 1 : -1;
      return (sign * (pixels[index + 3] ?? 0)) / 255;
    };
    let [inside, across, down] = [0, 0, 0];
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side - 1; x++) {
        inside += Math.abs(lift(x, y) - lift(x + 1, y));
      }
      across += Math.abs(lift(side - 1, y) - lift(0, y));
      down += Math.abs(lift(y, side - 1) - lift(y, 0));
    }
    const step = inside / (side * (side - 1));
    assert.ok(
      across / side <= step * 1.15,
      `${String(across / side)} against ${String(step)}`,
    );
    assert.ok(
      down / side <= step * 1.15,
      `${String(down / side)} against ${String(step)}`,
    );
  });

  it('gives the ground a tooth: most of its pixels lift or sink it visibly, not a few specks', () => {
    const pixels = grainPixels(0x5e_ed, 256);
    const alphas = pixels.filter((_, index) => index % 4 === 3).toSorted();
    assert.ok((alphas[alphas.length >> 1] ?? 0) / 255 >= 0.2);
  });

  it('lies on the ground alone, from the seam’s highest point down, coming in by degrees', () => {
    for (const [, width, height] of VIEWPORTS) {
      const layout = meadowLayout(width, height, 3);
      const top = layout.groundTop - seamReach(layout);
      const strips = grainStrips(layout, top);
      assert.equal(strips[0]?.top, top);
      assert.equal(strips.at(-1)?.bottom, height);
      for (const [index, strip] of strips.entries()) {
        const before = strips[index - 1];
        if (before) {
          assert.equal(strip.top, before.bottom);
          assert.ok(strip.share > before.share);
        }
      }
      assert.ok((strips.at(0)?.share ?? 1) < 0.2);
      assert.equal(strips.at(-1)?.share, 1);
    }
  });
});
