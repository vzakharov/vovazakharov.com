import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Meadow, reduce } from '../../model/game';
import { OPENING_EYE } from '../../model/ground';
import { apartOnScreen } from '../../model/placement';
import { SPORE_SEATS } from '../../model/sprouting';
import { groundIn } from './clump-layout';
import { standOf } from './flower-sight';
import { SPORE_REACH } from './mushroom-room';
import { sporeOnTap } from './spore-seats';
import { viewAt } from './view';
import { opened } from './visit-play';

describe('the spore a tap on a mushroom settles', () => {
  // A visit whose first mushroom has room for all six dots in sight round it.
  const stand = opened(2, 1180, 820, false);
  const view = viewAt(stand.layout.camera, OPENING_EYE);
  const [parent] = stand.meadow.mushrooms;
  assert.ok(parent);
  const { id, foot } = parent;
  const sceneOf = (meadow: Meadow) => ({
    meadow: () => meadow,
    stand: () => standOf(stand.layout, stand.flowers, meadow),
    view: () => view,
  });

  it('settles each within reach of its parent, and none past six', () => {
    const ground = stand.layout.mushrooms;
    const from = groundIn(ground, foot);
    assert.ok(from);
    let meadow = stand.meadow;
    for (const tap of Array.from({ length: SPORE_SEATS }).keys()) {
      const settled = sporeOnTap(sceneOf(meadow), id, tap);
      assert.ok(settled.spore, `tap ${String(tap)} settled none`);
      const at = groundIn(ground, settled.spore.foot);
      assert.ok(at);
      assert.ok(apartOnScreen(at, from) <= SPORE_REACH + 1e-9);
      meadow = reduce(meadow, { kind: 'select', id, ...settled });
    }
    assert.equal(meadow.spores.length, SPORE_SEATS);
    assert.deepEqual(sporeOnTap(sceneOf(meadow), id, SPORE_SEATS), {});
  });

  it('settles none from a sprout still growing', () => {
    const growing: Meadow = {
      ...stand.meadow,
      mushrooms: stand.meadow.mushrooms.map((mushroom) =>
        mushroom.id === id
          ? { ...mushroom, sprout: { parent: 'elder', at: 0 } }
          : mushroom,
      ),
    };
    assert.deepEqual(sporeOnTap(sceneOf(growing), id, 1000), {});
  });
});
