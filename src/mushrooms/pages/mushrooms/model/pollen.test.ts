import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import type { Leg, Perch } from './flight';
import {
  NO_POLLEN,
  type Plot,
  type Pollen,
  POLLEN_MOST,
  pollenAfter,
  type Sown,
  sown,
  specksAt,
} from './pollen';

const flower = (id: string): Perch => ({ kind: 'flower', id });
const AIR: Perch = { kind: 'air', id: 'air-1' };

/** A leg from `from` to `to`, landing at 1000 and due to leave at 3000. */
function leg(to: Perch, from: Perch = AIR): Leg {
  return { from, to, departs: 0, arrives: 1000, leaves: 3000 };
}

/** The pollen after drinking at each of `flowers` in turn, each visit left once its stay is over. */
function visits(flowers: readonly string[]): Pollen {
  let pollen = NO_POLLEN;
  let current = leg(AIR);
  for (const id of flowers) {
    const next = leg(flower(id), current.to);
    pollen = pollenAfter(pollen, current, 3000, next);
    current = next;
  }
  return pollenAfter(pollen, current, 3000, leg(AIR, current.to));
}

describe('pollenAfter', () => {
  it('carries the first flower’s pollen on, a speck of it, and pollinates the next', () => {
    const first = leg(flower('flower-1'));
    const carried = pollenAfter(
      NO_POLLEN,
      first,
      3000,
      leg(flower('flower-2')),
    );
    assert.deepEqual(carried, {
      from: 'flower-1',
      specks: 1,
      pollinates: true,
    });
  });

  it('never pollinates the flower it carries pollen from', () => {
    const first = leg(flower('flower-1'));
    const back = pollenAfter(NO_POLLEN, first, 3000, leg(flower('flower-1')));
    assert.equal(back.pollinates, false);
  });

  it('adds a speck a visit up to POLLEN_MOST, and sheds them all where it pollinates', () => {
    const same = visits(['flower-1', 'flower-1', 'flower-1', 'flower-1']);
    assert.equal(same.specks, POLLEN_MOST);
    assert.equal(visits(['flower-1', 'flower-1']).specks, 2);
    // Pollinating the second flower sheds the two, and it picks one up there.
    assert.equal(visits(['flower-1', 'flower-1', 'flower-2']).specks, 1);
    assert.equal(visits(['flower-1', 'flower-1', 'flower-2']).from, 'flower-2');
  });

  it('leaves the load as it was on a leg cut short before it landed', () => {
    const load = { from: 'flower-1', specks: 2, pollinates: true };
    const cut = pollenAfter(
      load,
      leg(flower('flower-2')),
      500,
      leg(flower('flower-1')),
    );
    assert.deepEqual(cut, { from: 'flower-1', specks: 2, pollinates: false });
    const roamed = pollenAfter(load, leg(AIR), 3000, leg(flower('flower-3')));
    assert.deepEqual(roamed, { from: 'flower-1', specks: 2, pollinates: true });
  });
});

describe('specksAt', () => {
  it('shows the load in flight, and none once landed at a flower it pollinates', () => {
    const pollen = { from: 'flower-1', specks: 2, pollinates: true };
    const flight = { leg: leg(flower('flower-2')), legs: 3 };
    assert.equal(specksAt({ pollen, ...flight }, 999), 2);
    assert.equal(specksAt({ pollen, ...flight }, 1000), 0);
    const home = { ...pollen, pollinates: false };
    assert.equal(specksAt({ pollen: home, ...flight }, 2000), 2);
  });
});

describe('sown', () => {
  const pollinating = { from: 'flower-1', specks: 1, pollinates: true };
  const bee = {
    seed: 77,
    legs: 4,
    leg: leg(flower('flower-2')),
    pollen: pollinating,
  };
  const plot: Plot = {
    room: [
      { flower: 'flower-1', ring: 0 },
      { flower: 'flower-2', ring: 2 },
    ],
  };

  it('plants beside the flower it pollinated, in the slot offered, as it leaves', () => {
    const planted = sown(bee, 3000, plot, []);
    assert.ok(planted);
    assert.deepEqual(pick(planted, 'id', 'parent', 'ring'), {
      id: 'planted-1',
      parent: 'flower-2',
      ring: 2,
    });
    assert.deepEqual(sown(bee, 3000, plot, []), planted);
    assert.notEqual(
      sown({ ...bee, legs: 5 }, 3000, plot, [])?.seed,
      planted.seed,
    );
  });

  it('spreads its plantings over the free slots rather than always the first', () => {
    const open: Plot = {
      room: Array.from({ length: 18 }, (_, ring) => ({
        flower: 'flower-2',
        ring,
      })),
    };
    const rings = new Set(
      Array.from(
        { length: 60 },
        (_, legs) => sown({ ...bee, legs }, 3000, open, [])?.ring,
      ),
    );
    assert.ok(rings.size >= 12, `only rings ${[...rings].join(', ')}`);
  });

  it('plants nothing without a pollination, before landing, or without room there', () => {
    const unpollinated = {
      ...bee,
      pollen: { ...pollinating, pollinates: false },
    };
    assert.equal(sown(unpollinated, 3000, plot, []), undefined);
    assert.equal(sown(bee, 999, plot, []), undefined);
    const elsewhere = { ...plot, room: [{ flower: 'flower-1', ring: 0 }] };
    assert.equal(sown(bee, 3000, elsewhere, []), undefined);
    const taken: Sown = {
      id: 'planted-1',
      seed: 1,
      parent: 'flower-2',
      ring: 2,
    };
    assert.equal(sown(bee, 3000, plot, [taken]), undefined);
  });

  it('plants however many flowers the meadow already holds, while the slot is offered', () => {
    const planted = Array.from(
      { length: 40 },
      (_, index): Sown => ({
        id: `planted-${String(index + 1)}`,
        seed: index,
        parent: 'flower-1',
        ring: index + 10,
      }),
    );
    assert.equal(sown(bee, 3000, plot, planted)?.id, 'planted-41');
  });
});
