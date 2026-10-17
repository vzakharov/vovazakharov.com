import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { boxesMeet } from '../../model/geometry';
import { mushroomGenes } from '../../model/mushroom-genes';
import {
  capBox,
  hiddenOf,
  MOST_HIDDEN,
  partOf,
  partSighted,
  pastMore,
  sighted,
} from './cap-cover';
import { standingWith } from './door-sight';

const genes = mushroomGenes({ seed: 3, species: 'fly-agaric' });
const far = standingWith({ x: 0, y: 0, size: 100, haze: 0, splay: 0 }, genes);
/** Twice the far one's size, a little in front and to its left: its stem runs up across the far cap, its own cap well above it. */
const near = standingWith(
  { x: -20, y: 10, size: 200, haze: 0, splay: 0 },
  genes,
);

describe('a cap hidden', () => {
  it('counts a nearer stem drawn across it, the nearer cap clear of its box', () => {
    assert.equal(boxesMeet(capBox(far), capBox(near)), false);
    const byCaps = sighted(partOf(far, 'cap'), partOf(near, 'cap'));
    assert.equal(hiddenOf(byCaps), 0);
    assert.ok(hiddenOf(partSighted(far, 'cap', [near])) > MOST_HIDDEN.cap);
  });

  it('reads the same drawn in front all at once or one after another', () => {
    const [dome = [], gills = [], stem = []] = near.drawn;
    const atOnce = partSighted(far, 'cap', [near]);
    const inTurn = pastMore(sighted(partOf(far, 'cap'), [dome, gills]), [stem]);
    assert.deepEqual(inTurn, atOnce);
  });
});
