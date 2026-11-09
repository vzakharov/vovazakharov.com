import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cross,
  type CubeCell,
  type Direction,
  DIRECTIONS,
  dot,
  FACES,
  length,
  neighbour,
  R,
  scaled,
  sub,
  sum,
  unit,
  type Vec3,
} from '@/island/shared/globe';

import {
  type CubeHeightSample,
  type CubeLattice,
  fillCubeTile,
  sampleCubeLattice,
} from './cube-fill';
import {
  type Corner,
  fillStitchedCubeTile,
  type NeighbourLevels,
  stitchCubeLattice,
} from './cube-stitch';
import { cubeTileId } from './cube-tile';
import { entry, ringAt, type TileMesh } from './tile-mesh';
import { normal, read } from './tile-mesh.test-kit';

const GRID = 17;
const CELLS = GRID - 1;
const options = { grid: GRID };

/** Steep relief reading `finest`, so a vertex sampled at the wrong cut shows. */
const hills: CubeHeightSample = ([x, y, z], finest) =>
  4000 * Math.sin(40 * x + 13 * y) * Math.cos(37 * z) +
  900 * Math.sin(300 * y - 170 * z) +
  0.37 * finest;

const bits = (p: Vec3) =>
  p.map((c) => (Object.is(c, -0) ? '-0' : `${c}`)).join(',');

const CORNERS_OF: Record<Direction, readonly Corner[]> = {
  left: ['sw', 'nw'],
  right: ['se', 'ne'],
  down: ['sw', 'se'],
  up: ['nw', 'ne'],
};

/** Every edge and corner at `key`'s own level but those named coarser. */
function levelsOf(
  key: CubeCell,
  edges: Partial<Record<Direction, number>>,
  corners: Partial<Record<Corner, number>> = {},
): NeighbourLevels {
  const own = key.level;
  const merged = { sw: own, se: own, nw: own, ne: own, ...corners };
  for (const direction of DIRECTIONS) {
    const level = edges[direction];
    if (level === undefined) continue;
    for (const corner of CORNERS_OF[direction]) {
      merged[corner] = Math.min(merged[corner], level);
    }
  }
  return {
    edges: { left: own, right: own, up: own, down: own, ...edges },
    corners: merged,
  };
}

type Tile = {
  readonly key: CubeCell;
  readonly lattice: CubeLattice;
  readonly mesh: TileMesh<CubeCell>;
};

const plain = (key: CubeCell): Tile => ({
  key,
  lattice: sampleCubeLattice(key, hills, options),
  mesh: fillCubeTile(key, hills, options),
});

function stitched(key: CubeCell, levels: NeighbourLevels): Tile {
  const lattice = sampleCubeLattice(key, hills, options);
  stitchCubeLattice(key, lattice, levels, hills, options);
  return {
    key,
    lattice,
    mesh: fillStitchedCubeTile(key, hills, levels, options),
  };
}

/** A grid vertex's world point, lifted as the fill lifts it. */
function vertex(tile: Tile, v: number) {
  const [i, j] = [v % GRID, Math.floor(v / GRID)];
  const height = entry(
    tile.lattice.heights,
    (j + 1) * tile.lattice.ring + i + 1,
  );
  return scaled(ringAt(tile.lattice, i, j), R + height);
}

const borderOf = (direction: Direction) =>
  Array.from({ length: GRID }, (_, k) => {
    const last = GRID - 1;
    if (direction === 'left') return k * GRID;
    if (direction === 'right') return k * GRID + last;
    if (direction === 'down') return k;
    return last * GRID + k;
  });

function assertNormalsAgree(a: Vec3, b: Vec3, what: string) {
  const gap = Math.max(...a.map((c, n) => Math.abs(c - read(b, n))));
  assert.ok(gap <= 1e-6, `${what}: normal ${gap}`);
}

/** Metres from `p` to the segment `a`–`b`. */
function offSegment(p: Vec3, a: Vec3, b: Vec3) {
  const d = sub(b, a);
  const t = dot(sub(p, a), d) / dot(d, d);
  assert.ok(t > 0 && t < 1, `beyond the segment: ${t}`);
  return length(cross(sub(p, a), unit(d)));
}

/**
 * Asserts `fine`'s `direction` border lies on `coarse`'s: the vertices they
 * share bit-equal in position, the rest on the chord between them; normals
 * as the coarse tile lights there.
 */
function assertStitched(fine: Tile, coarse: Tile, direction: Direction) {
  const theirs = new Map(
    Array.from({ length: GRID * GRID }, (_, v) => [bits(vertex(coarse, v)), v]),
  );
  const border = borderOf(direction);
  const onCoarse = border.map((v) => theirs.get(bits(vertex(fine, v))));
  const shared = onCoarse.filter((v) => v !== undefined).length;
  assert.equal(shared, CELLS / 2 + 1, `${cubeTileId(fine.key)} ${direction}`);
  for (const [k, v] of border.entries()) {
    const match = onCoarse[k];
    if (match !== undefined) {
      assertNormalsAgree(
        normal(fine.mesh, v),
        normal(coarse.mesh, match),
        `${v}`,
      );
      continue;
    }
    const before = onCoarse[k - 1];
    const after = onCoarse[k + 1];
    assert.ok(before !== undefined && after !== undefined, `odd ${k}`);
    const gap = offSegment(
      vertex(fine, v),
      vertex(coarse, before),
      vertex(coarse, after),
    );
    assert.ok(gap < 1e-6, `${v}: ${gap} m off the chord`);
    const halfway = unit(
      sum(normal(coarse.mesh, before), normal(coarse.mesh, after)),
    );
    assertNormalsAgree(normal(fine.mesh, v), halfway, `${v} halfway`);
  }
}

const parentOf = (key: CubeCell): CubeCell => ({
  ...key,
  level: key.level - 1,
  x: key.x >> 1,
  y: key.y >> 1,
});

describe('stitchCubeLattice', () => {
  it('lays a border on a coarser neighbour’s within a face', () => {
    for (const direction of DIRECTIONS) {
      const key: CubeCell = { face: 'pz', level: 9, x: 201, y: 310 };
      // The child of its parent whose `direction` edge is the parent's.
      const fine: CubeCell = {
        ...key,
        x: direction === 'left' ? 200 : direction === 'right' ? 201 : key.x,
        y: direction === 'down' ? 310 : direction === 'up' ? 311 : key.y,
      };
      const coarse = neighbour(parentOf(fine), direction);
      assert.equal(coarse.face, 'pz');
      const levels = levelsOf(fine, { [direction]: 8 });
      assertStitched(stitched(fine, levels), plain(coarse), direction);
    }
  });

  it('lays a border on a coarser neighbour’s across every face edge', () => {
    const level = 4;
    const last = 2 ** level - 1;
    for (const face of FACES) {
      for (const direction of DIRECTIONS) {
        for (const along of [0, 6, 9, last]) {
          const fine: CubeCell =
            direction === 'left' || direction === 'right'
              ? { face, level, x: direction === 'left' ? 0 : last, y: along }
              : { face, level, x: along, y: direction === 'down' ? 0 : last };
          const coarse = neighbour(parentOf(fine), direction);
          assert.notEqual(coarse.face, face);
          const levels = levelsOf(fine, { [direction]: level - 1 });
          assertStitched(stitched(fine, levels), plain(coarse), direction);
        }
      }
    }
  });

  it('leaves a tile no coarser tile meets as `fillCubeTile` fills it', () => {
    const key: CubeCell = { face: 'ny', level: 7, x: 33, y: 90 };
    assert.deepEqual(
      fillStitchedCubeTile(key, hills, levelsOf(key, {}), options),
      fillCubeTile(key, hills, options),
    );
  });

  it('takes a corner from a coarser tile meeting it there alone', () => {
    // The south-west child's south-west corner, two levels coarser diagonally.
    const fine: CubeCell = { face: 'nx', level: 10, x: 400, y: 600 };
    const diagonal: CubeCell = { face: 'nx', level: 8, x: 99, y: 149 };
    const tile = stitched(fine, levelsOf(fine, {}, { sw: 8 }));
    const theirs = plain(diagonal);
    const ne = GRID * GRID - 1;
    assert.equal(bits(vertex(tile, 0)), bits(vertex(theirs, ne)));
    assertNormalsAgree(normal(tile.mesh, 0), normal(theirs.mesh, ne), 'corner');
    const own = plain(fine);
    for (const v of [1, GRID, GRID + 1]) {
      assert.equal(bits(vertex(tile, v)), bits(vertex(own, v)));
    }
  });

  it('refuses an edge more than one level coarser', () => {
    const key: CubeCell = { face: 'px', level: 6, x: 10, y: 10 };
    assert.throws(() => stitched(key, levelsOf(key, { up: 4 })), RangeError);
  });
});
