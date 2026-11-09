import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cross,
  dot,
  latLonToUnit,
  length,
  R,
  scaled,
  sum,
  unit,
  type Vec3,
} from '@/island/shared/globe';

import { GROUND_SLOPE } from './height';
import {
  type CoastDistance,
  heightAtSphere,
  SPHERE_GROUND_SLOPE,
} from './height-sphere';

const SEED = 7;
const DISC_METRES = 1_000_000;

/** Radians between two directions. */
const arc = (a: Vec3, b: Vec3) => Math.atan2(length(cross(a, b)), dot(a, b));

/**
 * A land cap 1 000 km around `centre`, its coast the true distance, and the
 * point `(x, y)` metres east and north of the centre along the ground —
 * the sphere's counterpart of `height.test.ts`'s disc on the plane.
 */
function discAt(centre: Vec3, north: Vec3) {
  const east = cross(north, centre);
  const distance: CoastDistance = (p) => DISC_METRES - R * arc(p, centre);
  const at = (x: number, y: number): Vec3 => {
    const r = Math.hypot(x, y);
    if (r === 0) return centre;
    const toward = sum(scaled(east, x / r), scaled(north, y / r));
    return sum(
      scaled(centre, Math.cos(r / R)),
      scaled(toward, Math.sin(r / R)),
    );
  };
  const height = (x: number, y: number, finest = 0, seed = SEED) =>
    heightAtSphere(distance, seed, at(x, y), finest);
  return { distance, at, height };
}

/** 10° N on the `+X` meridian, where the island sits. */
const island = discAt(latLonToUnit({ lat: (10 * Math.PI) / 180, lon: 0 }), [
  -Math.sin((10 * Math.PI) / 180),
  Math.cos((10 * Math.PI) / 180),
  0,
]);
/** Over the North Pole, where no latitude–longitude frame holds. */
const polar = discAt([0, 1, 0], [-1, 0, 0]);
/** Astride the corner of three cube faces. */
const corner = discAt(unit([1, 1, 1]), unit([-1, 2, -1]));

const DISCS = { island, polar, corner } as const;

/** The standard deviation of height over a `span`-metre square at `(x, y)`. */
function spread(x: number, y: number, span: number): number {
  const heights: number[] = [];
  for (let i = 0; i < 32; i += 1) {
    for (let j = 0; j < 32; j += 1) {
      heights.push(
        island.height(x + (i / 31 - 0.5) * span, y + (j / 31 - 0.5) * span),
      );
    }
  }
  const mean = heights.reduce((total, h) => total + h, 0) / heights.length;
  const variance =
    heights.reduce((total, h) => total + (h - mean) ** 2, 0) / heights.length;
  return Math.sqrt(variance);
}

/** Window centres on the disc, all over 300 km inland. */
const INLAND = [
  [0, 0],
  [250_000, -120_000],
  [-300_000, 500_000],
  [600_000, 300_000],
] as const;

/** How many `INLAND` windows `span` metres wide vary by over `metres`. */
const hilly = (span: number, metres: number) =>
  INLAND.filter(([x, y]) => spread(x, y, span) > metres).length;

describe('heightAtSphere', () => {
  it('is land inland and sea offshore, on every disc', () => {
    for (const [name, { height }] of Object.entries(DISCS)) {
      for (let k = 0; k < 64; k += 1) {
        const angle = (2 * Math.PI * k) / 64;
        const [c, s] = [Math.cos(angle), Math.sin(angle)];
        assert.ok(height(900_000 * c, 900_000 * s) > 0, `${name} inland`);
        assert.ok(height(500_000 * c, 500_000 * s) > 0, name);
        assert.ok(height(1_002_000 * c, 1_002_000 * s) < 0, `${name} offshore`);
        assert.ok(height(1_100_000 * c, 1_100_000 * s) < -1000, name);
      }
    }
  });

  it('gives the same height for the same input, at any length of `p`', () => {
    for (const [x, y] of [
      [0, 0],
      [123_456.789, -98_765.4321],
      [999_000, 3],
    ] as const) {
      const p = island.at(x, y);
      const once = heightAtSphere(island.distance, SEED, p);
      assert.equal(heightAtSphere(island.distance, SEED, p), once);
      // A raised point reads the surface point under it, to rounding.
      const raised = heightAtSphere(island.distance, SEED, scaled(p, 1.0003));
      assert.ok(Math.abs(raised - once) < 1e-6, `${raised} vs ${once}`);
    }
  });

  it('gives a different height for a different seed', () => {
    let differing = 0;
    for (let k = 0; k < 20; k += 1) {
      const x = 37_000 * k - 300_000;
      const y = 11_000 * k;
      if (island.height(x, y) !== island.height(x, y, 0, SEED + 1)) {
        differing += 1;
      }
    }
    assert.equal(differing, 20);
  });

  it('has no jumps between samples 1 m apart, and relief at 2 m scale', () => {
    for (const [name, { height }] of Object.entries(DISCS)) {
      let largest = 0;
      let span = 0;
      for (const [x0, y0] of [
        [250_000, -120_000],
        [999_400, 0],
        [-700_000, 714_100],
      ] as const) {
        let low = Infinity;
        let high = -Infinity;
        let previous = height(x0, y0);
        for (let step = 1; step <= 2000; step += 1) {
          const h = height(x0 + step * 0.7, y0 + step * 0.7);
          largest = Math.max(largest, Math.abs(h - previous));
          low = Math.min(low, h);
          high = Math.max(high, h);
          previous = h;
        }
        span = Math.max(span, high - low);
      }
      // Each fine octave slopes at ~0.1–0.3; their sum stays under one in one.
      assert.ok(largest < 1, `${name}: largest step ${largest}`);
      assert.ok(largest < SPHERE_GROUND_SLOPE * 0.99, `${name}: ${largest}`);
      assert.ok(span > 0.5, `${name}: relief over 2 km: ${span}`);
    }
  });

  it('bounds the slope looser than the plane, for its third lattice axis', () => {
    assert.ok(SPHERE_GROUND_SLOPE > GROUND_SLOPE);
  });

  it('has hills at every scale inland: across 10 km, 200 m and 4 m', () => {
    // A window can fall on a quiet patch; three of four may not.
    assert.ok(hilly(10_000, 30) >= 3, '10 km windows under 30 m');
    assert.ok(hilly(200, 3) >= 3, '200 m windows under 3 m');
    assert.ok(hilly(4, 0.02) >= 3, '4 m windows under 2 cm');
  });

  it('leaves out the octaves shorter than `finest`, and keeps the rest', () => {
    for (const [x, y] of INLAND) {
      // Over 20 m the 1 km octaves barely move, so what is left is smooth.
      const coarse = (dx: number) => island.height(x + dx, y, 1000);
      const bend = coarse(0) - (coarse(-10) + coarse(10)) / 2;
      assert.ok(Math.abs(bend) < 0.5, `bend ${bend} at ${x}, ${y}`);
      const full = island.height(x, y);
      // No more apart than the octaves under 2 km reach together.
      assert.ok(Math.abs(coarse(0) - full) < 300, `${coarse(0)} vs ${full}`);
    }
  });

  it('stays in a plausible range: beaches low, interior up to ~2 km', () => {
    for (const [name, { height }] of Object.entries(DISCS)) {
      let interiorHigh = -Infinity;
      let interiorLow = Infinity;
      let floor = Infinity;
      for (let i = -60; i <= 60; i += 2) {
        for (let j = -60; j <= 60; j += 2) {
          const x = i * 20_000;
          const y = j * 20_000;
          const h = height(x, y);
          if (Math.hypot(x, y) < 600_000) {
            interiorHigh = Math.max(interiorHigh, h);
            interiorLow = Math.min(interiorLow, h);
          }
          floor = Math.min(floor, h);
        }
      }
      // Valleys, but no inland sea: lakes are a later bite's.
      assert.ok(interiorLow > 0, `${name}: interior low ${interiorLow}`);
      assert.ok(interiorHigh > 1000, `${name}: interior high ${interiorHigh}`);
      assert.ok(interiorHigh < 2800, `${name}: interior high ${interiorHigh}`);
      assert.ok(floor > -4500, `${name}: sea floor ${floor}`);
      const beach = height(999_000, 0);
      assert.ok(beach > -20 && beach < 60, `${name}: beach ${beach}`);
    }
  });
});
