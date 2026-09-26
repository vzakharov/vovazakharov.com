import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type Action,
  firstMeadow,
  isEmpty,
  isFull,
  type Meadow,
  MUSHROOM_SLOTS,
  reduce,
} from './game';
import { mulberry32 } from './random';

const opening = () => firstMeadow(mulberry32(1));
const grow = (seed: number): Action => ({ kind: 'grow', cap: 'plain', seed });
function run(meadow: Meadow, actions: readonly Action[]): Meadow {
  let state = meadow;
  for (const action of actions) state = reduce(state, action);
  return state;
}

describe('reduce', () => {
  it('opens on the clump, in the first two slots, nothing selected', () => {
    const meadow = opening();
    assert.deepEqual(
      meadow.mushrooms.map(({ slot }) => slot),
      [0, 1],
    );
    assert.equal(meadow.selected, undefined);
    assert.equal(meadow.picking, false);
  });

  it('toggles the picker', () => {
    const open = reduce(opening(), { kind: 'pick' });
    assert.equal(open.picking, true);
    assert.equal(reduce(open, { kind: 'pick' }).picking, false);
  });

  it('grows the pick into the lowest free slot, selected, the picker closed', () => {
    const meadow = run(opening(), [{ kind: 'pick' }, grow(42)]);
    const grown = meadow.mushrooms.at(-1);
    assert.deepEqual(grown, {
      id: 'mushroom-3',
      seed: 42,
      cap: 'plain',
      slot: 2,
    });
    assert.equal(meadow.selected, 'mushroom-3');
    assert.equal(meadow.picking, false);
  });

  it('removes only the selected mushroom, and leaves the rest in their slots', () => {
    const meadow = run(opening(), [
      grow(1),
      grow(2),
      { kind: 'select', id: 'mushroom-3' },
      { kind: 'remove' },
    ]);
    assert.deepEqual(
      meadow.mushrooms.map(({ id, slot }) => [id, slot]),
      [
        ['mushroom-1', 0],
        ['mushroom-2', 1],
        ['mushroom-4', 3],
      ],
    );
    assert.equal(meadow.selected, undefined);
  });

  it('fills a freed slot again, under a new id', () => {
    const meadow = run(opening(), [
      { kind: 'select', id: 'mushroom-1' },
      { kind: 'remove' },
      grow(7),
    ]);
    const grown = meadow.mushrooms.at(-1);
    assert.ok(grown);
    assert.equal(grown.slot, 0);
    assert.equal(grown.id, 'mushroom-3');
  });

  it('removes the newest planted with nothing selected, whatever its slot', () => {
    // mushroom-5 is planted last, into the slot mushroom-1 left: the lowest.
    const meadow = run(opening(), [
      grow(1),
      grow(2),
      { kind: 'select', id: 'mushroom-1' },
      { kind: 'remove' },
      grow(3),
    ]);
    const thinned = reduce(
      { ...meadow, selected: undefined },
      { kind: 'remove' },
    );
    assert.deepEqual(
      thinned.mushrooms.map(({ id, slot }) => [id, slot]),
      [
        ['mushroom-2', 1],
        ['mushroom-3', 2],
        ['mushroom-4', 3],
      ],
    );
    assert.equal(thinned.selected, undefined);
  });

  it('empties down to nothing, and removes nothing from an empty meadow', () => {
    const bare = run(opening(), [{ kind: 'remove' }, { kind: 'remove' }]);
    assert.ok(isEmpty(bare));
    assert.ok(!isEmpty(opening()));
    assert.deepEqual(reduce(bare, { kind: 'remove' }).mushrooms, []);
  });

  it('holds at MUSHROOM_SLOTS, and a full meadow opens no picker', () => {
    const full = run(
      opening(),
      Array.from({ length: MUSHROOM_SLOTS + 3 }, (_, seed) => grow(seed)),
    );
    assert.equal(full.mushrooms.length, MUSHROOM_SLOTS);
    assert.ok(isFull(full));
    assert.equal(
      new Set(full.mushrooms.map(({ slot }) => slot)).size,
      MUSHROOM_SLOTS,
    );
    assert.equal(reduce(full, { kind: 'pick' }).picking, false);
  });

  it('ignores a select of a mushroom already gone', () => {
    const meadow = reduce(opening(), { kind: 'select', id: 'mushroom-9' });
    assert.equal(meadow.selected, undefined);
  });

  it('deselects and closes the picker on a tap on the bare meadow', () => {
    const meadow = run(opening(), [
      { kind: 'select', id: 'mushroom-2' },
      { kind: 'pick' },
      { kind: 'deselect' },
    ]);
    assert.equal(meadow.selected, undefined);
    assert.equal(meadow.picking, false);
  });
});
