import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  climbBand,
  hubCount,
  hubOf,
  jumpWeight,
  portalCount,
  PORTALS,
  spokeCount,
  spokesOf,
} from './portal-counts';

const { first, last } = PORTALS;

const floors = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

const shareOf = (n: number): number =>
  Number(hubCount(n)) / Number(portalCount(n));

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

  it('the first floor is all hubs, the last all spokes, and every other holds both', () => {
    assert.equal(hubCount(first), portalCount(first));
    assert.equal(spokeCount(first), 0n);
    assert.equal(hubCount(last), 0n);
    assert.equal(spokeCount(last), portalCount(last));
    for (const n of floors(first + 1, last - 1)) {
      assert.ok(hubCount(n) >= 1n && spokeCount(n) >= 1n, `floor ${n}`);
    }
  });

  // The figures of the simulations artifact's model, «Вовин-2», no landings.
  it('holds the model’s hubs: one on floor 7, then 3, 14, 72', () => {
    assert.deepEqual(
      floors(7, 10).map((n) => hubCount(n)),
      [1n, 3n, 14n, 72n],
    );
  });

  it('about half are hubs mid-cube, and the floors above the bottom are nearly all spokes', () => {
    assert.ok(Math.abs(shareOf(30) - 0.49) < 0.01, `floor 30: ${shareOf(30)}`);
    assert.ok(Math.abs(shareOf(64) - 0.08) < 0.005, `floor 64: ${shareOf(64)}`);
    assert.ok(
      Math.abs(shareOf(65) - 0.0089) < 0.0005,
      `floor 65: ${shareOf(65)}`,
    );
  });
});

/** A jump of `d` floors' chance among every jump the building has room for. */
function share(d: number): number {
  let total = 0n;
  for (let k = 1; k <= last - first; k += 1) total += jumpWeight(k);
  return Number(jumpWeight(d)) / Number(total);
}

const ratio = (a: number, b: number): number =>
  Number(jumpWeight(a)) / Number(jumpWeight(b));

describe('the law of a jump', () => {
  it('peaks at multiples of 7, each further one four times rarer', () => {
    assert.ok(Math.abs(share(7) - 0.2892) < 1e-4);
    assert.ok(Math.abs(share(14) - 0.0733) < 1e-4);
    assert.ok(Math.abs(share(1) - 0.0022) < 1e-4);
  });

  it('weighs a floor off the peak 2.25 times less, either side', () => {
    assert.ok(Math.abs(ratio(7, 6) - 2.25) < 0.01);
    assert.ok(Math.abs(ratio(7, 8) - 2.25) < 0.01);
  });

  it('is nothing outside the building', () => {
    assert.equal(jumpWeight(0), 0n);
    assert.equal(jumpWeight(last - first + 1), 0n);
  });
});

describe('spoke bands', () => {
  it('add up to every floor’s spokes, a band per floor above', () => {
    for (const n of floors(first + 1, last)) {
      let total = 0n;
      for (let d = 1; d <= n - first; d += 1) total += climbBand(n, d);
      assert.equal(total, spokeCount(n), `floor ${n}`);
      assert.equal(climbBand(n, n - first + 1), 0n);
    }
  });

  it('follow the law: the bottom’s climb of 7 takes its share of the bottom’s spokes', () => {
    const climb = Number(climbBand(last, 7)) / Number(spokeCount(last));
    assert.ok(Math.abs(climb - share(7)) < 1e-3, `${climb}`);
  });
});

describe('hubs and their spokes', () => {
  it('every hub has a spoke on some floor below it', () => {
    for (const m of floors(first, last - 1)) {
      // The floor's last hub has the highest number, so the fewest spokes.
      const hub = { n: m, number: hubCount(m) - 1n };
      const landings = floors(m + 1, last).filter(
        (n) => spokesOf(hub, n).count > 0n,
      );
      assert.ok(landings.length > 0, `the last hub of floor ${m}`);
    }
  });

  it('a hub’s run of spokes on a floor is exactly the spokes leading to it', () => {
    for (const n of floors(first + 1, 10)) {
      const runs = new Map<string, bigint[]>();
      for (let spoke = 0n; spoke < spokeCount(n); spoke += 1n) {
        const { n: m, number } = hubOf(n, spoke);
        assert.ok(number < hubCount(m), `floor ${n}, spoke ${spoke}`);
        const key = `${m}/${number}`;
        runs.set(key, [...(runs.get(key) ?? []), spoke]);
      }
      for (const m of floors(first, n - 1)) {
        for (let number = 0n; number < hubCount(m); number += 1n) {
          const { first: start, step, count } = spokesOf({ n: m, number }, n);
          const run = Array.from(
            { length: Number(count) },
            (_, i) => start + BigInt(i) * step,
          );
          assert.deepEqual(
            run,
            runs.get(`${m}/${number}`) ?? [],
            `${m}/${number}`,
          );
        }
      }
    }
  });

  it('no spoke past a floor’s last', () => {
    assert.throws(() => hubOf(9, spokeCount(9)), RangeError);
  });
});
