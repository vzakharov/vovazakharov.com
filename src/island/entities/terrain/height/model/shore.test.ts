import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  approach,
  DUNE_METRES,
  DUNE_SPACING_METRES,
  duneAt,
  LOWLAND_METRES,
  LOWLAND_REACH_METRES,
  lowlandFloor,
  restingGround,
} from './shore';

/** A seeded stream in `[0, 1)`. */
function stream(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 2 ** 32;
  };
}

/** How far the octaves under the broad relief reach, for these tests. */
const FINE = 60;

describe('lowlandFloor', () => {
  it('follows the broad relief metre for metre where it stands over the lowland', () => {
    for (const d of [300, 600, 1500]) {
      assert.equal(
        lowlandFloor(d, 310, FINE) - lowlandFloor(d, 300, FINE),
        10,
        `at ${d} m inland`,
      );
    }
  });

  it('stays above the sea inland, however low the broad relief', () => {
    for (const d of [1, 50, 600, 5000, 50_000]) {
      for (const broad of [-500, -10, 0, 3]) {
        assert.ok(
          lowlandFloor(d, broad, FINE) > 0,
          `${broad} m at ${d} m inland`,
        );
      }
    }
  });

  it('lies under every fine trough a dozen kilometres in', () => {
    for (const broad of [300, 500, 900]) {
      assert.ok(
        lowlandFloor(12_000, broad, FINE) <= broad - FINE + 1e-3,
        `under ${broad} m`,
      );
    }
  });
});

describe('restingGround', () => {
  it('never falls below its floor nor below its own height', () => {
    const next = stream(11);
    for (let k = 0; k < 2000; k += 1) {
      const d = 20_000 * next() ** 3;
      const broad = 200 * next() - 60;
      const height = broad + 100 * next() - 60;
      const ground = restingGround(d, height, broad, FINE);
      assert.ok(
        ground >= lowlandFloor(d, broad, FINE),
        `${d} m, ${broad}, ${height}`,
      );
      assert.ok(ground >= height);
    }
  });

  it('never lies under the hard floor: height rounded onto it over the lowland', () => {
    const next = stream(17);
    for (let k = 0; k < 5000; k += 1) {
      const d = 30_000 * next() ** 3;
      const broad = 200 * next() - 60;
      const height = broad + 150 * next() - 100;
      const lowland = LOWLAND_METRES * approach(d, LOWLAND_REACH_METRES);
      const floor = lowlandFloor(d, broad, FINE);
      const gap = lowland - Math.abs(height - floor);
      const hard =
        Math.max(height, floor) + (gap > 0 ? (gap * gap) / (4 * lowland) : 0);
      assert.ok(
        restingGround(d, height, broad, FINE) >= hard - 1e-9,
        `${d} m, ${broad}, ${height}`,
      );
    }
  });

  it('keeps the order of heights under the floor, and their relief', () => {
    // 1 km in over a broad relief sunk under the lowland, where a hard floor
    // levels every trough: one 30 m under it still rises with its height.
    const floor = lowlandFloor(1000, -10, FINE);
    let last = -Infinity;
    for (let height = floor - 80; height < floor + 30; height += 0.5) {
      const ground = restingGround(1000, height, -10, FINE);
      assert.ok(ground > last, `at ${height}`);
      last = ground;
    }
    const rise =
      (restingGround(1000, floor - 29, -10, FINE) -
        restingGround(1000, floor - 31, -10, FINE)) /
      2;
    assert.ok(rise > 0.05, `relief kept at ${rise} of its size`);
  });

  it('is the noise itself a dozen kilometres in, over the floor', () => {
    for (const broad of [-200, 0, 100, 900]) {
      const floor = lowlandFloor(12_000, broad, FINE);
      for (const over of [70, 100, 300]) {
        assert.equal(
          restingGround(12_000, floor + over, broad, FINE),
          floor + over,
          `${over} m over ${broad}`,
        );
      }
    }
  });
});

describe('lowlandFloor over the shore', () => {
  it('stands over the sand band from a few hundred metres in', () => {
    for (const d of [400, 1000, 30_000]) {
      for (const broad of [-300, 0, 10]) {
        assert.ok(lowlandFloor(d, broad, FINE) > 20, `${broad} m at ${d} m`);
      }
    }
  });

  it('leaves a gentle beach: under 10 m for the first 100 m', () => {
    for (let d = 1; d <= 100; d += 3) {
      assert.ok(restingGround(d, -50, -50, FINE) < 10, `at ${d} m`);
    }
  });
});

describe('duneAt', () => {
  it('leaves the beach bare and dies out under a kilometre in', () => {
    for (const d of [0, 10, 30, 850, 5000]) {
      assert.equal(duneAt(d, 1, 0.3), 0, `at ${d} m`);
    }
  });

  it('stays between zero and the tallest dune', () => {
    const next = stream(3);
    let tallest = 0;
    for (let k = 0; k < 5000; k += 1) {
      const dune = duneAt(900 * next(), 2 * next() - 1, 2 * next() - 1);
      assert.ok(dune >= 0 && dune <= DUNE_METRES, `${dune}`);
      tallest = Math.max(tallest, dune);
    }
    assert.ok(tallest > 0.8 * DUNE_METRES, `tallest ${tallest}`);
  });

  it('stands in ridges one spacing apart on the way in', () => {
    const crests: number[] = [];
    for (let d = 121; d < 600; d += 1) {
      const here = duneAt(d, 0, 0);
      if (here > duneAt(d - 1, 0, 0) && here >= duneAt(d + 1, 0, 0)) {
        crests.push(d);
      }
    }
    assert.ok(crests.length >= 4, `${crests.length} ridges`);
    for (let k = 1; k < crests.length; k += 1) {
      const gap = (crests[k] ?? 0) - (crests[k - 1] ?? 0);
      assert.ok(Math.abs(gap - DUNE_SPACING_METRES) <= 3, `gap ${gap}`);
    }
  });
});
