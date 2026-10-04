import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OPENING_EYE } from '../../model/ground';
import { apartOnScreen } from '../../model/placement';
import { SPORE_SEATS } from '../../model/sprouting';
import {
  hiddenOf,
  hidersOf,
  MOST_HIDDEN,
  PARTS,
  partSighted,
} from './cap-cover';
import { groundIn } from './clump-layout';
import type { MeadowLayout } from './layout';
import { patchlessIn } from './mushroom-patch';
import { SPORE_REACH } from './mushroom-room';
import { viewAt } from './view';
import { opened, standingIn } from './visit-play';

const atOpening = (layout: MeadowLayout) => viewAt(layout.camera, OPENING_EYE);

describe('a visit opened under showers', () => {
  it('opens as it did, with no shower', () => {
    const plain = opened(1, 1180, 820, true, atOpening);
    assert.deepEqual(opened(1, 1180, 820, true, atOpening, 0), plain);
  });

  it("sprouts every spore sown as its parent's species round it, a shower at a time", () => {
    const once = opened(1, 1180, 820, false, atOpening, 1);
    const sprouts = once.mushrooms.filter(({ sprout }) => sprout);
    assert.equal(once.meadow.spores.length, 0);
    assert.equal(sprouts.length, once.meadow.scattered);
    assert.ok(sprouts.length > 0);
    for (const { species, foot, sprout } of sprouts) {
      const parent = once.mushrooms.find(({ id }) => id === sprout?.parent);
      assert.ok(parent && !parent.sprout);
      assert.equal(species, parent.species);
      const at = groundIn(once.layout.mushrooms, foot);
      const from = groundIn(once.layout.mushrooms, parent.foot);
      assert.ok(at && from);
      assert.ok(apartOnScreen(at, from) <= SPORE_REACH + 1e-9);
    }
    const parents = new Set(sprouts.map(({ sprout }) => sprout?.parent));
    assert.ok(sprouts.length <= parents.size * SPORE_SEATS);
    const twice = opened(1, 1180, 820, false, atOpening, 2);
    assert.deepEqual(
      twice.mushrooms.slice(0, once.mushrooms.length),
      once.mushrooms,
    );
    assert.ok(twice.mushrooms.length > once.mushrooms.length);
  });

  it('lays each spore clear of the sprouts the others come up as', () => {
    for (const seed of [1, 316_763, 950_283]) {
      const clump = opened(seed, 1180, 820, false, atOpening, 1);
      assert.deepEqual(patchlessIn(clump), [], `visit ${String(seed)}`);
      const among = standingIn(clump);
      for (const one of among) {
        const hiders = hidersOf(one, among);
        for (const part of PARTS) {
          const hidden = hiddenOf(partSighted(one.standing, part, hiders));
          assert.ok(
            hidden <= MOST_HIDDEN[part] + 1e-9,
            `visit ${String(seed)}: a ${part} ${String(hidden)} hidden`,
          );
        }
      }
    }
  });
});
