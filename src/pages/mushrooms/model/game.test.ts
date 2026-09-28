import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type Action,
  canFurnish,
  firstMeadow,
  isEmpty,
  isFull,
  type Meadow,
  MUSHROOM_SLOTS,
  reduce,
} from './game';
import { EMPTY_HOUSE, type Furnishing, windowSlots } from './house';
import { INSECT_LIMITS } from './insects';
import { mushroomGenes } from './mushroom-genes';
import { mulberry32 } from './random';

const opening = () => firstMeadow(mulberry32(1));
const grow = (seed: number): Action => ({
  kind: 'grow',
  species: 'porcini',
  seed,
});
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
      species: 'porcini',
      house: EMPTY_HOUSE,
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
});

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

/** The flowers in sight, as the scene would pass them, none crowding another. */
const FLOWERS = ['flower-1', 'flower-2', 'flower-3', 'flower-4'];
const SIGHT = {
  flowers: FLOWERS,
  air: [],
  crowded: [],
  room: [],
  seededFlowers: FLOWERS.length,
};
const release = (seed: number, now: number): Action => ({
  kind: 'release',
  insect: 'butterfly',
  seed,
  now,
  ...SIGHT,
});
const startle = (now: number, id = 'butterfly-1'): Action => ({
  kind: 'startle',
  id,
  now,
  ...SIGHT,
});
const tick = (now: number): Action => ({ kind: 'tick', now, ...SIGHT });
const flier = (meadow: Meadow, id: string) =>
  meadow.insects.find((insect) => insect.id === id);

describe('the butterflies', () => {
  it('opens with none', () => {
    assert.deepEqual(opening().insects, []);
  });

  it('flies a release in from off screen, each under a new id', () => {
    const meadow = run(opening(), [release(1, 0), release(2, 10)]);
    assert.deepEqual(
      meadow.insects.map(({ id, kind }) => [id, kind]),
      [
        ['butterfly-1', 'butterfly'],
        ['butterfly-2', 'butterfly'],
      ],
    );
    for (const { leg } of meadow.insects) {
      assert.equal(leg.from.kind, 'away');
      assert.notEqual(leg.to.kind, 'away');
    }
  });

  it('at INSECT_LIMITS.butterfly still flies one in, and sends the oldest away', () => {
    const four = run(
      opening(),
      [1, 2, 3, 4].map((seed) => release(seed, seed)),
    );
    const five = reduce(four, release(5, 100));
    assert.equal(five.insects.length, INSECT_LIMITS.butterfly + 1);
    const first = flier(five, 'butterfly-1');
    assert.ok(first);
    assert.equal(first.leg.to.kind, 'away');
    assert.equal(first.leg.departs, 100);
    const six = reduce(five, release(6, 200));
    assert.equal(flier(six, 'butterfly-1')?.leg.departs, 100);
    assert.equal(flier(six, 'butterfly-2')?.leg.to.kind, 'away');
    assert.equal(
      six.insects.filter(({ leg }) => leg.to.kind !== 'away').length,
      INSECT_LIMITS.butterfly,
    );
  });

  it('removes one flying away once it has gone', () => {
    const five = run(
      opening(),
      [1, 2, 3, 4, 5].map((seed) => release(seed, 0)),
    );
    const gone = flier(five, 'butterfly-1');
    assert.ok(gone);
    const still = reduce(five, tick(gone.leg.arrives - 1));
    assert.ok(flier(still, 'butterfly-1'));
    const after = reduce(still, tick(gone.leg.arrives));
    assert.equal(flier(after, 'butterfly-1'), undefined);
    assert.equal(after.insects.length, INSECT_LIMITS.butterfly);
  });

  it('takes the next leg once the stay is over, and not before', () => {
    const meadow = reduce(opening(), release(1, 0));
    const [butterfly] = meadow.insects;
    assert.ok(butterfly);
    const { leaves, to } = butterfly.leg;
    assert.equal(reduce(meadow, tick(leaves - 1)), meadow);
    const moved = reduce(meadow, tick(leaves));
    const [next] = moved.insects;
    assert.ok(next);
    assert.equal(next.legs, 2);
    assert.equal(next.leg.departs, leaves);
    assert.deepEqual(next.leg.from, to);
  });

  it('startles one at rest into a leg from now, and leaves one in the air be', () => {
    const meadow = reduce(opening(), release(1, 0));
    const [butterfly] = meadow.insects;
    assert.ok(butterfly);
    const { arrives } = butterfly.leg;
    assert.equal(reduce(meadow, startle(arrives - 1)), meadow);
    const [startled] = reduce(meadow, startle(arrives + 1)).insects;
    assert.ok(startled);
    assert.equal(startled.leg.departs, arrives + 1);
    assert.equal(startled.legs, 2);
    assert.equal(reduce(meadow, startle(0, 'butterfly-9')), meadow);
  });

  it('flies one off a cap that is gone, at the next tick', () => {
    // Enough releases that one heads for a cap; each takes off afresh.
    const flown = run(
      opening(),
      Array.from({ length: 40 }, (_, seed) => release(seed, 0)),
    );
    const onCap = flown.insects.find(({ leg }) => leg.to.kind === 'cap');
    assert.ok(onCap);
    const target = onCap.leg.to.kind === 'cap' ? onCap.leg.to.id : '';
    const thinned = run(flown, [
      { kind: 'select', id: target },
      { kind: 'remove' },
    ]);
    assert.deepEqual(flier(thinned, onCap.id), onCap);
    const now = onCap.leg.arrives + 1;
    const ticked = reduce(thinned, tick(now));
    const moved = flier(ticked, onCap.id);
    assert.ok(moved);
    assert.equal(moved.leg.departs, now);
    assert.notDeepEqual(moved.leg.to, onCap.leg.to);
  });

  it('never sends two butterflies to one perch', () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      let meadow = run(
        opening(),
        [0, 1, 2, 3].map((index) => release(seed * 10 + index, index * 500)),
      );
      for (let now = 2000; now < 60_000; now += 100) {
        meadow = reduce(meadow, tick(now));
        if (now % 7000 === 0) meadow = reduce(meadow, startle(now));
        const perches = meadow.insects
          .filter(({ leg }) => leg.to.kind !== 'away')
          .map(({ leg: { to } }) => JSON.stringify(to));
        assert.equal(new Set(perches).size, perches.length, perches.join(' '));
      }
    }
  });

  it('flies one off a flower once it is out of sight, and sends none there', () => {
    const flown = run(
      opening(),
      Array.from({ length: 4 }, (_, seed) => release(seed, 0)),
    );
    const onFlower = flown.insects.find(({ leg }) => leg.to.kind === 'flower');
    assert.ok(onFlower);
    const hidden = onFlower.leg.to.kind === 'flower' ? onFlower.leg.to.id : '';
    const now = onFlower.leg.arrives + 1;
    const sight = FLOWERS.filter((id) => id !== hidden);
    const after = reduce(flown, {
      kind: 'tick',
      now,
      flowers: sight,
      air: [],
      crowded: [],
      room: [],
      seededFlowers: FLOWERS.length,
    });
    const moved = flier(after, onFlower.id);
    assert.ok(moved);
    assert.equal(moved.leg.departs, now);
    for (const { leg } of after.insects) {
      assert.notDeepEqual(leg.to, { kind: 'flower', id: hidden });
    }
  });

  it('leaves the butterflies alone through the mushroom actions', () => {
    const meadow = reduce(opening(), release(1, 0));
    const after = run(meadow, [
      { kind: 'pick' },
      grow(3),
      { kind: 'house' },
      { kind: 'deselect' },
    ]);
    assert.equal(after.insects, meadow.insects);
  });
});
