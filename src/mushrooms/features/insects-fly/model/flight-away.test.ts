import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mulberry32 } from '@/mushrooms/shared/lib/random';
import { CLUMP_DISTANCE } from '@/mushrooms/shared/space';
import {
  apartOf,
  FLIGHT_HABITS,
  INSECT_KINDS,
  type InsectKind,
  isLeaving,
  legTo,
  type Perch,
  perchName,
} from '@/mushrooms/entities/insect/index.node-safe';

import { firstFlight, flightAway } from './flight';
import { kind, PERCHES, SEEDS, within } from './flight.test-kit';

/** A place `x` sizes across, at the clump's distance. */
const across = (x: number) => ({ x, y: 0, fromEye: CLUMP_DISTANCE });

describe('flightAway', () => {
  it('leaves off screen from its perch, and is gone as it arrives', () => {
    const first = firstFlight({ seed: 3, kind }, PERCHES, 0);
    const away = flightAway({ seed: 3, kind, ...first }, 500);
    assert.ok(isLeaving(away));
    assert.ok(!isLeaving(first));
    assert.deepEqual(away.leg.from, first.leg.to);
    assert.equal(away.leg.departs, 500);
    assert.equal(away.leg.leaves, away.leg.arrives);
    assert.equal(away.legs, 2);
  });

  it('is timed from where it flies when it sets off mid-flight, not from the perch it was heading to', () => {
    const fly = 'fly' as const;
    const [from, to] = [
      { kind: 'cap', id: 'mushroom-1' } as const,
      { kind: 'cap', id: 'mushroom-2' } as const,
    ];
    const leg = {
      ...legTo(mulberry32(1), FLIGHT_HABITS[fly], { from, to }, { now: 0 }),
      departs: 0,
      arrives: 1000,
    };
    const places = {
      [perchName(from)]: across(0),
      [perchName(to)]: across(100),
      'away left': across(-5),
      'away right': across(-5),
    };
    const insect = { seed: 3, kind: fly, leg, legs: 1 };
    const away = flightAway(insect, 100, { places }).leg;
    const atCruise = (1000 * 15) / FLIGHT_HABITS[fly].cruising;
    const flown = away.arrives - away.departs;
    assert.ok(
      flown < atCruise * 1.01,
      `took ${String(flown)} ms, its 15 sizes at cruise ${String(atCruise)}`,
    );
  });
});

/**
 * Both edges `apart` butterfly sizes across the layout from the perch `to`,
 * the perch `q` from the eye and the edges `edge` (`Place`).
 */
const placesAt = (to: Perch, apart: number, q: number, edge: number) => {
  const far = { x: apart, y: 0, fromEye: edge };
  return {
    [perchName(to)]: { x: 0, y: 0, fromEye: q },
    'away left': far,
    'away right': far,
  };
};

/**
 * `kinded`'s leg out to the edges `apart` butterfly sizes away, seeded
 * `seed`, from a perch `q` from the eye to edges `edge` from it; both at
 * the clump's distance, where the layout draws an insect its own size,
 * unless given.
 */
const legOver = (
  kinded: InsectKind,
  apart: number,
  seed = 3,
  q = CLUMP_DISTANCE,
  edge = q,
) => {
  const first = firstFlight({ seed, kind: kinded }, PERCHES, 0);
  const places = placesAt(first.leg.to, apart, q, edge);
  const insect = { seed, kind: kinded, ...first };
  return flightAway(insect, 0, { places }).leg;
};

/** How far apart the edges stand in `legOver`'s legs, in butterfly sizes: from a hop to past any screen's world. */
const APARTS = [0.2, 1, 3, 6, 11, 25, 45, 120];

describe('a flight across the screen', () => {
  it('takes its length at its cruise, however long, never quicker than its flying time, every kind', () => {
    for (const kinded of INSECT_KINDS) {
      const { flying, cruising: cruise } = FLIGHT_HABITS[kinded];
      for (const apart of APARTS) {
        const atCruise = (1000 * apart) / cruise;
        for (const seed of SEEDS.slice(0, 20)) {
          const { departs, arrives } = legOver(kinded, apart, seed);
          const taken = arrives - departs;
          const at = `${kinded} over ${String(apart)} takes ${String(taken)}`;
          if (atCruise >= flying[1]) {
            assert.ok(Math.abs(taken - atCruise) < 1e-9 * atCruise, at);
          } else {
            assert.ok(
              within(taken, [Math.max(flying[0], atCruise), flying[1]]),
              at,
            );
          }
        }
      }
    }
  });

  it('takes twice as long over twice the way, past its flying time, every kind', () => {
    for (const kinded of INSECT_KINDS) {
      const { flying, cruising: cruise } = FLIGHT_HABITS[kinded];
      const least = (flying[1] * cruise) / 1000;
      for (const apart of [least, 2 * least, 11, 25]) {
        for (const seed of SEEDS.slice(0, 20)) {
          const once = legOver(kinded, apart, seed);
          const twice = legOver(kinded, 2 * apart, seed);
          const ratio =
            (twice.arrives - twice.departs) / (once.arrives - once.departs);
          assert.ok(Math.abs(ratio - 2) < 1e-9, `${kinded} ${String(apart)}`);
        }
      }
    }
  });

  it('darts the same share of every flight whatever its length, for a kind that dashes', () => {
    for (const kinded of INSECT_KINDS) {
      const { dashing } = FLIGHT_HABITS[kinded];
      for (const apart of APARTS) {
        assert.deepEqual(legOver(kinded, apart).dash, dashing, kinded);
      }
    }
  });

  it('flies to away at its cruise as drawn level with where it sets off, whatever depth its away spot stands at, every kind', () => {
    // The perches' distances from the opening eye run 0.9 to 1.5 of the clump's.
    const depths = [0.9, 1, 1.2, 1.5].map((share) => share * CLUMP_DISTANCE);
    const apart = 60;
    for (const kinded of INSECT_KINDS) {
      const { cruising: cruise } = FLIGHT_HABITS[kinded];
      for (const q of depths) {
        for (const edge of depths) {
          // Drawn `CLUMP_DISTANCE / q` its size the whole way.
          const seen = (apart * q) / CLUMP_DISTANCE;
          const { departs, arrives } = legOver(kinded, apart, 3, q, edge);
          const share = seen / ((arrives - departs) / 1000) / cruise;
          const at = `${kinded} from ${q.toFixed(1)}, edge ${edge.toFixed(1)}: ${share.toFixed(4)}`;
          assert.ok(Math.abs(share - 1) < 1e-6, at);
        }
      }
    }
  });

  it('times a way between two depths a little over its mean, as a straight way across the ground rows is drawn', () => {
    const depths = [0.9, 1, 1.2, 1.5].map((share) => share * CLUMP_DISTANCE);
    const [apart, steps] = [60, 1000];
    for (const q of depths) {
      for (const edge of depths) {
        let seen = 0;
        for (let step = 0; step < steps; step++) {
          const t = (step + 0.5) / steps;
          seen += apart / steps / ((1 - t) / q + t / edge) / CLUMP_DISTANCE;
        }
        const timed = apartOf(
          { x: 0, y: 0, fromEye: q },
          { x: apart, y: 0, fromEye: edge },
        );
        const share = seen / timed;
        const at = `${q.toFixed(1)} to ${edge.toFixed(1)}: ${share.toFixed(4)}`;
        if (q === edge) assert.ok(Math.abs(share - 1) < 1e-6, at);
        else assert.ok(share > 0.97 && share < 1, at);
      }
    }
  });

  it('takes its flying time where it has no length to go by', () => {
    for (const kinded of INSECT_KINDS) {
      const first = firstFlight({ seed: 3, kind: kinded }, PERCHES, 0);
      const { departs, arrives, dash } = first.leg;
      assert.ok(within(arrives - departs, FLIGHT_HABITS[kinded].flying));
      assert.equal(dash, undefined, kinded);
    }
  });
});
