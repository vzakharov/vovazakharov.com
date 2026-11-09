import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  groundSlope,
  lowlandFloor,
  OCTAVES,
  reliefAt,
  restingGround,
} from './relief';

/** A seeded stream in `[0, 1)`. */
function stream(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 2 ** 32;
  };
}

/** Ground `d` metres from the coast with every broad octave reading `broad`, every fine one `fine`. */
const groundAt = (d: number, broad: number, fine: number) =>
  reliefAt(d, 0, OCTAVES, (octave) => (octave.broad ? broad : fine));

/** Ground `d` metres from the coast with each octave reading its entry in `values`. */
const drawnAt = (values: readonly number[], d: number) =>
  reliefAt(d, 0, OCTAVES, ({ index }) => values[index] ?? 0);

/** Ground `d` metres from the coast with each octave a sine of its wavelength along the way in, at its phase in `phases`. */
const sinesAt = (phases: readonly number[], d: number) =>
  reliefAt(d, 0, OCTAVES, ({ index, wavelength }) =>
    Math.sin((2 * Math.PI * d) / wavelength + (phases[index] ?? 0)),
  );

describe('lowlandFloor', () => {
  it('follows the broad relief metre for metre where it stands over the lowland', () => {
    for (const d of [300, 600, 1500]) {
      assert.equal(
        lowlandFloor(d, 30) - lowlandFloor(d, 20),
        10,
        `at ${d} m inland`,
      );
    }
  });

  it('stays above the sea inland, however low the broad relief', () => {
    for (const d of [1, 50, 600, 5000, 50_000]) {
      for (const broad of [-500, -10, 0, 3]) {
        assert.ok(lowlandFloor(d, broad) > 0, `${broad} m at ${d} m inland`);
      }
    }
  });

  it('lies under every fine trough a dozen kilometres in', () => {
    // A humped octave reaches down to 0.225 of its amplitude, a plain one to all of it.
    const deepestFine = OCTAVES.filter((octave) => !octave.broad).reduce(
      (sum, { amplitude, hill }) => sum + amplitude * (hill ? 0.225 : 1),
      0,
    );
    for (const broad of [100, 200, 900]) {
      // Clear of the rounding too, so the ground there is the noise's own.
      assert.ok(
        lowlandFloor(12_000, broad) < broad - deepestFine - 15,
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
      const ground = restingGround(d, height, broad);
      assert.ok(
        ground >= lowlandFloor(d, broad),
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
      const lowland = 15 * (1 - Math.exp(-d / 5000));
      const floor = lowlandFloor(d, broad);
      const gap = lowland - Math.abs(height - floor);
      const hard =
        Math.max(height, floor) + (gap > 0 ? (gap * gap) / (4 * lowland) : 0);
      assert.ok(
        restingGround(d, height, broad) >= hard - 1e-9,
        `${d} m, ${broad}, ${height}`,
      );
    }
  });

  it('keeps the order of heights under the floor, and their relief', () => {
    // 1 km in over a broad relief sunk under the lowland, where a hard floor
    // levels every trough: one 30 m under it still rises with its height.
    const floor = lowlandFloor(1000, -10);
    let last = -Infinity;
    for (let height = floor - 80; height < floor + 30; height += 0.5) {
      const ground = restingGround(1000, height, -10);
      assert.ok(ground > last, `at ${height}`);
      last = ground;
    }
    const rise =
      (restingGround(1000, floor - 29, -10) -
        restingGround(1000, floor - 31, -10)) /
      2;
    assert.ok(rise > 0.05, `relief kept at ${rise} of its size`);
  });

  it('is the noise itself a dozen kilometres in, over the floor', () => {
    for (const broad of [-200, 0, 100, 900]) {
      const floor = lowlandFloor(12_000, broad);
      for (const over of [15, 40, 300]) {
        assert.equal(
          restingGround(12_000, floor + over, broad),
          floor + over,
          `${over} m over ${broad}`,
        );
      }
    }
  });
});

describe('groundSlope', () => {
  it('bounds the ground climbing straight in from the coast', () => {
    // Each octave a sine of its own wavelength along the path, so at its
    // steepest 2π · amplitude / wavelength — a slope `groundSlope(2π)` bounds.
    const next = stream(23);
    const bound = groundSlope(2 * Math.PI);
    for (let trial = 0; trial < 40; trial += 1) {
      const phases = OCTAVES.map(() => 2 * Math.PI * next());
      for (let d = 0.05; d < 20_000; d += 0.37) {
        const slope =
          Math.abs(sinesAt(phases, d + 0.01) - sinesAt(phases, d - 0.01)) /
          0.02;
        assert.ok(slope <= bound, `${slope} > ${bound} at ${d} m`);
      }
    }
  });
});

describe('reliefAt near the coast', () => {
  it('lays a fine trough on the broad relief, not on a level', () => {
    // 600 m inland, where a level floor stands under 2 m: the trough's ground
    // climbs with the broad relief under it.
    const low = groundAt(600, 0.3, -1);
    const high = groundAt(600, 0.6, -1);
    const rise = groundAt(600, 0.6, 0) - groundAt(600, 0.3, 0);
    assert.ok(rise > 3, `broad rise ${rise}`);
    assert.ok(Math.abs(high - low - rise) < 0.5, `${high - low} vs ${rise}`);
    assert.ok(low > 5, `trough ground ${low}`);
  });

  it('keeps the coast where the distance crosses zero', () => {
    const next = stream(5);
    for (let k = 0; k < 500; k += 1) {
      const values = OCTAVES.map(() => 2 * next() - 1);
      for (const d of [0.01, 1, 30, 400, 3000]) {
        const ground = drawnAt(values, d);
        assert.ok(ground > 0, `land ${d} m inland: ${ground}`);
      }
      const shore = drawnAt(values, 0.01);
      assert.ok(shore < 0.01, `no step at the shore: ${shore}`);
      assert.ok(drawnAt(values, 0) <= 0, 'sea on the coast');
      assert.ok(drawnAt(values, -0.01) > -0.01, 'no step offshore');
    }
  });
});
