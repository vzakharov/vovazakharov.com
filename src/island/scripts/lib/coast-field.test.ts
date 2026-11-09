import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Coast } from '@/island/shared/globe';

import { buildCoastField, sampleCoastField } from './coast-field';

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

  it('gives the same field for the same coast', () => {
    const rebuilt = buildCoastField(disc);
    assert.deepEqual(rebuilt.distance, discField.distance);
  });
});
