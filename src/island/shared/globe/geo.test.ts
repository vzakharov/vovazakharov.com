import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  dot,
  latLonToUnit,
  length,
  northAt,
  sub,
  unitToLatLon,
  type Vec3,
} from '.';

const DEGREE = Math.PI / 180;

/** 10° N on Greenwich, where `/island` opens. */
const TEN_NORTH: Vec3 = [Math.cos(10 * DEGREE), Math.sin(10 * DEGREE), 0];

const close = (p: Vec3, q: Vec3, tolerance: number) =>
  length(sub(p, q)) <= tolerance;

describe('latLonToUnit', () => {
  it('puts 10° N on Greenwich on +X tilted up, east toward −Z', () => {
    assert.ok(
      close(latLonToUnit({ lat: 10 * DEGREE, lon: 0 }), TEN_NORTH, 1e-15),
    );
    assert.ok(
      close(latLonToUnit({ lat: 0, lon: 90 * DEGREE }), [0, 0, -1], 1e-15),
    );
    assert.ok(
      close(latLonToUnit({ lat: 90 * DEGREE, lon: 0 }), [0, 1, 0], 1e-15),
    );
  });

  it('round-trips through unitToLatLon within 1e-12', () => {
    for (let lat = -89; lat <= 89; lat += 7) {
      for (let lon = -179; lon <= 180; lon += 11) {
        const place = { lat: lat * DEGREE, lon: lon * DEGREE };
        const back = unitToLatLon(latLonToUnit(place));
        assert.ok(Math.abs(back.lat - place.lat) < 1e-12);
        assert.ok(Math.abs(back.lon - place.lon) < 1e-12);
      }
    }
  });

  it('reads any length', () => {
    const { lat, lon } = unitToLatLon([0, 6_371_000, 0]);
    assert.equal(lat, Math.PI / 2);
    assert.ok(lon === 0);
  });
});

describe('northAt', () => {
  it('tilts back from +Y by the latitude at 10° N on Greenwich', () => {
    const north: Vec3 = [-Math.sin(10 * DEGREE), Math.cos(10 * DEGREE), 0];
    assert.ok(close(northAt(TEN_NORTH), north, 1e-15));
  });

  it('is a unit tangent pointing up the meridian', () => {
    for (let lat = -89; lat <= 89; lat += 8) {
      for (let lon = -180; lon < 180; lon += 13) {
        const at = latLonToUnit({ lat: lat * DEGREE, lon: lon * DEGREE });
        const north = northAt(at);
        assert.ok(Math.abs(length(north) - 1) < 1e-12);
        assert.ok(Math.abs(dot(north, at)) < 1e-12);
        const further = latLonToUnit({
          lat: (lat + 1e-4) * DEGREE,
          lon: lon * DEGREE,
        });
        assert.ok(dot(sub(further, at), north) > 0);
      }
    }
  });

  it("falls back to the +X meridian's north at either pole", () => {
    assert.ok(close(northAt([0, 1, 0]), [-1, 0, 0], 0));
    assert.ok(close(northAt([0, -6_371_000, 0]), [1, 0, 0], 0));
    const nearPole = latLonToUnit({
      lat: 89.999_99 * DEGREE,
      lon: 40 * DEGREE,
    });
    const north = northAt(nearPole);
    assert.ok(Math.abs(dot(north, nearPole)) < 1e-12);
    assert.ok(close(north, [-1, 0, 0], 1e-6));
  });
});
