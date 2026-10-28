import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '@/mushrooms/shared/lib/geometry';
import {
  carriedFrom,
  type Flight,
  flightPoint,
  LANDING,
  landingBob,
  wingBeat,
} from '@/mushrooms/entities/insect/index.node-safe';
import {
  firstFlight,
  ticked,
} from '@/mushrooms/features/insects-fly/index.node-safe';
import { flightAway } from '@/mushrooms/features/insects-fly/index.test-only';

import {
  type Flown,
  kind,
  PATH,
  PHASES,
  swing,
  times,
} from './insect-motion.test-kit';

/** No spotted caps, and nowhere to plant: what the butterfly's legs never read. */
const BARE = { spotted: [], room: [] } as const;

const flier = (phase: number) => ({ phase, flutter: 12, kind });

describe('wingBeat', () => {
  const all = times(0, 8000, 7);

  it('stays between closed and open', () => {
    for (const phase of PHASES) {
      for (const now of all) {
        const open = wingBeat(PATH, now, { phase, kind });
        assert.ok(open >= 0 && open <= 1, `open ${String(open)}`);
      }
    }
  });

  it('beats fast in the air and slowly at rest', () => {
    assert.ok(swing(2000, 2200) > 0.9);
    assert.ok(swing(5000, 5200) < 0.3);
  });

  it('never jumps, at take-off, at landing or between', () => {
    for (const phase of PHASES) {
      for (const now of times(PATH.departs - 300, PATH.arrives + 700, 1)) {
        const step = Math.abs(
          wingBeat(PATH, now + 1, { phase, kind }) -
            wingBeat(PATH, now, { phase, kind }),
        );
        assert.ok(step < 0.05, `step ${String(step)} at ${String(now)}`);
      }
    }
  });
});

describe('landingBob', () => {
  it('dips after landing and is 0 before and after, without a jump', () => {
    assert.equal(landingBob(PATH, PATH.arrives - 1), 0);
    assert.equal(landingBob(PATH, PATH.arrives), 0);
    assert.ok(landingBob(PATH, PATH.arrives + LANDING / 4) > 0);
    assert.equal(landingBob(PATH, PATH.arrives + LANDING), 0);
    for (const now of times(
      PATH.arrives - 50,
      PATH.arrives + LANDING + 50,
      1,
    )) {
      const step = Math.abs(landingBob(PATH, now + 1) - landingBob(PATH, now));
      assert.ok(step < 0.01);
    }
  });
});

/** A flight on `before` cut short at `cut` by `after`, as the view flies it. */
type Cut = { before: Flown; after: Flown; cut: number };

function pointAt({ before, after, cut }: Cut, now: number): Point {
  return flightPoint(now < cut ? before : after, now, flier(0));
}

function wingsAt({ before, after, cut }: Cut, now: number): number {
  return wingBeat(now < cut ? before : after, now, { phase: 0, kind });
}

function stepAt(flight: Cut, now: number, frame: number): number {
  const [here, next] = [pointAt(flight, now), pointAt(flight, now + frame)];
  return Math.hypot(next.x - here.x, next.y - here.y);
}

describe('a leg that cuts a flight short', () => {
  const butterfly = { id: 'b', kind: 'butterfly', seed: 4321 } as const;
  const first = firstFlight(
    butterfly,
    { caps: ['cap'], flowers: [], air: [], crowded: [], ...BARE },
    0,
  );
  const cut = (first.leg.departs + first.leg.arrives) / 2;
  const before: Flown = {
    ...first.leg,
    launch: 0,
    speed: 0,
    drink: 0,
    start: { x: -40, y: 300 },
    end: { x: 200, y: 520 },
  };
  const cuts: Record<string, Flight> = {
    'sent away mid-flight': flightAway({ ...butterfly, ...first }, cut),
    'its cap gone mid-flight':
      ticked(
        { insects: [{ ...butterfly, ...first }], planted: [] },
        { caps: ['other'], flowers: [], air: [], crowded: [], ...BARE },
        cut,
      ).insects[0] ?? first,
  };

  for (const [name, { leg }] of Object.entries(cuts)) {
    const after: Flown = {
      ...leg,
      ...carriedFrom(before, cut),
      start: flightPoint(before, cut, flier(0)),
      end: { x: 480, y: 200 },
    };
    const flight = { before, after, cut };

    it(`flies on without a jump when ${name}`, () => {
      assert.equal(leg.departs, cut);
      assert.equal(after.launch, 1);
      assert.equal(after.speed, 1);
      for (const now of times(cut - 5, cut + 5, 1)) {
        assert.ok(stepAt(flight, now, 1) < 1);
        assert.ok(
          Math.abs(wingsAt(flight, now + 1) - wingsAt(flight, now)) < 0.05,
        );
      }
    });

    it(`does not stop dead when ${name}`, () => {
      assert.ok(stepAt(flight, cut, 16) > stepAt(flight, cut - 16, 16) / 4);
      assert.ok(swing(cut, cut + 200, after) > 0.9);
    });
  }
});
