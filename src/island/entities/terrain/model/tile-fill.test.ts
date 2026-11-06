import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { R, type Vec3 } from '@/island/shared/globe';

import { tileId, type TileKey, tileSide } from './tile';
import { fillTile, tileBuffers, type TileMesh } from './tile-fill';

const GRID = 33;
const FLOAT32 = 2 ** -23;

const hills = (x: number, y: number) =>
  300 * Math.sin(x / 1700) * Math.cos(y / 2300) + 0.01 * x;

function read(array: ArrayLike<number>, index: number): number {
  const value = array[index];
  assert.ok(value !== undefined, `index ${index} of ${array.length}`);
  return value;
}

const triple = (f: (c: 0 | 1 | 2) => number): Vec3 => [f(0), f(1), f(2)];

const world = (mesh: TileMesh, v: number) =>
  triple((c) => read(mesh.centre, c) + read(mesh.positions, v * 3 + c));

const normal = (mesh: TileMesh, v: number) =>
  triple((c) => read(mesh.normals, v * 3 + c));

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a: Vec3, b: Vec3) => triple((c) => a[c] - b[c]);
const length = (a: Vec3) => Math.hypot(...a);
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

const triangles = (mesh: TileMesh) =>
  Array.from({ length: mesh.indices.length / 3 }, (_, t) =>
    triple((c) => read(mesh.indices, t * 3 + c)),
  );

describe('fillTile', () => {
  const key: TileKey = { level: 10, x: 512, y: 515 };
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

  it('hangs its skirt below the border', () => {
    // The skirt's first vertex sits under the south-west corner.
    const corner = world(mesh, 0);
    const skirt = world(mesh, GRID * GRID);
    const depth = length(corner) - length(skirt);
    assert.ok(Math.abs(depth - (2 * tileSide(key.level)) / (GRID - 1)) < 0.1);
    assert.ok(dot(sub(corner, skirt), corner) > 0.999 * depth * length(corner));
    const sunk = read(mesh.heights, 0) - read(mesh.heights, GRID * GRID);
    assert.ok(Math.abs(sunk - depth) < 0.1);
  });

  it('points normals outward on flat ground, and winds every face outward', () => {
    const flat = fillTile(key, () => 0);
    for (let v = 0; v < vertices; v++) {
      const p = world(flat, v);
      const up = triple((c) => p[c] / length(p));
      assert.ok(dot(normal(flat, v), up) > 1 - 1e-6, `vertex ${v}`);
    }
    const middle = triple((c) => read(flat.centre, c));
    for (const [a, b, c] of triangles(flat)) {
      const [pa, pb, pc] = [world(flat, a), world(flat, b), world(flat, c)];
      const face = cross(sub(pb, pa), sub(pc, pa));
      const centroid = triple((i) => (pa[i] + pb[i] + pc[i]) / 3);
      const skirt = Math.max(a, b, c) >= GRID * GRID;
      // A grid face faces up; a skirt face faces away from the tile's middle.
      const toward = skirt ? sub(centroid, middle) : centroid;
      assert.ok(dot(face, toward) > 0, `triangle ${a} ${b} ${c}`);
    }
  });

  it('keeps vertices on the sphere at their height', () => {
    for (let v = 0; v < GRID * GRID; v++) {
      const above = length(world(mesh, v)) - R - read(mesh.heights, v);
      assert.ok(Math.abs(above) < 4 * FLOAT32 * tileSide(10));
    }
  });

  it('fills the deepest level at metre spacing near the island', () => {
    const deep = fillTile({ level: 17, x: 65_536, y: 65_536 }, hills);
    const spacing = length(sub(world(deep, 1), world(deep, 0)));
    assert.ok(spacing > 1 && spacing < 2.5, `${spacing}`);
  });
});
