import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DAY_COLOUR, skyColour, SPACE_COLOUR } from './sky-colour';

const blue = (hex: number) => hex & 0xff;

describe('skyColour', () => {
  it('is space at orbit and above', () => {
    assert.equal(skyColour(20_000_000), SPACE_COLOUR);
    assert.equal(skyColour(40_000_000), SPACE_COLOUR);
  });

  it('is day from 100 km down to the ground', () => {
    for (const height of [100_000, 10_000, 2]) {
      assert.equal(skyColour(height), DAY_COLOUR);
    }
  });

  it('brightens steadily on the way down', () => {
    let previous = blue(skyColour(20_000_000));
    for (let height = 20_000_000; height >= 100_000; height /= 1.5) {
      const now = blue(skyColour(height));
      assert.ok(now >= previous, `${String(height)} m`);
      previous = now;
    }
  });
});
