import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type CoastField, sampleCoastField } from '../../coast-field';
import { SEED_WORD } from './layout';
import { worldWords } from './mask';
import { GRID, GRID_NODES, SQUARE } from './square';
import { buildWorldField, TAPER, taperAt, worldSeed } from './world-field';

/** Land cells and the largest 4-connected land component's size, in nodes. */
function landComponents({ distance, columns, rows }: CoastField) {
  const seen = new Uint8Array(columns * rows);
  const stack = new Int32Array(columns * rows);
  let land = 0;
  let largest = 0;
  for (let start = 0; start < seen.length; start += 1) {
    if (seen[start] === 1 || !((distance[start] ?? 0) > 0)) continue;
    let size = 0;
    let top = 0;
    stack[top++] = start;
    seen[start] = 1;
    while (top > 0) {
      const n = stack[--top] ?? 0;
      size += 1;
      const i = n % columns;
      const neighbours = [
        i > 0 ? n - 1 : -1,
        i + 1 < columns ? n + 1 : -1,
        n - columns,
        n + columns < seen.length ? n + columns : -1,
      ];
      for (const m of neighbours) {
        if (m < 0 || seen[m] === 1 || !((distance[m] ?? 0) > 0)) continue;
        seen[m] = 1;
        stack[top++] = m;
      }
    }
    land += size;
    largest = Math.max(largest, size);
  }
  return { land, largest };
}

/** The value at `share` of the way through ascending `sorted`. */
const quantile = (sorted: readonly number[], share: number) =>
  sorted[Math.floor(share * sorted.length)] ?? Number.NaN;

const isLand = (distance: Float32Array, i: number, j: number) =>
  (distance[j * GRID_NODES + i] ?? 0) > 0;

/** Cells from node `(i, j)` to the nearest node of the other sign, by search. */
function nearestOther(distance: Float32Array, i: number, j: number) {
  const n = GRID_NODES;
  const land = isLand(distance, i, j);
  let best = Infinity;
  for (let r = 1; r < n && r <= best + 1; r += 1) {
    for (let dj = -r; dj <= r; dj += 1) {
      for (let di = -r; di <= r; di += 1) {
        if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
        const x = i + di;
        const y = j + dj;
        if (x < 0 || y < 0 || x >= n || y >= n) continue;
        if (isLand(distance, x, y) !== land) {
          best = Math.min(best, Math.hypot(di, dj));
        }
      }
    }
  }
  return best;
}

const WORLDS = ['2', '3', '4', '5', '6', '7', '8', '9'];
const fields = new Map(WORLDS.map((world) => [world, buildWorldField(world)]));
const field = (world: string) => {
  const built = fields.get(world);
  assert.ok(built);
  return built;
};

describe('buildWorldField', () => {
  it('lays its 1024² grid over the square from its low corner', () => {
    const { originX, originY, cellMetres, columns, rows, distance } =
      field('2');
    assert.equal(columns, GRID_NODES);
    assert.equal(rows, GRID_NODES);
    assert.equal(distance.length, GRID_NODES ** 2);
    assert.equal(cellMetres, SQUARE.side / 1024);
    assert.equal(originX, SQUARE.centreX - 5_200_000);
    assert.equal(originY, SQUARE.centreY - 5_200_000);
    assert.deepEqual({ originX, originY, cellMetres, columns, rows }, GRID);
  });

  it('is a pure function of the world number', () => {
    assert.deepEqual(buildWorldField('2').distance, field('2').distance);
    assert.notDeepEqual(field('3').distance, field('2').distance);
  });

  it('gives each of worlds 2–9 one continent: a component of over half the land', () => {
    for (const world of WORLDS) {
      const { land, largest } = landComponents(field(world));
      assert.ok(land > 0.02 * GRID_NODES ** 2, `world ${world}: land ${land}`);
      assert.ok(largest > land / 2, `world ${world}: ${largest} of ${land}`);
    }
  });

  it('keeps the square’s corners ocean', () => {
    const { side, centreX, centreY } = SQUARE;
    for (const world of WORLDS) {
      for (const [sx, sy] of [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ] as const) {
        const x = centreX + (sx * side) / 2;
        const y = centreY + (sy * side) / 2;
        assert.ok(sampleCoastField(field(world), x, y) < 0, `world ${world}`);
      }
    }
  });

  it('tapers the waves to nothing between 0.40 and 0.48 of the side out', () => {
    for (const p of [0.5, 0.1, 0.9, 0.5 - TAPER.inner, 0.5 + TAPER.inner]) {
      assert.equal(taperAt(p, 0.5), 1);
      assert.equal(taperAt(0.5, p), 1);
    }
    for (const p of [0, 0.02, 0.98, 0.5 - TAPER.outer, 0.5 + TAPER.outer]) {
      assert.equal(taperAt(p, 0.5), 0);
      assert.equal(taperAt(0.5, p), 0);
    }
    assert.ok(Math.abs(taperAt(0.06, 0.06) - 0.25) < 1e-12);
  });

  it('keeps worlds 2–40 clear of land within 0.02 of the side from the edge', () => {
    const band = Math.ceil(0.02 * GRID_NODES);
    for (let world = 2; world <= 40; world += 1) {
      const { distance } =
        fields.get(String(world)) ?? buildWorldField(String(world));
      let edgeLand = 0;
      for (let j = 0; j < GRID_NODES; j += 1) {
        const inBand = j < band || j >= GRID_NODES - band;
        for (let i = 0; i < GRID_NODES; i += 1) {
          if (!inBand && i >= band && i < GRID_NODES - band) continue;
          if ((distance[j * GRID_NODES + i] ?? 0) > 0) edgeLand += 1;
        }
      }
      assert.equal(edgeLand, 0, `world ${String(world)}`);
    }
  });

  it('reads as the distance to the coast where it crosses', () => {
    for (const world of ['3', '9']) {
      const { distance, cellMetres } = field(world);
      const n = GRID_NODES;
      const gaps: number[] = [];
      for (let j = 0; j < n; j += 1) {
        for (let i = 0; i + 1 < n; i += 1) {
          const a = distance[j * n + i] ?? Number.NaN;
          const b = distance[j * n + i + 1] ?? Number.NaN;
          if (a > 0 !== b > 0)
            gaps.push((Math.abs(a) + Math.abs(b)) / cellMetres);
        }
      }
      gaps.sort((p, q) => p - q);
      // Two nodes either side of the zero line lie under a cell apart across it.
      assert.ok(
        quantile(gaps, 0.5) < 1 &&
          quantile(gaps, 0.95) < 1.2 &&
          quantile(gaps, 1 - 1e-9) < 2,
        `world ${world}`,
      );
    }
  });

  it('stores the true distance to the coast inland, with no ridge between near waters', () => {
    for (const world of ['3', '9']) {
      const { distance, cellMetres } = field(world);
      const n = GRID_NODES;
      let checked = 0;
      for (let j = 7; j < n; j += 37) {
        for (let i = 11; i < n; i += 41) {
          if (!isLand(distance, i, j)) continue;
          const stored = (distance[j * n + i] ?? Number.NaN) / cellMetres;
          const other = nearestOther(distance, i, j);
          // The coast lies between a node and its nearest water node.
          assert.ok(
            stored <= other + 1e-3 && stored > other - 1.5,
            `world ${world} (${String(i)}, ${String(j)}): ${String(stored)} vs ${String(other)}`,
          );
          checked += 1;
        }
      }
      assert.ok(checked > 20, `world ${world}: ${String(checked)} land nodes`);
    }
  });
});

describe('worldSeed', () => {
  it('is the world’s word 5, raw', () => {
    for (const world of ['1', '2', '77']) {
      assert.equal(worldSeed(world), worldWords(world)[SEED_WORD]);
    }
    assert.notEqual(worldSeed('2'), worldSeed('3'));
  });
});
