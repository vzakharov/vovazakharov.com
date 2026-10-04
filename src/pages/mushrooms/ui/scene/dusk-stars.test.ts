import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  duskStars,
  STAR_BAND,
  STAR_COUNT,
  STAR_RAY_REACH,
  starTexels,
} from './dusk-stars';
import { meadowLayout } from './layout';
import { SUN_GLOW_REACH } from './sun-layout';
import { EITHER_WAY } from './viewports';

describe('the dusk sky’s stars', () => {
  for (const [name, width, height] of EITHER_WAY) {
    it(`stand a dozen in the upper band, clear of the sun, on a ${name}`, () => {
      const layout = meadowLayout(width, height, 7);
      const stars = duskStars(layout);
      assert.equal(stars.length, STAR_COUNT);
      const { sun, nearHills } = layout;
      for (const { x, y, r } of stars) {
        assert.ok(x >= 0 && x <= width, 'off the screen');
        assert.ok(
          y >= STAR_BAND[0] * nearHills && y <= STAR_BAND[1] * nearHills,
          'out of the band',
        );
        assert.ok(
          Math.hypot(x - sun.x, y - sun.y) > sun.r * SUN_GLOW_REACH,
          'in the sun’s glow',
        );
        assert.ok(r > 0);
      }
    });
  }

  it('stand in the same places on every paint', () => {
    const layout = meadowLayout(1180, 820, 3);
    assert.deepEqual(duskStars(layout), duskStars(layout));
  });
});

describe('the star texture’s size', () => {
  it('holds the widest star one texel to a device pixel, its rays inside the square', () => {
    for (const ratio of [1, 2, 3]) {
      const stars = duskStars(meadowLayout(1180, 820, 3));
      const widest = Math.max(...stars.map(({ r }) => r));
      const { r, side } = starTexels(widest, ratio);
      assert.equal(r, widest * ratio);
      assert.ok(side / 2 >= r * STAR_RAY_REACH[1] + 1, 'rays cut off');
      assert.ok(Number.isInteger(side / 2), 'middle off a texel corner');
    }
  });

  it('never shrinks a star below a texel', () => {
    assert.equal(starTexels(0, 2).r, 1);
  });
});
