import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { tileHue } from './tile-hue';

describe('tileHue', () => {
  it('gives a slug the same hue every time', () => {
    assert.equal(tileHue('father-sea'), tileHue('father-sea'));
  });

  it('is a whole degree on the wheel', () => {
    for (const slug of ['', 'a', 'old-shite', 'minem-babay', 'sonnet-74']) {
      const hue = tileHue(slug);

      assert.ok(Number.isInteger(hue) && hue >= 0 && hue < 360, slug);
    }
  });

  it('spreads neighbouring slugs apart', () => {
    const hues = new Set(
      ['prototypes', 'smoke', 'inside', 'like-that', 'schadina'].map((slug) =>
        tileHue(slug),
      ),
    );

    assert.equal(hues.size, 5);
  });
});
