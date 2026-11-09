import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type CubeCell,
  DIRECTIONS,
  dot,
  FACES,
  length,
  neighbour,
  R,
  sub,
  type Vec3,
} from '@/island/shared/globe';

import {
  type CubeHeightSample,
  type CubeLattice,
  cubeLevelSpacing,
  fillCubeTile,
  sampleCubeLattice,
} from './cube-fill';
import { cubeTileId } from './cube-tile';
import { fillTile } from './tile-fill';
import { borderLoop, entry, ringAt, type TileMesh } from './tile-mesh';
import {
  assertFlatMesh,
  horizontal,
  middleOf,
  normal,
  read,
  world,
} from './tile-mesh.test-kit';

const GRID = 17;
const CELLS = GRID - 1;

/** Steep relief over the whole sphere, reading `finest` so a cut that differed would show. */
const hills: CubeHeightSample = ([x, y, z], finest) =>
  4000 * Math.sin(40 * x + 13 * y) * Math.cos(37 * z) +
  900 * Math.sin(300 * y - 170 * z) +
  1e-3 * finest;

const options = { grid: GRID };

/** A bit-exact name for a direction, so a map keyed on it matches only equal points. */
const bits = (p: Vec3) =>
  p.map((c) => (Object.is(c, -0) ? '-0' : `${c}`)).join(',');

/** The tile's grid vertices: index, lattice direction and height. */
function gridPoints(lattice: CubeLattice) {
  const points: Array<{ v: number; p: Vec3; height: number }> = [];
  for (let j = 0; j < GRID; j++) {
    for (let i = 0; i < GRID; i++) {
      const n = (j + 1) * lattice.ring + i + 1;
      points.push({
        v: j * GRID + i,
        p: ringAt(lattice, i, j),
        height: entry(lattice.heights, n),
      });
    }
  }
  return points;
}

type Filled = {
  readonly key: CubeCell;
  readonly lattice: CubeLattice;
  readonly mesh: TileMesh<CubeCell>;
};

const filled = (key: CubeCell): Filled => ({
  key,
  lattice: sampleCubeLattice(key, hills, options),
  mesh: fillCubeTile(key, hills, options),
});

function assertNormalsAgree(a: TileMesh, va: number, b: TileMesh, vb: number) {
  const [na, nb] = [normal(a, va), normal(b, vb)];
  for (let c = 0; c < 3; c++) {
    const gap = Math.abs(read(na, c) - read(nb, c));
    assert.ok(gap <= 1e-6, `normal ${va}/${vb}: ${gap}`);
  }
}

/**
 * Asserts that `a` and `b` share exactly `count` grid vertices — found by
 * bit-equal direction, at bit-equal heights — and agree on their normals.
 */
function assertShared(a: Filled, b: Filled, count: number) {
  const theirs = new Map(gridPoints(b.lattice).map((q) => [bits(q.p), q]));
  let shared = 0;
  for (const { v, p, height } of gridPoints(a.lattice)) {
    const match = theirs.get(bits(p));
    if (match === undefined) continue;
    shared++;
    assert.ok(Object.is(height, match.height), `height at ${v}`);
    assertNormalsAgree(a.mesh, v, b.mesh, match.v);
  }
  assert.equal(shared, count, `${cubeTileId(a.key)} | ${cubeTileId(b.key)}`);
}

const last = (level: number) => 2 ** level - 1;

describe('fillCubeTile', () => {
  it('shares an edge within a face: bit-equal points and heights, normals to 1e-6', () => {
    const key: CubeCell = { face: 'pz', level: 9, x: 200, y: 311 };
    const tile = filled(key);
    for (const direction of DIRECTIONS) {
      assertShared(tile, filled(neighbour(key, direction)), GRID);
    }
  });

  it('shares every face edge, both ways, at several places along it', () => {
    const level = 4;
    const along = [0, 5, last(level)];
    for (const face of FACES) {
      for (const direction of DIRECTIONS) {
        for (const k of along) {
          const edge = direction === 'left' ? 0 : last(level);
          const off = direction === 'down' ? 0 : last(level);
          const key: CubeCell =
            direction === 'left' || direction === 'right'
              ? { face, level, x: edge, y: k }
              : { face, level, x: k, y: off };
          const other = neighbour(key, direction);
          assert.notEqual(other.face, face);
          assertShared(filled(key), filled(other), GRID);
        }
      }
    }
  });

  it('shares a face edge at the deepest levels', () => {
    for (const level of [12, 17]) {
      const key: CubeCell = { face: 'px', level, x: last(level), y: 1234 };
      assertShared(filled(key), filled(neighbour(key, 'right')), GRID);
    }
  });

  it('agrees at each cube corner across its three tiles', () => {
    const level = 3;
    const corners = [0, last(level)];
    const byCorner = new Map<string, Array<{ tile: Filled; v: number }>>();
    for (const face of FACES) {
      for (const x of corners) {
        for (const y of corners) {
          const tile = filled({ face, level, x, y });
          for (const v of [0, CELLS, CELLS * GRID, GRID * GRID - 1]) {
            const p = ringAt(tile.lattice, v % GRID, Math.floor(v / GRID));
            const name = bits(p);
            byCorner.set(name, [...(byCorner.get(name) ?? []), { tile, v }]);
          }
        }
      }
    }
    // Three tiles at each cube corner; two at a corner tile's far corner on a
    // face edge, where it meets the corner tile across.
    const meeting = [...byCorner.values()].filter((g) => g.length > 1);
    assert.equal(meeting.filter((g) => g.length === 3).length, 8);
    assert.equal(meeting.filter((g) => g.length === 2).length, 24);
    for (const group of meeting) {
      const [first, ...rest] = group;
      assert.ok(first !== undefined);
      const height = read(first.tile.mesh.heights, first.v);
      for (const { tile, v } of rest) {
        assert.equal(read(tile.mesh.heights, v), height);
        assertNormalsAgree(first.tile.mesh, first.v, tile.mesh, v);
      }
    }
  });

  it('takes a cube corner’s missing ring point from both ring neighbours alike', () => {
    for (const face of FACES) {
      const { ring, points } = sampleCubeLattice(
        { face, level: 2, x: 0, y: 0 },
        hills,
        options,
      );
      const lattice = { ring, points };
      const corner = bits(ringAt(lattice, -1, -1));
      assert.equal(bits(ringAt(lattice, -1, 0)), corner);
      assert.equal(bits(ringAt(lattice, 0, -1)), corner);
    }
  });

  it('cuts relief at one spacing per level, the widest cell anywhere on it', () => {
    let finest = 0;
    sampleCubeLattice({ face: 'py', level: 6, x: 0, y: 31 }, (_, cut) => {
      finest = cut;
      return 0;
    });
    assert.equal(finest, 2 * cubeLevelSpacing(6, 64));
    const corner = fillCubeTile({ face: 'py', level: 6, x: 0, y: 0 }, () => 0);
    const step = length(sub(world(corner, 1), world(corner, 0)));
    assert.ok(step < cubeLevelSpacing(6, 64), `${step} m`);
  });
});

describe('fillCubeTile at sea level', () => {
  const keys: CubeCell[] = [
    { face: 'nx', level: 10, x: 400, y: 600 },
    { face: 'py', level: 5, x: last(5), y: 7 },
    { face: 'nz', level: 2, x: 0, y: last(2) },
  ];

  for (const key of keys) {
    const sea = fillCubeTile(key, () => 0);
    const grid = sea.grid;
    const depth = 2 * cubeLevelSpacing(key.level, grid - 1);

    it(`${cubeTileId(key)}: lays the planar layout, normals up, faces outward`, () => {
      const planar = fillTile(key, () => 0);
      assert.equal(sea.positions.length, planar.positions.length);
      assert.deepEqual(sea.indices, planar.indices);
      assertFlatMesh(sea);
    });

    it(`${cubeTileId(key)}: holds the grid at sea level and the skirt below it`, () => {
      const middle = middleOf(sea);
      assert.ok(Math.abs(length(middle) - R) < 1e-6);
      for (let v = 0; v < grid * grid; v++) {
        assert.equal(read(sea.heights, v), 0);
        const off = length(world(sea, v)) - R;
        assert.ok(Math.abs(off) < 2 ** -23 * 4 * depth * grid, `${v}: ${off}`);
      }
      for (const [n, top] of borderLoop(grid).entries()) {
        const border = world(sea, top);
        const skirt = world(sea, grid * grid + n);
        const sunk = length(border) - length(skirt);
        assert.ok(Math.abs(sunk - depth) < 1e-3 * depth, `skirt ${n}`);
        assert.equal(read(sea.heights, grid * grid + n), Math.fround(-depth));
        const step = horizontal(sub(skirt, border), border);
        assert.ok(dot(step, horizontal(sub(border, middle), border)) > 0);
      }
    });
  }
});
