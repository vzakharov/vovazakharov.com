import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { firstMeadow } from '../../model/game';
import { mulberry32 } from '../../model/random';
import { meadowLayout } from './layout';
import { keptRoom } from './mushroom-room';

/** `keptRoom` over a finder that counts how often it is asked. */
function counted() {
  const asked = { times: 0 };
  const room = keptRoom(() => {
    asked.times += 1;
    return { x: asked.times, z: 0 };
  });
  return { asked, room };
}

describe('the room kept for the next mushroom', () => {
  const { mushrooms, planted } = firstMeadow(mulberry32(1));
  const stand = {
    layout: meadowLayout(1180, 820, 1),
    flowers: [],
    mushrooms,
    planted,
  };

  it('answers again from what it found while nothing changes', () => {
    const { asked, room } = counted();
    assert.deepEqual(room(stand, 7), { x: 1, z: 0 });
    assert.deepEqual(room({ ...stand }, 7), { x: 1, z: 0 });
    assert.equal(asked.times, 1);
  });

  it('finds the room again once a resize lays the same meadow out anew', () => {
    const { asked, room } = counted();
    room(stand, 7);
    room({ ...stand, layout: meadowLayout(1180, 760, 1) }, 7);
    assert.equal(asked.times, 2);
  });

  it('finds the room again once the mushrooms, the plantings or the seed change', () => {
    const { asked, room } = counted();
    room(stand, 7);
    room({ ...stand, mushrooms: [...mushrooms] }, 7);
    room({ ...stand, planted: [...planted] }, 7);
    room(stand, 8);
    assert.equal(asked.times, 4);
  });
});
