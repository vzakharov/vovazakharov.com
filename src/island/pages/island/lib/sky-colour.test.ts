import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DAY_COLOUR,
  NIGHT_COLOUR,
  skyColour,
  SPACE_COLOUR,
} from './sky-colour';

const blue = (hex: number) => hex & 0xff;

describe('skyColour', () => {
  it('is space at orbit and above, by day and by night', () => {
    for (const day of [0, 1]) {
      assert.equal(skyColour(20_000_000, day), SPACE_COLOUR);
      assert.equal(skyColour(40_000_000, day), SPACE_COLOUR);
    }
  });

  it('is day from 100 km down to the ground by day', () => {
    for (const height of [100_000, 10_000, 2]) {
      assert.equal(skyColour(height, 1), DAY_COLOUR);
    }
  });

  it('is night blue from 100 km down by night, never space', () => {
    for (const height of [100_000, 2]) {
      assert.equal(skyColour(height, 0), NIGHT_COLOUR);
    }
    assert.notEqual(NIGHT_COLOUR, SPACE_COLOUR);
  });

  it('brightens steadily on the way down', () => {
    for (const day of [0, 0.5, 1]) {
      let previous = blue(skyColour(20_000_000, day));
      for (let height = 20_000_000; height >= 100_000; height /= 1.5) {
        const now = blue(skyColour(height, day));
        assert.ok(now >= previous, `${String(height)} m`);
        previous = now;
      }
    }
  });

  it('brightens with the day', () => {
    assert.ok(blue(skyColour(1000, 0.5)) > blue(skyColour(1000, 0)));
    assert.ok(blue(skyColour(1000, 1)) > blue(skyColour(1000, 0.5)));
  });
});
