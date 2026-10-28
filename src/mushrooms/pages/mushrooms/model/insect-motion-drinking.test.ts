import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '@/mushrooms/shared/lib/geometry';
import {
  carriedFrom,
  drinkDip,
  FLIGHT_HABITS,
  wingBeat,
} from '@/mushrooms/entities/insect/index.node-safe';
import {
  drinking,
  hopAt,
  proboscis,
} from '@/mushrooms/entities/insect/index.test-only';

import {
  type Flown,
  kind,
  PATH,
  PHASES,
  swing,
  times,
} from './insect-motion.test-kit';

const DRUNK_AT = { kind: 'flower', id: 'flower-4' } as const;
const FLOWER: Flown = { ...PATH, to: DRUNK_AT };

/** The largest change in `value` from one ms to the next between `from` and `to`. */
function largestStep(
  value: (now: number) => number,
  from: number,
  to: number,
): number {
  return Math.max(
    ...times(from, to, 1).map((now) => Math.abs(value(now + 1) - value(now))),
  );
}

describe('drinking and proboscis', () => {
  it('drinks at a flower, from after landing until just before leaving', () => {
    assert.equal(drinking(FLOWER, FLOWER.arrives), 0);
    assert.equal(proboscis(FLOWER, FLOWER.arrives - 500), 0);
    assert.equal(drinking(FLOWER, 5000), 1);
    assert.ok(proboscis(FLOWER, 5000) > 0.8);
    assert.equal(drinking(FLOWER, FLOWER.leaves), 0);
    assert.equal(proboscis(FLOWER, FLOWER.leaves + 100), 0);
    const step = largestStep((now) => proboscis(FLOWER, now), 0, 9000);
    assert.ok(step < 0.01, `step ${String(step)}`);
  });

  it('never drinks on a cap, whose rest is the slow open and close', () => {
    for (const now of times(0, 9000, 7)) {
      assert.equal(drinking(PATH, now), 0);
      const rest =
        1 - 0.7 * (0.5 - 0.5 * Math.cos((Math.PI * 2 * now) / 2600 + 1));
      const settled = now > PATH.arrives + 500;
      if (settled) assert.equal(wingBeat(PATH, now, { phase: 1, kind }), rest);
    }
  });

  it('holds its wings half shut while drinking', () => {
    const drinkSwing = times(5000, 7000, 5).map((now) =>
      wingBeat(FLOWER, now, { phase: 0, kind }),
    );
    assert.ok(Math.max(...drinkSwing) <= 0.6 + 1e-9);
    assert.ok(swing(5000, 7600) > 0.6);
  });

  it('curls up without a jump when a drink is cut short', () => {
    const cut = 5000;
    const after: Flown = {
      ...PATH,
      ...carriedFrom(FLOWER, cut),
      departs: cut,
      arrives: cut + 2000,
      leaves: cut + 8000,
    };
    const reach = (now: number) =>
      now < cut ? proboscis(FLOWER, now) : proboscis(after, now);
    assert.equal(after.drink, 1);
    assert.ok(largestStep(reach, cut - 50, cut + 600) < 0.01);
    assert.equal(reach(cut + 500), 0);
    const wings = (now: number) =>
      wingBeat(now < cut ? FLOWER : after, now, { phase: 0, kind });
    assert.ok(largestStep(wings, cut - 50, cut + 50) < 0.05);
  });
});

describe('drinkDip', () => {
  const hop = { ...FLOWER, from: { kind: 'flower', id: 'flower-9' } } as const;
  const next = {
    ...hop,
    from: DRUNK_AT,
    to: { kind: 'cap', id: 'cap' },
    departs: hop.leaves,
    arrives: hop.leaves + 2000,
    leaves: hop.leaves + 9000,
  } as const;
  const dipAt = (now: number) =>
    (now < next.departs ? drinkDip(hop, now) : drinkDip(next, now))?.dip ?? 0;

  it('leaves the flower alone while no butterfly is on it', () => {
    assert.equal(drinkDip({ ...PATH, from: PATH.to }, 5000), undefined);
    assert.equal(drinkDip(next, next.departs + 1200), undefined);
  });

  it('sags under the butterfly while it drinks, and springs back as it leaves', () => {
    assert.equal(drinkDip(hop, hop.arrives)?.dip, 0);
    assert.equal(drinkDip(hop, 5000)?.id, DRUNK_AT.id);
    assert.ok(Math.abs((drinkDip(hop, 5000)?.dip ?? 0) - 0.18) < 1e-3);
    assert.equal(drinkDip(next, next.departs)?.id, DRUNK_AT.id);
    assert.ok((drinkDip(next, next.departs + 220)?.dip ?? 0) < 0);
    assert.ok(largestStep(dipAt, hop.arrives - 50, next.departs + 1300) < 0.01);
  });

  it('flickers its petals as the butterfly leaves, and only then', () => {
    assert.equal(drinkDip(hop, 5000)?.flicker, 0);
    assert.equal(drinkDip(next, next.departs)?.flicker, 0);
    const flicker = (now: number) => drinkDip(next, now)?.flicker ?? 0;
    const most = Math.max(
      ...times(next.departs, next.departs + 300, 5).map((now) => flicker(now)),
    );
    assert.ok(most > 0.05);
    assert.ok(largestStep(flicker, next.departs, next.departs + 1300) < 0.01);
  });
});

/** How far `point` stands off the origin. */
const far = ({ x, y }: Point) => Math.hypot(x, y);

describe('hopAt', () => {
  const hops = FLIGHT_HABITS.fly.hopping;
  const span = { departs: 0, arrives: 1000, hops };
  const off = (phase: number) => (now: number) => hopAt(span, now, phase);

  it('stays on its spot until it arrives, and on a leg with no hops', () => {
    for (const phase of PHASES) {
      assert.deepEqual(off(phase)(span.arrives), { x: 0, y: 0 });
      assert.deepEqual(hopAt({ departs: 0, arrives: 1000 }, 3000, phase), {
        x: 0,
        y: 0,
      });
    }
  });

  it('hops within its reach without a jump, the same every time it is asked', () => {
    for (const phase of PHASES) {
      const at = off(phase);
      for (const now of times(span.arrives, span.arrives + 8000, 1)) {
        const [here, next] = [at(now), at(now + 1)];
        assert.ok(far(here) <= hops.range + 1e-9);
        // A whole hop across its reach, at the steepest of its jerk.
        const step = Math.hypot(next.x - here.x, next.y - here.y);
        assert.ok(step < (2 * hops.range * 1.5) / 70 + 1e-9);
      }
      assert.deepEqual(at(4321), off(phase)(4321));
    }
  });

  it('never hangs still for long: it jerks somewhere new every round or two', () => {
    for (const phase of PHASES) {
      const at = off(phase);
      for (const from of times(span.arrives, span.arrives + 8000, 50)) {
        const moved = times(from, from + 2 * hops.every, 10).some(
          (now) =>
            far({ x: at(now).x - at(from).x, y: at(now).y - at(from).y }) >
            0.05,
        );
        assert.ok(moved, String(from));
      }
    }
  });
});
