import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { latLonToUnit } from '@/island/shared/globe';

import { upliftAtSphere, upliftSlope } from './ranges';
import { UPLIFT_METRES } from './relief-numbers';

const at = (lat: number, lon: number) =>
  latLonToUnit({ lat: (lat * Math.PI) / 180, lon: (lon * Math.PI) / 180 });

/** The uplift far inland over a grid of the whole sphere, for `seed`. */
function sweep(seed: number, d: number) {
  const lifts: number[] = [];
  for (let lat = -84; lat <= 84; lat += 3) {
    for (let lon = -180; lon < 180; lon += 3) {
      const [x, y, z] = at(lat, lon);
      lifts.push(upliftAtSphere(seed, x, y, z, d));
    }
  }
  return lifts;
}

describe('upliftAtSphere', () => {
  it('stays between zero and a full belt', () => {
    for (const seed of [0, 7, 123_456]) {
      for (const d of [1, 60_000, 2_000_000]) {
        for (const lift of sweep(seed, d)) {
          assert.ok(lift >= 0 && lift <= UPLIFT_METRES, `${lift}`);
        }
      }
    }
  });

  it('lifts a belt somewhere and leaves most land alone, on every seed', () => {
    for (const seed of [0, 7, 123_456, 99]) {
      const lifts = sweep(seed, 2_000_000);
      const lifted = lifts.filter((lift) => lift > 0.5 * UPLIFT_METRES).length;
      const flat = lifts.filter((lift) => lift === 0).length;
      assert.ok(lifted > 0, `seed ${seed}: no belt`);
      assert.ok(lifted < 0.25 * lifts.length, `seed ${seed}: ${lifted} lifted`);
      assert.ok(flat > 0.5 * lifts.length, `seed ${seed}: ${flat} flat`);
    }
  });

  it('raises a coastal range behind some shores, gone far inland', () => {
    for (const seed of [0, 7]) {
      const behind = sweep(seed, 100_000);
      const inland = sweep(seed, 2_000_000);
      const coastal = behind.filter(
        (lift, k) => lift > 0.5 * UPLIFT_METRES && inland[k] === 0,
      );
      assert.ok(coastal.length > 0, `seed ${seed}`);
    }
  });

  it('never climbs faster than `upliftSlope` says', () => {
    // Along a meridian in 100 m steps, the coast distance rising a metre a metre.
    const bound = upliftSlope(3.75 * Math.sqrt(3));
    const step = 100 / 6_371_000;
    for (const lon of [0, 40, 130, -75]) {
      let last = 0;
      for (let k = 0; k < 20_000; k += 1) {
        const lat = -0.8 + k * step;
        const lift = upliftAtSphere(
          7,
          Math.cos(lat) * Math.cos(lon),
          Math.sin(lat),
          Math.cos(lat) * Math.sin(lon),
          k * 100,
        );
        if (k > 0) {
          assert.ok(Math.abs(lift - last) <= bound * 100, `${lift - last}`);
        }
        last = lift;
      }
    }
  });
});
