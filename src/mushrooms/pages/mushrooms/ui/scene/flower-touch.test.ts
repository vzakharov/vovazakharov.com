import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { firstMeadow, type Meadow, reduce } from '../../model/game';
import { planeFootOf } from '../../model/ground';
import { mulberry32 } from '../../model/random';
import { FLOWER_TOUCH_ACTIONS, type FlowerTouch } from './flower-touch';

/** A meadow with a mushroom selected and the flower picker open on a tuft. */
const BUSY: Meadow = {
  ...firstMeadow(mulberry32(1)),
  selected: 'mushroom-1',
  planting: {
    foot: planeFootOf({ x: 0.4, z: 1.3, size: 0.28 }),
    chosen: undefined,
    flower: undefined,
  },
};

function touched(touch: FlowerTouch): Meadow {
  let meadow = BUSY;
  for (const action of FLOWER_TOUCH_ACTIONS[touch]) {
    meadow = reduce(meadow, action);
  }
  return meadow;
}

describe('a touch on a flower', () => {
  it('leaves a chord finger’s meadow as it was: the selection and the picker hold', () => {
    const after = touched('chord');
    assert.equal(after.selected, BUSY.selected);
    assert.equal(after.planting, BUSY.planting);
  });

  it('lets a tap on a flower deselect, as a tap on the meadow does', () => {
    assert.equal(touched('tap').selected, undefined);
  });
});
