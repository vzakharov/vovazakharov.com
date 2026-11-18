import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { wallsOf } from './doorways.test-kit';
import { maze } from './maze';
import {
  hubCount,
  hubOf,
  jumpWeight,
  portalCount,
  PORTALS,
} from './portal-counts';
import { type Tick, ticksFrom } from './portal-tempo';
import {
  type Portal,
  portalAt,
  portalNumbered,
  portalsOf,
  portalTarget,
} from './portals';
import { isRoom } from './room';

const SEEDS = ['1', '8675309', '42'];
const { first, last, tempo } = PORTALS;
const { cycleMs, ticks: perCycle } = tempo;

/** A clock reading inside cycle `cycle`. */
const during = (cycle: number): number => cycle * cycleMs + 1234;

/**
 * How far floor 20's hub 0 drops at an instant: it has a spoke on every
 * floor below, so it rolls the law unlimited.
 */
const floor20 = () => {
  const rolled = maze('8675309');
  const hub = portalNumbered(rolled, 20, 0n);
  return (ms: number) => portalTarget(rolled, hub, 1, ms).portal.wall.n - 20;
};

/** The first `count` ticks from the epoch. */
const ticksOf = (count: number): Tick[] => {
  const from = ticksFrom(0);
  return Array.from({ length: count }, () => from.next().value);
};

describe('the portals of a floor', () => {
  for (const seed of SEEDS) {
    for (let n: number = first; n <= 8; n += 1) {
      it(`seed ${seed}, floor ${n}: each stands on a plain wall of its own`, () => {
        const rolled = maze(seed);
        const listed = portalsOf(rolled, n);
        assert.equal(BigInt(listed.length), portalCount(n));
        const found: Portal[] = [];
        for (const { kind, across, x, y } of wallsOf(rolled, n)) {
          const portal = portalAt(rolled, {
            n,
            x,
            y,
            isEast: across === 'east',
          });
          if (portal === null) continue;
          assert.equal(kind, 'wall', `portal ${portal.number}`);
          found.push(portal);
        }
        const byNumber = (a: Portal, b: Portal) => Number(a.number - b.number);
        assert.deepEqual(found.toSorted(byNumber), listed);
        for (const [index, { number, isHub }] of listed.entries()) {
          assert.equal(number, BigInt(index));
          assert.equal(isHub, number < hubCount(n));
        }
      });
    }
  }

  it('none off the floors that hold them, or on the outer boundary', () => {
    const rolled = maze('1');
    assert.equal(portalAt(rolled, { n: 5, x: 3n, y: 3n, isEast: true }), null);
    assert.equal(portalAt(rolled, { n: 6, x: 31n, y: 3n, isEast: true }), null);
    assert.equal(
      portalAt(rolled, { n: 6, x: 3n, y: -1n, isEast: false }),
      null,
    );
    assert.deepEqual(portalsOf(rolled, 5), []);
    assert.throws(() => portalsOf(rolled, 30), RangeError);
    assert.throws(() => portalNumbered(rolled, 6, 1n), RangeError);
  });

  it('a deep portal is found again from its wall', () => {
    const rolled = maze('20261114');
    for (const n of [20, 40, 65, last]) {
      const count = portalCount(n);
      for (const number of [0n, count / 3n, count - 1n]) {
        const portal = portalNumbered(rolled, n, number);
        assert.deepEqual(portalAt(rolled, portal.wall), portal);
      }
    }
  });

  it('the same in a world rolled afresh', () => {
    const [a, b] = [maze('42'), maze('42')];
    assert.deepEqual(portalsOf(a, 9), portalsOf(b, 9));
    const hub = portalNumbered(a, 20, 5n);
    for (const { startMs } of ticksOf(50)) {
      assert.deepEqual(
        portalTarget(a, hub, 1, startMs),
        portalTarget(b, hub, 1, startMs),
      );
    }
  });
});

describe('where a portal leads', () => {
  for (const seed of SEEDS) {
    it(`seed ${seed}: a spoke leads up to its hub, at any time`, () => {
      const rolled = maze(seed);
      for (let n = first + 1; n <= 9; n += 1) {
        for (const spoke of portalsOf(rolled, n).filter((p) => !p.isHub)) {
          const { portal: hub } = portalTarget(rolled, spoke, 1, 0);
          assert.ok(hub.isHub && hub.wall.n < n);
          const { n: m, number } = hubOf(n, spoke.number - hubCount(n));
          assert.deepEqual(hub, portalNumbered(rolled, m, number));
          assert.deepEqual(
            portalTarget(rolled, spoke, 1, during(977)).portal,
            hub,
          );
        }
      }
    });

    it(`seed ${seed}: a hub leads down to a spoke of its own`, () => {
      const rolled = maze(seed);
      for (let n: number = first; n <= 8; n += 1) {
        for (const hub of portalsOf(rolled, n).filter((p) => p.isHub)) {
          for (const { startMs } of ticksOf(40)) {
            const { portal: spoke } = portalTarget(rolled, hub, 1, startMs);
            assert.ok(!spoke.isHub && spoke.wall.n > n);
            assert.ok(spoke.number < portalCount(spoke.wall.n));
            assert.deepEqual(portalTarget(rolled, spoke, 1, 0).portal, hub);
          }
        }
      }
    });
  }

  it('a hub holds its target through a tick, every hub turning on the same ticks', () => {
    const rolled = maze('1');
    const hubs = [0n, 1n, 2n, 3n].map((k) => portalNumbered(rolled, 12, k));
    const at = (ms: number) =>
      hubs.map((hub) => portalTarget(rolled, hub, 1, ms).portal);
    const ticks = ticksOf(40);
    for (const { startMs, endMs } of ticks) {
      assert.deepEqual(at(startMs), at(endMs - 1));
    }
    const turned = ticks.filter(({ endMs }) => {
      const [before, after] = [at(endMs - 1), at(endMs)];
      return before.some((p, i) => p.number !== after[i]?.number);
    });
    assert.ok(turned.length > 30, `turned on ${turned.length} of 40 ticks`);
  });

  it('a floor-20 hub drops 7 floors most often, 14 a quarter as often, 1 almost never', () => {
    const dropAt = floor20();
    const drops = new Map<number, number>();
    const samples = 4000;
    // A step coprime to the cycle, so the instants fall evenly across it.
    for (let i = 0; i < samples; i += 1) {
      const drop = dropAt(i * 1237);
      drops.set(drop, (drops.get(drop) ?? 0) + 1);
    }
    const share = (drop: number) => (drops.get(drop) ?? 0) / samples;
    // The model's law over the 46 floors below 20.
    assert.ok(Math.abs(share(7) - 0.2893) < 0.025, `seven: ${share(7)}`);
    assert.ok(Math.abs(share(6) - 0.1286) < 0.02, `six: ${share(6)}`);
    assert.ok(Math.abs(share(14) - 0.0733) < 0.015, `fourteen: ${share(14)}`);
    assert.ok(share(1) < 0.01, `one: ${share(1)}`);
  });

  it('a floor-20 hub drops 7 or 8 on its slowest tick, and a rare drop only in the flicker', () => {
    const dropAt = floor20();
    const ticks = ticksOf(perCycle * 300);
    const slowest = Math.max(
      ...ticks.map(({ startMs, endMs }) => endMs - startMs),
    );
    // Under 1% of the law over the 46 floors below 20.
    const drops = Array.from({ length: last - 20 }, (_, i) => i + 1);
    const total = drops.reduce((sum, d) => sum + jumpWeight(d), 0n);
    const isRare = (d: number) => 100n * jumpWeight(d) < total;
    for (const { startMs, endMs } of ticks) {
      const [hold, drop] = [endMs - startMs, dropAt(startMs)];
      if (hold === slowest)
        assert.ok(drop === 7 || drop === 8, `slow: ${drop}`);
      if (hold > 300) assert.ok(!isRare(drop), `held ${hold} ms: ${drop}`);
    }
  });

  it('steps into the room beyond the far wall, and back into the one left', () => {
    const rolled = maze('42');
    for (const hub of portalsOf(rolled, 8).filter((p) => p.isHub)) {
      for (const toward of [1, -1] as const) {
        const ms = during(3);
        const { portal: far, room } = portalTarget(rolled, hub, toward, ms);
        assert.ok(isRoom(room.n, room.x, room.y));
        assert.equal(room.n, far.wall.n);
        const back = portalTarget(rolled, far, toward === 1 ? -1 : 1, ms);
        assert.deepEqual(back.portal, hub);
        const { isEast, ...near } = hub.wall;
        const beyond = isEast
          ? { ...near, x: near.x + 1n }
          : { ...near, y: near.y + 1n };
        assert.deepEqual(back.room, toward === 1 ? near : beyond);
      }
    }
  });
});

describe('a deep floor’s portals', () => {
  it('answer in under a few milliseconds each, cold', () => {
    const rolled = maze('20261114');
    const count = portalCount(last - 1);
    const probes = 100;
    const start = performance.now();
    for (let i = 1; i <= probes; i += 1) {
      const portal = portalNumbered(
        rolled,
        last - 1,
        (count * BigInt(i)) / 101n,
      );
      const { portal: far } = portalTarget(rolled, portal, 1, during(i));
      assert.equal(far.isHub, !portal.isHub);
    }
    const ms = (performance.now() - start) / probes;
    assert.ok(ms < 20, `${ms} ms a portal and its target`);
  });
});
