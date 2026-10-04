import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { duskStars, STAR_BAND, STAR_COUNT } from './dusk-stars';
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
