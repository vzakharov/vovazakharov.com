import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  globalOf,
  hubAt,
  hubCount,
  hubOf,
  hubsAbove,
  portalCount,
  PORTALS,
  spokeCount,
  spokesOf,
} from './portal-counts';

const { first, last } = PORTALS;

const floors = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

describe('a floor’s portal counts', () => {
  it('none above the first floor or below the last', () => {
    for (const n of [1, first - 1, last + 1]) {
      assert.equal(portalCount(n), 0n);
      assert.equal(hubCount(n), 0n);
    }
  });

  it('one portal per 960 rooms, the first floor’s one included', () => {
    assert.deepEqual(
      floors(first, 10).map((n) => portalCount(n)),
      [1n, 4n, 17n, 68n, 273n],
    );
  });

  it('the first floor is all hubs, the last all spokes', () => {
    assert.equal(hubCount(first), portalCount(first));
    assert.equal(spokeCount(first), 0n);
    assert.equal(hubCount(last), 0n);
    assert.equal(spokeCount(last), portalCount(last));
  });

  it('about half are hubs on floors 8–64', () => {
    for (const n of floors(8, 64)) {
      const share = Number(hubCount(n)) / Number(portalCount(n));
      assert.ok(Math.abs(share - 0.5) < 0.03, `floor ${n}: ${share}`);
    }
  });

  it('counts the hubs above from the first floor down', () => {
    let above = 0n;
    for (const n of floors(first, last)) {
      assert.equal(hubsAbove(n), above, `floor ${n}`);
      above += hubCount(n);
    }
  });
});

describe('hubs and their spokes', () => {
  it('a hub’s global number names it, and back', () => {
    for (const n of floors(first, last - 1)) {
      for (const number of [0n, hubCount(n) / 2n, hubCount(n) - 1n]) {
        assert.deepEqual(hubAt(globalOf({ n, number })), { n, number });
      }
    }
    assert.throws(() => hubAt(hubsAbove(last)), RangeError);
  });

  it('every hub has a spoke on every floor below it', () => {
    for (const m of floors(first, last - 1)) {
      // The floor's last hub has the highest global number, so the fewest spokes.
      const hub = { n: m, number: hubCount(m) - 1n };
      for (const n of floors(m + 1, last)) {
        assert.ok(spokesOf(hub, n).count >= 1n, `hub of ${m} on floor ${n}`);
      }
    }
  });

  it('the first floor’s hub has 182 spokes in all', () => {
    const hub = { n: first, number: 0n };
    const counts = floors(first + 1, last).map((n) => spokesOf(hub, n).count);
    assert.equal(
      counts.reduce((sum, count) => sum + count, 0n),
      182n,
    );
  });

  it('a hub’s run of spokes on a floor is exactly the spokes leading to it', () => {
    for (const n of floors(first + 1, 10)) {
      const runs = new Map<bigint, bigint[]>();
      for (let spoke = 0n; spoke < spokeCount(n); spoke += 1n) {
        const global = globalOf(hubOf(n, spoke));
        runs.set(global, [...(runs.get(global) ?? []), spoke]);
      }
      for (let global = 0n; global < hubsAbove(n); global += 1n) {
        const { first: start, step, count } = spokesOf(hubAt(global), n);
        const run = Array.from(
          { length: Number(count) },
          (_, i) => start + BigInt(i) * step,
        );
        assert.deepEqual(run, runs.get(global), `floor ${n}, hub ${global}`);
      }
    }
  });
});
