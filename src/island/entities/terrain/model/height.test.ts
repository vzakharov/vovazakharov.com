import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Coast } from '@/island/shared/globe';

import { buildCoastField, sampleCoastField } from './coast-field';
import { heightAt } from './height';

const RADIUS_KM = 1000;

/** A disc of radius 1 000 km around the centre, counter-clockwise. */
const disc: Coast = {
  kmPerPixel: 4,
  rings: [
    Array.from({ length: 720 }, (_, k): [number, number] => {
      const angle = (2 * Math.PI * k) / 720;
      return [RADIUS_KM * Math.cos(angle), RADIUS_KM * Math.sin(angle)];
    }),
  ],
};

/** Two squares: a 600 km main body east and a 100 km islet west. */
const squares: Coast = {
  kmPerPixel: 4,
  rings: [
    [
      [0, -300],
      [600, -300],
      [600, 300],
      [0, 300],
    ],
    [
      [-400, -50],
      [-300, -50],
      [-300, 50],
      [-400, 50],
    ],
  ],
};

const discField = buildCoastField(disc);
const squaresField = buildCoastField(squares, 1000);

describe('buildCoastField', () => {
  it('measures the disc: distance to the rim, positive inside', () => {
    for (const r of [0, 150_000, 500_000, 990_000, 1_010_000, 1_080_000]) {
      for (const angle of [0.3, 2, 4.4]) {
        const d = sampleCoastField(
          discField,
          r * Math.cos(angle),
          r * Math.sin(angle),
        );
        // The polygon sits up to 10 m inside the circle; the grid adds a few.
        assert.ok(Math.abs(d - (RADIUS_KM * 1000 - r)) < 200, `r = ${r}: ${d}`);
      }
    }
  });

  it('keeps falling past the grid', () => {
    const edge = sampleCoastField(discField, 1_200_000, 0);
    const far = sampleCoastField(discField, 3_000_000, 0);
    assert.ok(far < edge && far < -1_900_000 && far > -2_100_000);
  });

  it('signs both rings of a two-ring coast, and the strait between', () => {
    assert.ok(sampleCoastField(squaresField, 300_000, 0) > 0);
    assert.ok(sampleCoastField(squaresField, -350_000, 0) > 0);
    const strait = sampleCoastField(squaresField, -150_000, 0);
    assert.ok(Math.abs(strait + 150_000) < 1000, `${strait}`);
  });
});

const SEED = 7;

/** The disc's height `r` metres from the centre along `angle`. */
const atRadius = (r: number, angle: number) =>
  heightAt(discField, SEED, r * Math.cos(angle), r * Math.sin(angle));

/** The standard deviation of height over a `span`-metre square at `(x, y)`. */
function spread(x: number, y: number, span: number): number {
  const heights: number[] = [];
  for (let i = 0; i < 32; i += 1) {
    for (let j = 0; j < 32; j += 1) {
      heights.push(
        heightAt(
          discField,
          SEED,
          x + (i / 31 - 0.5) * span,
          y + (j / 31 - 0.5) * span,
        ),
      );
    }
  }
  const mean = heights.reduce((sum, h) => sum + h, 0) / heights.length;
  const variance =
    heights.reduce((sum, h) => sum + (h - mean) ** 2, 0) / heights.length;
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

describe('heightAt', () => {
  it('is land inland and sea offshore', () => {
    for (let k = 0; k < 64; k += 1) {
      const angle = (2 * Math.PI * k) / 64;
      assert.ok(atRadius(900_000, angle) > 0, `inland at ${angle}`);
      assert.ok(atRadius(500_000, angle) > 0);
      assert.ok(atRadius(1_002_000, angle) < 0, `offshore at ${angle}`);
      assert.ok(atRadius(1_100_000, angle) < -1000);
    }
  });

  it('gives the same height for the same input, field rebuilt included', () => {
    const rebuilt = buildCoastField(disc);
    for (const [x, y] of [
      [0, 0],
      [123_456.789, -98_765.4321],
      [999_000, 3],
    ] as const) {
      const once = heightAt(discField, SEED, x, y);
      assert.equal(heightAt(discField, SEED, x, y), once);
      assert.equal(heightAt(rebuilt, SEED, x, y), once);
    }
  });

  it('gives a different height for a different seed', () => {
    let differing = 0;
    for (let k = 0; k < 20; k += 1) {
      const x = 37_000 * k - 300_000;
      const y = 11_000 * k;
      if (
        heightAt(discField, SEED, x, y) !== heightAt(discField, SEED + 1, x, y)
      ) {
        differing += 1;
      }
    }
    assert.equal(differing, 20);
  });

  it('has no jumps between samples 1 m apart, and relief at 2 m scale', () => {
    let largest = 0;
    let span = 0;
    for (const [x0, y0] of [
      [250_000, -120_000],
      [999_400, 0],
      [-700_000, 714_100],
    ] as const) {
      let low = Infinity;
      let high = -Infinity;
      let previous = heightAt(discField, SEED, x0, y0);
      for (let step = 1; step <= 2000; step += 1) {
        const h = heightAt(discField, SEED, x0 + step * 0.7, y0 + step * 0.7);
        largest = Math.max(largest, Math.abs(h - previous));
        low = Math.min(low, h);
        high = Math.max(high, h);
        previous = h;
      }
      span = Math.max(span, high - low);
    }
    // Each fine octave slopes at ~0.1–0.3; their sum stays under one in one.
    assert.ok(largest < 1, `largest step ${largest}`);
    assert.ok(span > 0.5, `relief over 2 km: ${span}`);
  });

  it('has hills at every scale inland: across 10 km, 200 m and 4 m', () => {
    // A window can fall on a quiet patch; three of four may not.
    assert.ok(hilly(10_000, 30) >= 3, '10 km windows under 30 m');
    assert.ok(hilly(200, 3) >= 3, '200 m windows under 3 m');
    assert.ok(hilly(4, 0.02) >= 3, '4 m windows under 2 cm');
  });

  it('stays in a plausible range: beaches low, interior up to ~2 km', () => {
    let interiorHigh = -Infinity;
    let interiorLow = Infinity;
    let floor = Infinity;
    for (let i = -60; i <= 60; i += 1) {
      for (let j = -60; j <= 60; j += 1) {
        const x = i * 20_000;
        const y = j * 20_000;
        const h = heightAt(discField, SEED, x, y);
        const r = Math.hypot(x, y);
        if (r < 600_000) {
          interiorHigh = Math.max(interiorHigh, h);
          interiorLow = Math.min(interiorLow, h);
        }
        floor = Math.min(floor, h);
      }
    }
    // Valleys, but no inland sea: lakes are a later bite's.
    assert.ok(interiorLow > 0, `interior low ${interiorLow}`);
    assert.ok(interiorHigh > 1000, `interior high ${interiorHigh}`);
    assert.ok(interiorHigh < 2800, `interior high ${interiorHigh}`);
    assert.ok(floor > -4500, `sea floor ${floor}`);
    const beach = heightAt(discField, SEED, 999_000, 0);
    assert.ok(beach > -20 && beach < 60, `beach ${beach}`);
  });
});
