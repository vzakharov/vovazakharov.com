import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { dot, type GridCell, length, R, sub } from '@/island/shared/globe';

import { TILE_GRID as GRID, tileId, tileSide } from './tile';
import { fillTile } from './tile-fill';
import { borderLoop, tileBuffers } from './tile-mesh';
import {
  assertFlatMesh,
  horizontal,
  middleOf,
  normal,
  read,
  world,
} from './tile-mesh.test-kit';

const FLOAT32 = 2 ** -23;

const hills = (x: number, y: number) =>
  300 * Math.sin(x / 1700) * Math.cos(y / 2300) + 0.01 * x;

describe('fillTile', () => {
  const key: GridCell = { level: 10, x: 512, y: 515 };
  const mesh = fillTile(key, hills);
  const vertices = GRID * GRID + 4 * (GRID - 1);

  it('fills a grid and its skirt into separate typed arrays', () => {
    assert.equal(mesh.grid, GRID);
    assert.equal(mesh.positions.length, vertices * 3);
    assert.equal(mesh.normals.length, vertices * 3);
    assert.equal(mesh.heights.length, vertices);
    assert.ok(mesh.centre instanceof Float64Array);
    assert.ok(mesh.indices instanceof Uint16Array);
    assert.equal(mesh.indices.length, ((GRID - 1) ** 2 + 4 * (GRID - 1)) * 6);
    assert.equal(new Set(tileBuffers(mesh)).size, 5);
    assert.ok(mesh.indices.every((i) => i < vertices));
  });

  for (const [side, neighbour, edge] of [
    [
      'east',
      { ...key, x: key.x + 1 },
      (k: number) => [k * GRID + GRID - 1, k * GRID] as const,
    ],
    [
      'north',
      { ...key, y: key.y + 1 },
      (k: number) => [(GRID - 1) * GRID + k, k] as const,
    ],
  ] as const) {
    it(`shares its ${side} edge with its neighbour, position and normal`, () => {
      const other = fillTile(neighbour, hills);
      const tolerance = 4 * FLOAT32 * tileSide(key.level);
      for (let k = 0; k < GRID; k++) {
        const [a, b] = edge(k);
        const gap = length(sub(world(mesh, a), world(other, b)));
        assert.ok(gap <= tolerance, `${tileId(neighbour)} ${k}: ${gap} m`);
        assert.equal(read(mesh.heights, a), read(other.heights, b));
        assert.ok(dot(normal(mesh, a), normal(other, b)) > 1 - 1e-6);
      }
    });
  }

  it('hangs its skirt below the border, flared a cell outside the tile', () => {
    const cell = tileSide(key.level) / (GRID - 1);
    const middle = middleOf(mesh);
    for (const [n, top] of borderLoop(GRID).entries()) {
      const border = world(mesh, top);
      const skirt = world(mesh, GRID * GRID + n);
      const depth = length(border) - length(skirt);
      assert.ok(Math.abs(depth - 2 * cell) < 0.1, `skirt ${n}: ${depth} m`);
      const sunk =
        read(mesh.heights, top) - read(mesh.heights, GRID * GRID + n);
      assert.ok(Math.abs(sunk - depth) < 0.1);
      // Diagonally at a corner, so a cell along each axis, √2 cells across.
      const corner = n % (GRID - 1) === 0;
      const step = horizontal(sub(skirt, border), border);
      const flare = length(step);
      const expected = corner ? Math.SQRT2 * cell : cell;
      assert.ok(
        Math.abs(flare - expected) < 0.02 * cell,
        `skirt ${n}: ${flare} m`,
      );
      assert.ok(
        dot(step, horizontal(sub(border, middle), border)) > 0,
        `skirt ${n}`,
      );
    }
  });

  it('points normals outward on flat ground, and winds every face outward', () => {
    assertFlatMesh(fillTile(key, () => 0));
  });

  it('keeps vertices on the sphere at their height', () => {
    for (let v = 0; v < GRID * GRID; v++) {
      const above = length(world(mesh, v)) - R - read(mesh.heights, v);
      assert.ok(Math.abs(above) < 4 * FLOAT32 * tileSide(10));
    }
  });

  it('fills the deepest level at about a metre spacing near the island', () => {
    const deep = fillTile({ level: 18, x: 131_072, y: 131_072 }, hills);
    const spacing = length(sub(world(deep, 1), world(deep, 0)));
    assert.ok(spacing > 0.9 && spacing < 1.5, `${spacing}`);
  });
});

describe('borderLoop', () => {
  it('walks every border vertex once, counter-clockwise from the south-west', () => {
    assert.deepEqual(borderLoop(3), [0, 1, 2, 5, 8, 7, 6, 3]);
  });
});
