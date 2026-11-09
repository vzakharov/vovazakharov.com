import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { latLonToUnit, type Vec3 } from '@/island/shared/globe';

import {
  colatitudeLongitude,
  gridFrame,
  type LatLonGrid,
  nodeOf,
  nodePosition,
  ringAbove,
} from './lat-lon';
import { sampleSphereField, type SphereField } from './sphere-field';

/** Rings at the Gauss–Legendre asymptote, near enough for these checks. */
function grid(rows: number, columns: number): LatLonGrid {
  const theta = new Float64Array(rows);
  for (let r = 0; r < rows; r += 1) {
    theta[r] = (Math.PI * (r + 0.75)) / (rows + 0.5);
  }
  return { rows, columns, theta };
}

/** A field holding `value(p)` at each node, its poles at the exact values. */
function fieldOf(g: LatLonGrid, value: (p: Vec3) => number): SphereField {
  const frame = gridFrame(g);
  const distance = new Float32Array(g.rows * g.columns);
  const p = new Float64Array(3);
  for (let n = 0; n < distance.length; n += 1) {
    nodePosition(frame, g.columns, n, p);
    distance[n] = value([p[0] ?? 0, p[1] ?? 0, p[2] ?? 0]);
  }
  return {
    ...g,
    distance,
    poles: Float64Array.of(value([0, 1, 0]), value([0, -1, 0])),
  };
}

const at = (latDeg: number, lonDeg: number) =>
  latLonToUnit({
    lat: (latDeg * Math.PI) / 180,
    lon: (lonDeg * Math.PI) / 180,
  });

describe('lat-lon grid', () => {
  const g = grid(16, 32);

  it('wraps longitude and crosses each pole half a turn round', () => {
    assert.equal(nodeOf(g, 3, -1), 3 * 32 + 31);
    assert.equal(nodeOf(g, 3, 32), 3 * 32);
    assert.equal(nodeOf(g, -1, 5), 21);
    assert.equal(nodeOf(g, -2, 20), 32 + 4);
    assert.equal(nodeOf(g, 16, 0), 15 * 32 + 16);
    assert.equal(nodeOf(g, 17, 30), 14 * 32 + 14);
  });

  it('places nodes where latLonToUnit does', () => {
    const frame = gridFrame(g);
    const p = new Float64Array(3);
    for (const n of [0, 7, 100, 511]) {
      nodePosition(frame, 32, n, p);
      const r = Math.floor(n / 32);
      const expected = latLonToUnit({
        lat: Math.PI / 2 - (g.theta[r] ?? 0),
        lon: (2 * Math.PI * (n % 32)) / 32,
      });
      for (let a = 0; a < 3; a += 1) {
        assert.ok(Math.abs((p[a] ?? 0) - (expected[a] ?? Number.NaN)) < 1e-15);
      }
      const { theta, lambda } = colatitudeLongitude([
        p[0] ?? 0,
        p[1] ?? 0,
        p[2] ?? 0,
      ]);
      assert.ok(Math.abs(theta - (g.theta[r] ?? 0)) < 1e-12);
      assert.ok(Math.abs(lambda - (2 * Math.PI * (n % 32)) / 32) < 1e-12);
    }
  });

  it('finds the ring at or north of a colatitude', () => {
    assert.equal(ringAbove(g, 0), -1);
    assert.equal(ringAbove(g, g.theta[0] ?? 0), 0);
    assert.equal(ringAbove(g, ((g.theta[4] ?? 0) + (g.theta[5] ?? 0)) / 2), 4);
    assert.equal(ringAbove(g, Math.PI), 15);
  });
});

const smooth = (p: Vec3) => 1000 * (p[0] + 2 * p[1] - 3 * p[2]);

describe('sampleSphereField', () => {
  const g = grid(64, 128);
  const field = fieldOf(g, smooth);

  it('returns the node values at nodes', () => {
    const frame = gridFrame(g);
    const p = new Float64Array(3);
    for (const n of [5, 130, 64 * 128 - 1]) {
      nodePosition(frame, 128, n, p);
      const sampled = sampleSphereField(field, [
        p[0] ?? 0,
        p[1] ?? 0,
        p[2] ?? 0,
      ]);
      assert.ok(Math.abs(sampled - (field.distance[n] ?? 0)) < 1e-6);
    }
  });

  it('is continuous across longitude 0', () => {
    for (const lat of [-80, -30, 0, 45, 89]) {
      const west = sampleSphereField(field, at(lat, -1e-9));
      const east = sampleSphereField(field, at(lat, 1e-9));
      assert.ok(Math.abs(west - east) < 1e-6, `${lat}: ${west} vs ${east}`);
    }
  });

  it('is continuous at each pole, from every longitude', () => {
    for (const pole of [90, -90]) {
      const exact = sampleSphereField(field, [0, Math.sign(pole), 0]);
      for (let lon = -180; lon < 180; lon += 7) {
        const near = sampleSphereField(
          field,
          at(pole - Math.sign(pole) * 1e-7, lon),
        );
        assert.ok(Math.abs(near - exact) < 1e-3, `${pole}, ${lon}`);
      }
    }
  });

  it('is continuous across the outermost ring into the cap', () => {
    const edge = 90 - ((g.theta[0] ?? 0) * 180) / Math.PI;
    for (const lon of [0, 33, 200]) {
      const above = sampleSphereField(field, at(edge + 1e-9, lon));
      const below = sampleSphereField(field, at(edge - 1e-9, lon));
      assert.ok(Math.abs(above - below) < 1e-3);
    }
  });

  it('follows a smooth field to within its curvature over a cell', () => {
    for (let k = 0; k < 200; k += 1) {
      const p = at(
        Math.asin(2 * ((k * 0.618) % 1) - 1) * (180 / Math.PI),
        k * 37,
      );
      // A cell is 2π/128 rad; the field's second derivative is ≤ 1000·√14.
      const tolerance = 1000 * Math.sqrt(14) * ((2 * Math.PI) / 128) ** 2;
      assert.ok(Math.abs(sampleSphereField(field, p) - smooth(p)) < tolerance);
    }
  });
});
