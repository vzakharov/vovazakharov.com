import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { latLonToUnit, R, type Vec3 } from '@/island/shared/globe';

import {
  gridFrame,
  nodePosition,
  sampleSphereField,
} from '../../../coast-field';
import { pathHash } from './hash';
import { sphereContourOf } from './sphere-contour';
import {
  buildSphereWorld,
  type BuildTimes,
  fieldGrids,
  fieldOf,
  openSphereWorld,
} from './sphere-world';
import { rollWorld } from './world-schema';

const RADIUS = (20 * Math.PI) / 180;
const ROWS = 256;
const COLUMNS = 512;
/** One cell: the longitude step at the equator, the widest. */
const CELL = (2 * Math.PI * R) / COLUMNS;

const degrees = (lat: number, lon: number) =>
  latLonToUnit({ lat: (lat * Math.PI) / 180, lon: (lon * Math.PI) / 180 });

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** A 20° cap of land round `centre`: `f`, and the exact signed distance. */
function cap(centre: Vec3) {
  const { latLonGrid } = fieldGrids(ROWS, COLUMNS);
  const frame = gridFrame(latLonGrid);
  const f = new Float64Array(ROWS * COLUMNS);
  const exact = new Float64Array(ROWS * COLUMNS);
  const p = new Float64Array(3);
  for (let n = 0; n < f.length; n += 1) {
    nodePosition(frame, COLUMNS, n, p);
    const c = dot([p[0] ?? 0, p[1] ?? 0, p[2] ?? 0], centre);
    f[n] = c - Math.cos(RADIUS);
    exact[n] = R * (RADIUS - Math.acos(Math.min(1, c)));
  }
  return { grid: latLonGrid, f, exact };
}

const CAPS: Record<string, Vec3> = {
  'mid-latitude': degrees(40, 30),
  'north pole': [0, 1, 0],
  'south pole': [0, -1, 0],
  'date line': degrees(-10, 180),
  'longitude 0': degrees(5, 0),
};

describe('sphere coast field on a 20° cap', () => {
  for (const [name, centre] of Object.entries(CAPS)) {
    it(`is within a cell of the great-circle distance: ${name}`, () => {
      const { grid, f, exact } = cap(centre);
      const field = fieldOf(f, grid);
      let worst = 0;
      for (const [n, d] of field.distance.entries()) {
        worst = Math.max(worst, Math.abs(d - (exact[n] ?? 0)));
      }
      assert.ok(worst < CELL, `${name}: ${worst} m, cell ${CELL} m`);
    });
  }

  it('puts every contour point on the cap’s edge', () => {
    const centre = CAPS['date line'] ?? [1, 0, 0];
    const { grid, f } = cap(centre);
    const segments = sphereContourOf(f, grid);
    assert.ok(segments.length > 0);
    for (let k = 0; k < segments.length; k += 3) {
      const p: Vec3 = [
        segments[k] ?? 0,
        segments[k + 1] ?? 0,
        segments[k + 2] ?? 0,
      ];
      assert.ok(Math.abs(Math.hypot(...p) - 1) < 1e-12);
      assert.ok(Math.abs(R * (Math.acos(dot(p, centre)) - RADIUS)) < CELL / 4);
    }
  });

  it('samples within a cell of the exact distance between nodes', () => {
    const centre = CAPS['north pole'] ?? [0, 1, 0];
    const { grid, f } = cap(centre);
    const field = fieldOf(f, grid);
    for (let k = 0; k < 500; k += 1) {
      const lat = 50 + 40 * ((k * 0.618) % 1);
      const p = degrees(lat, k * 13.7 - 180);
      const exact = R * (RADIUS - Math.acos(dot(p, centre)));
      assert.ok(Math.abs(sampleSphereField(field, p) - exact) < CELL);
    }
    const pole = sampleSphereField(field, [0, 1, 0]);
    assert.ok(Math.abs(pole - R * RADIUS) < CELL);
  });
});

const ms = (x: number) => `${Math.round(x)} ms`;

describe('buildSphereWorld', () => {
  it('builds world 2 at L = 511 within the budget, timed by stage', (t) => {
    const times: BuildTimes = {
      roll: 0,
      synthesis: 0,
      contour: 0,
      sweep: 0,
    };
    const start = performance.now();
    const { field, seed } = buildSphereWorld('2', { times });
    const total = performance.now() - start;
    t.diagnostic(
      `world 2, 1024 × 2048: roll ${ms(times.roll)}, synthesis ${ms(times.synthesis)}, ` +
        `contour ${ms(times.contour)}, sweep ${ms(times.sweep)}, total ${ms(total)}`,
    );
    assert.equal(seed, rollWorld('2').noise.seed);
    assert.equal(field.distance.length, 1024 * 2048);
    const land =
      field.distance.filter((d) => d > 0).length / field.distance.length;
    assert.ok(land > 0.15 && land < 0.45, `land ${land}`);
  });

  it('opens #1 from its pinned row, the seed still rolled', async () => {
    const one = await openSphereWorld('1');
    assert.equal(one.seed, rollWorld('1').noise.seed);
    const land =
      one.field.distance.filter((d) => d > 0).length /
      one.field.distance.length;
    // One island on a sea world, where #1's rolled series is a third land.
    assert.ok(land > 0.005 && land < 0.03, `land ${land}`);
    // The island's middle, 10° N on the +X meridian, lies inland.
    const middle = latLonToUnit({ lat: (10 * Math.PI) / 180, lon: 0 });
    assert.ok(sampleSphereField(one.field, middle) > 20_000);
  });

  it('rolls from the source it is given', () => {
    const five = buildSphereWorld('5');
    const asFive = buildSphereWorld('2', { source: pathHash('5') });
    assert.equal(asFive.seed, five.seed);
    assert.deepEqual(asFive.field.poles, five.field.poles);
    assert.ok(
      asFive.field.distance.every((d, n) => d === five.field.distance[n]),
    );
  });
});
