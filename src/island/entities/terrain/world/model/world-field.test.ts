import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type CoastField, sampleCoastField } from '../../coast-field';
import { SEED_WORD } from './layout';
import { worldWords } from './mask';
import { GRID, GRID_NODES, SQUARE } from './square';
import { buildWorldField, worldSeed } from './world-field';

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
    assert.deepEqual({ originX, originY, cellMetres }, GRID);
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
      const at = (share: number) =>
        gaps[Math.floor(share * gaps.length)] ?? Number.NaN;
      assert.ok(
        at(0.5) < 1 && at(0.95) < 1.2 && at(1 - 1e-9) < 2,
        `world ${world}`,
      );
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
