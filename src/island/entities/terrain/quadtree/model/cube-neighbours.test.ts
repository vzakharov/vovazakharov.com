import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type CubeCell,
  type Direction,
  DIRECTIONS,
  FACES,
  faceToSphere,
  length,
  scaled,
  sphereToFace,
  sub,
  sum,
  unit,
  type Vec3,
} from '@/island/shared/globe';

import {
  type Corner,
  cubeTileId,
  faceLattice,
  type NeighbourLevels,
  tileCap,
  tileHolds,
} from '../../tile';
import { diagonal, neighbourLevels } from './cube-neighbours';
import { selectCubeTiles } from './cube-quadtree';
import { eyeOver, PLACES } from './cube-quadtree.test-kit';

/** The sphere point at lattice corner `(i, j)` of `key`, each 0 or 1. */
const cornerPoint = ({ face, level, x, y }: CubeCell, i: number, j: number) =>
  faceToSphere(
    face,
    faceLattice(level, 1, x + i),
    faceLattice(level, 1, y + j),
  );

const CORNER_SPOTS: Readonly<Record<Corner, readonly [number, number]>> = {
  sw: [0, 0],
  se: [1, 0],
  nw: [0, 1],
  ne: [1, 1],
};

const close = (a: Vec3, b: Vec3) => length(sub(a, b)) < 1e-12;

const touches = (key: CubeCell, p: Vec3) =>
  [0, 1].some((i) => [0, 1].some((j) => close(cornerPoint(key, i, j), p)));

/** Whether leaf `key` holds `p` in its closure: `p` nudged toward its middle lands in it. */
const closureHolds = (key: CubeCell, p: Vec3) => {
  const centre = tileCap(key).centre;
  const nudged = unit(sum(p, scaled(sub(centre, p), 1e-9)));
  return tileHolds(key, sphereToFace(nudged));
};

/** A brute-force `NeighbourLevels`: every leaf reaching each corner or each edge's quarter points. */
function oracle(key: CubeCell, leaves: readonly CubeCell[]): NeighbourLevels {
  const coarsest = (points: readonly Vec3[]) =>
    Math.min(
      key.level,
      ...leaves
        .filter((leaf) => points.some((p) => closureHolds(leaf, p)))
        .map((leaf) => leaf.level),
    );
  const centre = tileCap(key).centre;
  /** A point on the edge between two corners, pushed just past it. */
  const past = (a: Vec3, b: Vec3, t: number) => {
    const onEdge = unit(sum(scaled(a, 1 - t), scaled(b, t)));
    return unit(sum(onEdge, scaled(sub(onEdge, centre), 1e-9)));
  };
  const edgePoints = (
    [i0, j0]: readonly [number, number],
    [i1, j1]: readonly [number, number],
  ) => {
    const a = cornerPoint(key, i0, j0);
    const b = cornerPoint(key, i1, j1);
    return [past(a, b, 0.25), past(a, b, 0.75)];
  };
  const { sw, se, nw, ne } = CORNER_SPOTS;
  const edges: Record<Direction, Vec3[]> = {
    left: edgePoints(sw, nw),
    right: edgePoints(se, ne),
    down: edgePoints(sw, se),
    up: edgePoints(nw, ne),
  };
  const corner = (c: Corner) =>
    coarsest([cornerPoint(key, ...CORNER_SPOTS[c])]);
  return {
    edges: {
      right: coarsest(edges.right),
      left: coarsest(edges.left),
      up: coarsest(edges.up),
      down: coarsest(edges.down),
    },
    corners: {
      sw: corner('sw'),
      se: corner('se'),
      nw: corner('nw'),
      ne: corner('ne'),
    },
  };
}

const assertMatchesOracle = (leaves: readonly CubeCell[]) => {
  const levels = neighbourLevels(leaves);
  for (const key of leaves) {
    assert.deepEqual(
      levels.get(cubeTileId(key)),
      oracle(key, leaves),
      cubeTileId(key),
    );
  }
  return levels;
};

describe('diagonal', () => {
  it('touches the corner it steps around, on every face and across every edge', () => {
    const level = 2;
    for (const face of FACES) {
      for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
          const key = { face, level, x, y };
          for (const [corner, [i, j]] of Object.entries(CORNER_SPOTS)) {
            const u: Direction = i === 0 ? 'left' : 'right';
            const v: Direction = j === 0 ? 'down' : 'up';
            const p = cornerPoint(key, i, j);
            for (const cell of [diagonal(key, u, v), diagonal(key, v, u)]) {
              assert.ok(
                touches(cell, p),
                `${cubeTileId(key)} ${corner} -> ${cubeTileId(cell)}`,
              );
            }
          }
        }
      }
    }
  });
});

describe('neighbourLevels', () => {
  it('counts a coarser leaf across a face edge and diagonally across a face corner', () => {
    // pz split once: its (1,1) child splits again, so the child at (0,0) of
    // that meets the coarser children on its sides and diagonally.
    const leaves: CubeCell[] = [
      ...FACES.filter((face) => face !== 'pz').map((face) => ({
        face,
        level: 0,
        x: 0,
        y: 0,
      })),
      { face: 'pz', level: 1, x: 0, y: 0 },
      { face: 'pz', level: 1, x: 1, y: 0 },
      { face: 'pz', level: 1, x: 0, y: 1 },
      ...[0, 1].flatMap((x) =>
        [0, 1].map((y) => ({
          face: 'pz' as const,
          level: 2,
          x: 2 + x,
          y: 2 + y,
        })),
      ),
    ];
    const levels = assertMatchesOracle(leaves);
    // The top-right level-2 tile sits at pz's corner: its right and up edges
    // meet level-0 faces, its ne corner the cube corner.
    assert.deepEqual(
      levels.get(cubeTileId({ face: 'pz', level: 2, x: 3, y: 3 })),
      {
        edges: { right: 0, left: 2, up: 0, down: 2 },
        corners: { sw: 2, se: 0, nw: 0, ne: 0 },
      },
    );
    // The inner level-2 tile meets the level-1 tiles only at its corners
    // and edges toward them.
    assert.deepEqual(
      levels.get(cubeTileId({ face: 'pz', level: 2, x: 2, y: 2 })),
      {
        edges: { right: 2, left: 1, up: 2, down: 1 },
        corners: { sw: 1, se: 1, nw: 1, ne: 2 },
      },
    );
  });

  for (const [name, at] of PLACES) {
    for (const height of [10_000, 1_000_000]) {
      it(`matches a brute-force reading of the selection at ${name}, ${height} m`, () => {
        assertMatchesOracle(selectCubeTiles(eyeOver(at, height)));
      });
    }
  }
});
