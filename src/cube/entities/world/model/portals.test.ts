import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { wallsOf } from './doorways.test-kit';
import { maze } from './maze';
import {
  hubCount,
  hubOf,
  portalCount,
  PORTALS,
  spokeCount,
} from './portal-counts';
import {
  type Portal,
  portalAt,
  portalNumbered,
  portalsOf,
  portalTarget,
} from './portals';
import { isRoom } from './room';

const SEEDS = ['1', '8675309', '42'];
const { first, last, periodMs } = PORTALS;

/** A clock reading inside period `epoch`. */
const during = (epoch: number): number => epoch * periodMs + 1234;

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
    for (let epoch = 0; epoch < 50; epoch += 1) {
      assert.deepEqual(
        portalTarget(a, hub, 1, during(epoch)),
        portalTarget(b, hub, 1, during(epoch)),
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
          for (let epoch = 0; epoch < 40; epoch += 1) {
            const { portal: spoke } = portalTarget(
              rolled,
              hub,
              1,
              during(epoch),
            );
            assert.ok(!spoke.isHub && spoke.wall.n > n);
            assert.ok(spoke.number < portalCount(spoke.wall.n));
            assert.deepEqual(portalTarget(rolled, spoke, 1, 0).portal, hub);
          }
        }
      }
    });
  }

  it('a hub holds its target for a minute, every hub turning on the same tick', () => {
    const rolled = maze('1');
    const hubs = [0n, 1n, 2n, 3n].map((k) => portalNumbered(rolled, 12, k));
    const at = (ms: number) =>
      hubs.map((hub) => portalTarget(rolled, hub, 1, ms).portal);
    assert.deepEqual(at(7 * periodMs), at(8 * periodMs - 1));
    const turned = Array.from({ length: 20 }, (_, i) => i).filter((epoch) => {
      const [before, after] = [at(during(epoch)), at(during(epoch + 1))];
      return before.some((p, i) => p.wall.n !== after[i]?.wall.n);
    });
    assert.ok(turned.length > 10, `turned in ${turned.length} of 20 minutes`);
  });

  it('a floor-20 hub leads one floor down three times in four', () => {
    const rolled = maze('8675309');
    const hub = portalNumbered(rolled, 20, 0n);
    const drops = new Map<number, number>();
    const epochs = 2000;
    for (let epoch = 0; epoch < epochs; epoch += 1) {
      const drop =
        portalTarget(rolled, hub, 1, during(epoch)).portal.wall.n - 20;
      drops.set(drop, (drops.get(drop) ?? 0) + 1);
    }
    const share = (drop: number) => (drops.get(drop) ?? 0) / epochs;
    assert.ok(Math.abs(share(1) - 0.75) < 0.03, `one down: ${share(1)}`);
    assert.ok(Math.abs(share(2) - 0.1875) < 0.03, `two down: ${share(2)}`);
    assert.ok(Math.min(...drops.keys()) === 1);
  });

  it('a hub’s spokes on a floor all turn up in time', () => {
    const rolled = maze('1');
    const [hub] = portalsOf(rolled, first);
    assert.ok(hub);
    const seen = new Set<bigint>();
    for (let epoch = 0; epoch < 400; epoch += 1) {
      const { wall, number } = portalTarget(
        rolled,
        hub,
        1,
        during(epoch),
      ).portal;
      if (wall.n === first + 1) seen.add(number);
    }
    // Floor 7's spokes all lead to the one hub above them.
    assert.equal(BigInt(seen.size), spokeCount(first + 1));
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
