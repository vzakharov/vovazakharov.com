import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OPENING_EYE } from '../../model/ground';
import { apartOnScreen } from '../../model/placement';
import { shedding } from '../../model/sprouting';
import { groundIn } from './clump-layout';
import { SPROUT_REACH } from './mushroom-room';
import { shedIn } from './shedding';
import { viewAt } from './view';
import { opened } from './visit-play';

describe('the sprouts a shed finds room for', () => {
  const stand = opened(1, 1180, 820, false);
  const view = viewAt(stand.layout.camera, OPENING_EYE);
  const meadow = { ...stand.meadow, rain: { startedAt: 0, stopsAt: 1000 } };

  it('stands each sprout within reach of its parent', () => {
    const shedders = shedding(meadow, 1000, () => true);
    assert.ok(shedders);
    const shed = shedIn(stand, shedders, view);
    assert.ok(shed);
    assert.ok(shed.sprouts.length > 0, 'no sprout found room');
    const parent = stand.mushrooms.find(({ id }) => id === shed.parent);
    assert.ok(parent);
    const ground = stand.layout.mushrooms;
    const from = groundIn(ground, parent.foot);
    assert.ok(from);
    for (const { foot } of shed.sprouts) {
      const at = groundIn(ground, foot);
      assert.ok(at);
      assert.ok(apartOnScreen(at, from) <= SPROUT_REACH + 1e-9);
    }
  });

  it('names no shed where no shedder is given', () => {
    assert.equal(shedIn(stand, [], view), undefined);
  });
});
