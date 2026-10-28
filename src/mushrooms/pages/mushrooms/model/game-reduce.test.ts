import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '@/mushrooms/shared/lib/geometry';
import {
  FIELD_MUSHROOMS,
  FLOWER_SLOTS,
  flowersCrowdAt,
  isCrowdedAt,
  isFull,
  MUSHROOM_SLOTS,
} from '@/mushrooms/shared/meadow';
import { D_SEE } from '@/mushrooms/shared/space';
import {
  EMPTY_HOUSE,
  OPENING_FEET,
} from '@/mushrooms/entities/mushroom/index.node-safe';

import type { Meadow } from '../shape/meadow';
import { type Action, isEmpty, reduce } from './game';
import { footedOf, grow, opening, run } from './game.test-kit';

const footOf = (seed: number) => footedOf(seed).foot;
/** A mushroom grown from `seed` on the plane at `foot`. */
const growAt = (seed: number, foot: Point): Action => ({
  kind: 'grow',
  species: 'porcini',
  seed,
  foot,
  lean: 1,
});
const feetOf = (meadow: Meadow) =>
  meadow.mushrooms.map(({ id, foot }) => [id, foot]);

/** `count` feet evenly round the plane's origin, `away` from it. */
function round(count: number, away: number) {
  return Array.from({ length: count }, (_, at) => {
    const turn = (at / count) * 2 * Math.PI;
    return { foot: { x: away * Math.sin(turn), y: away * Math.cos(turn) } };
  });
}

describe('reduce', () => {
  it('opens on the clump, on the opening feet, nothing selected', () => {
    const meadow = opening();
    assert.deepEqual(
      meadow.mushrooms.map(({ foot }) => foot),
      OPENING_FEET,
    );
    assert.equal(meadow.selected, undefined);
    assert.equal(meadow.picking, false);
  });

  it('toggles the picker', () => {
    const open = reduce(opening(), { kind: 'pick' });
    assert.equal(open.picking, true);
    assert.equal(reduce(open, { kind: 'pick' }).picking, false);
  });

  it('grows the pick on the foot the action carries, selected, the picker closed', () => {
    const meadow = run(opening(), [{ kind: 'pick' }, grow(42)]);
    const grown = meadow.mushrooms.at(-1);
    assert.deepEqual(grown, {
      id: 'mushroom-3',
      seed: 42,
      species: 'porcini',
      house: EMPTY_HOUSE,
      ...footedOf(42),
    });
    assert.equal(meadow.selected, 'mushroom-3');
    assert.equal(meadow.picking, false);
  });

  it('removes only the selected mushroom, and leaves the rest where they stand', () => {
    const meadow = run(opening(), [
      grow(1),
      grow(2),
      { kind: 'select', id: 'mushroom-3' },
      { kind: 'remove' },
    ]);
    assert.deepEqual(feetOf(meadow), [
      ['mushroom-1', OPENING_FEET[0]],
      ['mushroom-2', OPENING_FEET[1]],
      ['mushroom-4', footOf(2)],
    ]);
    assert.equal(meadow.selected, undefined);
  });

  it('grows again once one is thinned, under a new id', () => {
    const meadow = run(opening(), [
      { kind: 'select', id: 'mushroom-1' },
      { kind: 'remove' },
      grow(7),
    ]);
    const grown = meadow.mushrooms.at(-1);
    assert.ok(grown);
    assert.deepEqual(grown.foot, footOf(7));
    assert.equal(grown.id, 'mushroom-3');
  });

  it('removes the newest planted with nothing selected, wherever it stands', () => {
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
    assert.deepEqual(feetOf(thinned), [
      ['mushroom-2', OPENING_FEET[1]],
      ['mushroom-3', footOf(1)],
      ['mushroom-4', footOf(2)],
    ]);
    assert.equal(thinned.selected, undefined);
  });

  it('empties down to nothing, and removes nothing from an empty meadow', () => {
    const bare = run(opening(), [{ kind: 'remove' }, { kind: 'remove' }]);
    assert.ok(isEmpty(bare));
    assert.ok(!isEmpty(opening()));
    assert.deepEqual(reduce(bare, { kind: 'remove' }).mushrooms, []);
  });

  it('counts FLOWER_SLOTS flowers within D_SEE of a foot as crowded, and none farther out', () => {
    const middle = { x: 0, y: 0 };
    assert.ok(flowersCrowdAt(round(FLOWER_SLOTS, D_SEE - 0.01), middle));
    assert.ok(!flowersCrowdAt(round(FLOWER_SLOTS - 1, D_SEE - 0.01), middle));
    assert.ok(!flowersCrowdAt(round(FLOWER_SLOTS * 2, D_SEE + 0.01), middle));
  });

  it('holds at MUSHROOM_SLOTS within D_SEE of a new foot, and grows past them farther out', () => {
    const crowded = run(
      opening(),
      Array.from({ length: MUSHROOM_SLOTS + 3 }, (_, seed) => grow(seed)),
    );
    assert.equal(crowded.mushrooms.length, MUSHROOM_SLOTS);
    assert.ok(isCrowdedAt(crowded, footOf(1)));
    assert.ok(!isFull(crowded));
    const far = { x: 0, y: 2 * D_SEE + 1 };
    assert.ok(!isCrowdedAt(crowded, far));
    const grown = reduce(crowded, growAt(99, far));
    assert.equal(grown.mushrooms.length, MUSHROOM_SLOTS + 1);
  });

  it('counts MUSHROOM_SLOTS round the anchor a new foot grows from, as well as round the foot', () => {
    const ringOf = (count: number) =>
      run(
        { ...opening(), mushrooms: [] },
        round(count, 0.9 * D_SEE).map(({ foot }, seed) => growAt(seed, foot)),
      );
    const ring = ringOf(MUSHROOM_SLOTS);
    assert.equal(ring.mushrooms.length, MUSHROOM_SLOTS);
    const turn = Math.PI / MUSHROOM_SLOTS;
    const gap = {
      x: 0.9 * D_SEE * Math.sin(turn),
      y: 0.9 * D_SEE * Math.cos(turn),
    };
    const middle = { x: 0, y: 0 };
    assert.ok(!isCrowdedAt(ring, gap));
    assert.ok(isCrowdedAt(ring, gap, middle));
    assert.ok(!isCrowdedAt(ringOf(MUSHROOM_SLOTS - 1), gap, middle));
  });

  it('holds at FIELD_MUSHROOMS on the whole field, and a full field opens no picker', () => {
    const full = run(
      opening(),
      Array.from({ length: FIELD_MUSHROOMS + 3 }, (_, index) =>
        growAt(index, { x: (index + 1) * 2 * D_SEE, y: 0 }),
      ),
    );
    assert.equal(full.mushrooms.length, FIELD_MUSHROOMS);
    assert.ok(isFull(full));
    assert.equal(reduce(full, { kind: 'pick' }).picking, false);
  });

  it('ignores a select of a mushroom already gone', () => {
    const meadow = reduce(opening(), { kind: 'select', id: 'mushroom-9' });
    assert.equal(meadow.selected, undefined);
  });

  it('closes the picker on a remove', () => {
    const meadow = run(opening(), [{ kind: 'pick' }, { kind: 'remove' }]);
    assert.equal(meadow.picking, false);
    assert.equal(meadow.mushrooms.length, 1);
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

  it('shuts every picker on the map button, and keeps the selection', () => {
    const picking = run(opening(), [{ kind: 'pick' }, { kind: 'map' }]);
    assert.equal(picking.picking, false);
    const furnishing = run(opening(), [
      { kind: 'select', id: 'mushroom-1' },
      { kind: 'house' },
      { kind: 'map' },
    ]);
    assert.equal(furnishing.furnishing, false);
    assert.equal(furnishing.selected, 'mushroom-1');
  });
});
