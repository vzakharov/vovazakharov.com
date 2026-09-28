import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mulberry32 } from '../../model/random';
import { grainPixels, mottles } from './grain';
import { meadowLayout } from './layout';

describe('the grain', () => {
  it('is the same from the same seed and differs from another', () => {
    assert.deepEqual(grainPixels(7, 32), grainPixels(7, 32));
    assert.notDeepEqual(grainPixels(7, 32), grainPixels(8, 32));
  });

  it('neither darkens nor lightens what it lies over, on the whole', () => {
    const pixels = grainPixels(0x5e_ed, 256);
    let sum = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const alpha = (pixels[index + 3] ?? 0) / 255;
      // Over mid grey: white lifts it by half the alpha, black sinks it.
      sum += 0.5 + ((pixels[index] ?? 0) / 255 - 0.5) * alpha;
    }
    assert.ok(Math.abs(sum / (pixels.length / 4) - 0.5) < 0.005);
  });
});

describe('the ground’s mottling', () => {
  it('is the same from the same source, and smaller at the back', () => {
    const layout = meadowLayout(1180, 820, 3);
    const patches = mottles(mulberry32(9), layout);
    assert.deepEqual(patches, mottles(mulberry32(9), layout));
    const { groundTop, height } = layout;
    for (const { y, rx, ry } of patches) {
      assert.ok(y >= groundTop && y <= height);
      assert.ok(ry / rx >= 0.18 && ry / rx <= 0.25);
    }
    const backs = patches.filter(
      ({ y }) => y < groundTop + (height - groundTop) * 0.3,
    );
    const fronts = patches.filter(
      ({ y }) => y > groundTop + (height - groundTop) * 0.7,
    );
    const mean = (list: typeof patches) =>
      list.reduce((sum, { rx }) => sum + rx, 0) / list.length;
    if (backs.length > 3 && fronts.length > 3)
      assert.ok(mean(backs) < mean(fronts));
  });
});
