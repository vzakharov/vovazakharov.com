import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OPENING_EYE } from '../../model/ground';
import { apartOnScreen } from '../../model/placement';
import { SPROUTS } from '../../model/sprouting';
import { groundIn } from './clump-layout';
import type { MeadowLayout } from './layout';
import { SPROUT_REACH } from './mushroom-room';
import { viewAt } from './view';
import { opened } from './visit-play';

const atOpening = (layout: MeadowLayout) => viewAt(layout.camera, OPENING_EYE);

describe('a visit opened under showers', () => {
  it('opens as it did, with no shower', () => {
    const plain = opened(1, 1180, 820, true, atOpening);
    assert.deepEqual(opened(1, 1180, 820, true, atOpening, 0), plain);
  });

  it("sheds the oldest mushroom's own species round it, a shower at a time", () => {
    const once = opened(1, 1180, 820, false, atOpening, 1);
    const sprouts = once.mushrooms.filter(({ sprout }) => sprout);
    assert.ok(sprouts.length > 0 && sprouts.length <= SPROUTS);
    const [oldest] = once.mushrooms;
    assert.ok(oldest);
    const from = groundIn(once.layout.mushrooms, oldest.foot);
    assert.ok(from);
    for (const { species, foot, sprout } of sprouts) {
      assert.equal(sprout?.parent, oldest.id);
      assert.equal(species, oldest.species);
      const at = groundIn(once.layout.mushrooms, foot);
      assert.ok(at);
      assert.ok(apartOnScreen(at, from) <= SPROUT_REACH + 1e-9);
    }
    assert.equal(once.meadow.shed, once.meadow.rain?.stopsAt);
    const twice = opened(1, 1180, 820, false, atOpening, 2);
    assert.deepEqual(
      twice.mushrooms.slice(0, once.mushrooms.length),
      once.mushrooms,
    );
  });
});
