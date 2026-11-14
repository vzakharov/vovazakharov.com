import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  clearSky,
  hemisphereFill,
  skyOf,
  skyParts,
  SUN_DIR,
} from '@/cube/shared/cube-boundary';
import type { Rgb } from '@/cube/shared/lib/colour';
import type { Vec3 } from '@/cube/shared/lib/vec';

import {
  CLOUD_LANE,
  CLOUD_TILE,
  CLOUDS,
  driftAt,
  laneCover,
} from './cloud-field';
import { fitSky, fittedParts } from './sky-fit';
import { fitGlance, glanceAt } from './sky-glance';

const DEGREE = Math.PI / 180;
/** The sun in the frame the model works in: its bearing along x. */
const SUN: Vec3 = [Math.hypot(SUN_DIR[0], SUN_DIR[2]), SUN_DIR[1], 0];

/** A ray `lift` degrees over the horizon, `turn` degrees round from the sun. */
const ray = (lift: number, turn: number): Vec3 => [
  Math.cos(lift * DEGREE) * Math.cos(turn * DEGREE),
  Math.sin(lift * DEGREE),
  Math.cos(lift * DEGREE) * Math.sin(turn * DEGREE),
];

/** Rays between the ones either fit is made on. */
const RAYS = [0.7, 3, 7, 13, 24, 41, 63, 85].flatMap((lift) =>
  [0, 11, 37, 83, 129, 171].map((turn) => ray(lift, turn)),
);

/** The widest any channel of `got` stands from `want`, as a share of it. */
const offBy = (got: Rgb, want: Rgb): number =>
  Math.max(...got.map((value, c) => Math.abs(value / (want[c] ?? 1) - 1)));

describe('the sky', () => {
  it('the fitted sky is the model’s within a few percent', () => {
    const fit = fitSky(SUN_DIR);
    for (const dir of RAYS) {
      const between = dir[0] * SUN[0] + dir[1] * SUN[1];
      const fitted = skyOf(fittedParts(fit, dir, SUN), between);
      const off = offBy(fitted, skyOf(skyParts(dir, SUN), between));
      assert.ok(off < 0.08, `${dir.join(', ')} is ${off.toFixed(3)} off`);
    }
  });

  it('the sky at a glance is never far from the model’s', () => {
    // Worst where the sun's glow falls off, a quarter of the sky from it.
    const glance = fitGlance(SUN_DIR);
    for (const dir of RAYS) {
      const off = offBy(glanceAt(glance, dir, SUN), clearSky(dir, SUN));
      assert.ok(off < 0.6, `${dir.join(', ')} is ${off.toFixed(3)} off`);
    }
  });

  it('the sky’s fill is the cosine-weighted mean of the model’s sky', () => {
    // A finer quadrature than the fill's own, over the half turn the sky is
    // mirrored in.
    const rings = 24;
    const spokes = 32;
    const sum = [0, 0, 0];
    for (let i = 0; i < rings; i++) {
      const y = Math.sqrt((i + 0.5) / rings);
      const flat = Math.sqrt(1 - y * y);
      for (let j = 0; j < spokes; j++) {
        const turn = (Math.PI * (j + 0.5)) / spokes;
        const sky = clearSky(
          [flat * Math.cos(turn), y, flat * Math.sin(turn)],
          SUN,
        );
        for (const [c, value] of sky.entries()) sum[c] = (sum[c] ?? 0) + value;
      }
    }
    const mean = sum.map((value) => (value * Math.PI) / (rings * spokes));
    const off = offBy(hemisphereFill(SUN_DIR, 1), [
      mean[0] ?? 0,
      mean[1] ?? 0,
      mean[2] ?? 0,
    ]);
    assert.ok(off < 0.12, `${off.toFixed(3)} off`);
  });

  it('the clouds are where they were an hour before', () => {
    assert.ok(Number.isInteger(CLOUDS.tilesPerHour));
    assert.ok(Number.isInteger(CLOUDS.tileCells));
    assert.equal(CLOUD_TILE, CLOUDS.cell * CLOUDS.tileCells);
    assert.ok(
      Math.abs(driftAt(3600) - CLOUD_TILE * CLOUDS.tilesPerHour) < 1e-9,
    );
  });

  it('a cloud stands wholly inside its cell', () => {
    assert.ok(CLOUDS.radius.most * CLOUDS.bound <= CLOUDS.cell / 2);
  });

  it('no cloud stands over the island or in the sun’s beam to it', () => {
    // The beam is inside the cloud layer this far toward the sun.
    const beam = CLOUDS.ceiling / Math.tan(Math.asin(SUN_DIR[1]));
    assert.ok(CLOUD_LANE.open.ahead > beam);
    for (const toSun of [
      CLOUD_LANE.open.behind,
      0,
      beam / 2,
      beam,
      CLOUD_LANE.open.ahead,
    ]) {
      for (const ragged of [0, 0.5, 1]) {
        for (const across of [0, CLOUDS.lane.clear / 2, CLOUDS.lane.clear]) {
          assert.equal(laneCover(toSun, across, ragged), 0);
          assert.equal(laneCover(toSun, -across, ragged), 0);
        }
      }
    }
  });

  it('the field is whole outside the lane', () => {
    assert.equal(laneCover(0, CLOUDS.lane.full, 1), 1);
    assert.equal(laneCover(CLOUD_LANE.shut.ahead, 0, 0), 1);
    assert.equal(laneCover(CLOUD_LANE.shut.behind, 0, 0), 1);
  });
});
