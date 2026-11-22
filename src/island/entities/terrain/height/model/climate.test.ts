import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { latLonToUnit, scaled } from '@/island/shared/globe';

import { climateAtSphere } from './climate';
import type { CoastDistance } from './height-sphere';
import { HIGHEST_GROUND } from './relief';

const DEGREE = Math.PI / 180;
const SEEDS = [0, 7, 0x7f_ff_ff_ff, -3];

/** Every place the same distance from the coast. */
const everywhere =
  (distance: number): CoastDistance =>
  () =>
    distance;

const at = (lat: number, lon = 0) =>
  latLonToUnit({ lat: lat * DEGREE, lon: lon * DEGREE });

/** A coast that differs from place to place. */
const slanted: CoastDistance = ([x]) => 2e5 * x;

describe('climateAtSphere', () => {
  it('keeps moisture in [0, 1] and temperature finite, whatever the place', () => {
    for (const seed of SEEDS) {
      for (const distance of [-4e6, -1, 0, 1, 3e5, 5e6]) {
        for (let lat = -90; lat <= 90; lat += 7.5) {
          for (let lon = -180; lon < 180; lon += 45) {
            for (const height of [-4000, 0, 900, HIGHEST_GROUND]) {
              const { temperature, moisture } = climateAtSphere(
                everywhere(distance),
                seed,
                at(lat, lon),
                height,
              );
              assert.ok(moisture >= 0 && moisture <= 1, `moisture ${moisture}`);
              assert.ok(
                temperature <= 30 && temperature >= -20 - HIGHEST_GROUND / 100,
                `temperature ${temperature}`,
              );
            }
          }
        }
      }
    }
  });

  it('is colder higher, by the same step at every place', () => {
    for (const lat of [-80, -30, 0, 45, 90]) {
      let last = Infinity;
      for (let height = 0; height <= 6000; height += 500) {
        const { temperature } = climateAtSphere(
          everywhere(1e5),
          7,
          at(lat),
          height,
        );
        assert.ok(temperature < last, `${lat}° at ${height} m`);
        last = temperature;
      }
    }
  });

  it('reads the sea floor as the sea surface', () => {
    const coast = everywhere(-1e5);
    assert.deepEqual(
      climateAtSphere(coast, 7, at(20), -3000),
      climateAtSphere(coast, 7, at(20), 0),
    );
  });

  it('is colder poleward in both hemispheres', () => {
    for (const sign of [1, -1]) {
      let last = Infinity;
      for (let lat = 0; lat <= 90; lat += 5) {
        const { temperature } = climateAtSphere(
          everywhere(1e5),
          7,
          at(sign * lat, 30),
          0,
        );
        assert.ok(temperature < last, `${sign * lat}°`);
        last = temperature;
      }
    }
  });

  it('is warm on the equator and frozen at the poles, at sea level', () => {
    const sea = everywhere(-1e5);
    const { temperature: equator } = climateAtSphere(sea, 7, at(0), 0);
    const { temperature: pole } = climateAtSphere(sea, 7, at(90), 0);
    assert.ok(equator > 24 && equator < 30, `equator ${equator}`);
    assert.ok(pole < -10 && pole > -30, `pole ${pole}`);
  });

  it('is wetter on the equator than under the subtropical belt', () => {
    for (const seed of SEEDS) {
      for (let lon = -180; lon < 180; lon += 30) {
        const wet = climateAtSphere(everywhere(1e5), seed, at(0, lon), 0);
        const dry = climateAtSphere(everywhere(1e5), seed, at(30, lon), 0);
        assert.ok(
          wet.moisture > dry.moisture + 0.3,
          `seed ${seed}, ${lon}°: ${wet.moisture} against ${dry.moisture}`,
        );
      }
    }
  });

  it('is never wetter further from the sea', () => {
    for (const lat of [0, 20, 45, 70]) {
      let last = Infinity;
      for (const distance of [-1e6, 0, 1e5, 5e5, 2e6, 6e6]) {
        const { moisture } = climateAtSphere(
          everywhere(distance),
          7,
          at(lat),
          0,
        );
        assert.ok(moisture <= last, `${lat}° ${distance} m in`);
        last = moisture;
      }
    }
  });

  it('reads the direction, whatever its length', () => {
    const p = at(37, 81);
    const far = climateAtSphere(slanted, 7, scaled(p, 6_371_000), 400);
    const near = climateAtSphere(slanted, 7, p, 400);
    assert.ok(Math.abs(far.temperature - near.temperature) < 1e-9);
    assert.ok(Math.abs(far.moisture - near.moisture) < 1e-9);
  });
});
