import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  EMPTY_HOUSE,
  type Furnishing,
  mushroomGenes,
  windowSlots,
} from '@/mushrooms/entities/mushroom/index.node-safe';
import { canFurnish } from '@/mushrooms/features/furnish-house';

import type { Meadow } from '../shape/meadow';
import { type Action, reduce } from './game';
import { grow, opening, run } from './game.test-kit';

const furnish = (piece: Furnishing): Action => ({ kind: 'furnish', piece });
const houseOf = (meadow: Meadow, id: string) =>
  meadow.mushrooms.find((mushroom) => mushroom.id === id)?.house;
const roomIn = (meadow: Meadow, id: string) => {
  const mushroom = meadow.mushrooms.find((each) => each.id === id);
  assert.ok(mushroom);
  return windowSlots(mushroomGenes(mushroom)).length;
};

describe('furnish', () => {
  it('opens every mushroom with an empty house', () => {
    for (const { house } of run(opening(), [grow(3)]).mushrooms) {
      assert.deepEqual(house, EMPTY_HOUSE);
    }
  });

  it('furnishes the selected mushroom, and leaves the rest be', () => {
    const meadow = run(opening(), [
      { kind: 'select', id: 'mushroom-1' },
      furnish('round'),
      furnish('door'),
    ]);
    assert.deepEqual(houseOf(meadow, 'mushroom-1'), {
      windows: ['round'],
      door: true,
    });
    assert.deepEqual(houseOf(meadow, 'mushroom-2'), EMPTY_HOUSE);
    assert.equal(meadow.selected, 'mushroom-1');
  });

  it('furnishes the newest planted with nothing selected', () => {
    const meadow = run(opening(), [furnish('cross'), furnish('tall')]);
    assert.deepEqual(houseOf(meadow, 'mushroom-2')?.windows, ['cross', 'tall']);
    assert.deepEqual(houseOf(meadow, 'mushroom-1'), EMPTY_HOUSE);
  });

  it('cannot act on a full row: the meadow comes back as it was', () => {
    const room = roomIn(opening(), 'mushroom-2');
    const full = run(opening(), [
      { kind: 'select', id: 'mushroom-2' },
      ...Array.from({ length: room }, () => furnish('square')),
    ]);
    assert.equal(houseOf(full, 'mushroom-2')?.windows.length, room);
    assert.equal(canFurnish(full, 'round'), false);
    assert.equal(reduce(full, furnish('round')), full);
    assert.equal(canFurnish(full, 'door'), true);
  });

  it('cannot put in a second door', () => {
    const doored = run(opening(), [
      { kind: 'select', id: 'mushroom-2' },
      furnish('door'),
    ]);
    assert.equal(canFurnish(doored, 'door'), false);
    assert.equal(reduce(doored, furnish('door')), doored);
    assert.equal(canFurnish(doored, 'cross'), true);
  });

  it('with nothing selected, furnishes the newest with room when the newest is full', () => {
    const room = roomIn(opening(), 'mushroom-2');
    const full = run(
      opening(),
      Array.from({ length: room }, () => furnish('square')),
    );
    assert.equal(houseOf(full, 'mushroom-2')?.windows.length, room);
    assert.equal(full.selected, undefined);
    assert.equal(canFurnish(full, 'round'), true);
    const meadow = reduce(full, furnish('round'));
    assert.deepEqual(houseOf(meadow, 'mushroom-1')?.windows, ['round']);
  });

  it('cannot act on an empty meadow', () => {
    const bare = run(opening(), [{ kind: 'remove' }, { kind: 'remove' }]);
    assert.equal(canFurnish(bare, 'door'), false);
    assert.equal(canFurnish(bare, 'round'), false);
    assert.equal(reduce(bare, furnish('door')), bare);
  });

  it('keeps the house picker open through a pick, and removes a furnished mushroom whole', () => {
    const meadow = run(opening(), [{ kind: 'house' }, furnish('door')]);
    assert.equal(meadow.furnishing, true);
    const thinned = reduce(meadow, { kind: 'remove' });
    assert.deepEqual(
      thinned.mushrooms.map(({ id }) => id),
      ['mushroom-1'],
    );
    assert.equal(thinned.furnishing, false);
  });
});

describe('the two pickers', () => {
  it('open one at a time', () => {
    const caps = reduce(opening(), { kind: 'pick' });
    const house = reduce(caps, { kind: 'house' });
    assert.deepEqual([house.picking, house.furnishing], [false, true]);
    const back = reduce(house, { kind: 'pick' });
    assert.deepEqual([back.picking, back.furnishing], [true, false]);
  });

  it('both close on a tap on the bare meadow', () => {
    const meadow = run(opening(), [{ kind: 'house' }, { kind: 'deselect' }]);
    assert.equal(meadow.furnishing, false);
  });

  it('keeps the house picker open while a mushroom is chosen to furnish', () => {
    const meadow = run(opening(), [
      { kind: 'house' },
      { kind: 'select', id: 'mushroom-1' },
    ]);
    assert.equal(meadow.furnishing, true);
  });

  it('opening the house picker with nothing selected selects where the pick goes', () => {
    const meadow = reduce(opening(), { kind: 'house' });
    assert.equal(meadow.selected, 'mushroom-2');
  });

  it('opening the house picker selects the newest with room, past a full one', () => {
    const doored = run(opening(), [
      { kind: 'select', id: 'mushroom-2' },
      ...Array.from({ length: roomIn(opening(), 'mushroom-2') }, () =>
        furnish('square'),
      ),
      furnish('door'),
      { kind: 'deselect' },
      { kind: 'house' },
    ]);
    assert.equal(doored.selected, 'mushroom-1');
  });

  it('keeps the selection when the house picker opens on one', () => {
    const meadow = run(opening(), [
      { kind: 'select', id: 'mushroom-1' },
      { kind: 'house' },
    ]);
    assert.equal(meadow.selected, 'mushroom-1');
  });

  it('opens no house picker on an empty meadow', () => {
    const bare = run(opening(), [{ kind: 'remove' }, { kind: 'remove' }]);
    assert.equal(reduce(bare, { kind: 'house' }).furnishing, false);
  });
});
