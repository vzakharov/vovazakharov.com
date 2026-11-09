import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CENTRE,
  type CubeCell,
  type Face,
  faceToSphere,
  neighbour,
  R,
  scaled,
  sphereToFace,
  sub,
  sum,
  unit,
  type Vec3,
} from '@/island/shared/globe';

import { cubeTileId, cubeTileSide, faceLattice, TILE_GRID } from '../../tile';
import { cubeDetailCut } from './cube-detail';
import { selectCubeTiles } from './cube-quadtree';
import { disc, eyeOver, holds, PLACES } from './cube-quadtree.test-kit';

const CELLS = TILE_GRID - 1;
const twoSpacings = (key: CubeCell) => (2 * cubeTileSide(key)) / CELLS;

/** The tile's lattice points, every `stride`-th along each side. */
function lattice(key: CubeCell, stride: number): Vec3[] {
  const points: Vec3[] = [];
  for (let j = 0; j <= CELLS; j += stride) {
    for (let i = 0; i <= CELLS; i += stride) {
      points.push(
        faceToSphere(
          key.face,
          faceLattice(key.level, CELLS, key.x * CELLS + i),
          faceLattice(key.level, CELLS, key.y * CELLS + j),
        ),
      );
    }
  }
  return points;
}

/** Leaf pairs, finer first, that share an edge across one level. */
function steps(
  tiles: readonly CubeCell[],
): Array<readonly [CubeCell, CubeCell]> {
  const ids = new Map(tiles.map((key) => [cubeTileId(key), key]));
  return tiles.flatMap((fine) =>
    (['right', 'left', 'up', 'down'] as const).flatMap((direction) => {
      const { face, level, x, y } = neighbour(fine, direction);
      const coarse = ids.get(
        cubeTileId({ face, level: level - 1, x: x >> 1, y: y >> 1 }),
      );
      return coarse === undefined ? [] : [[fine, coarse] as const];
    }),
  );
}

describe('cubeDetailCut at the nadir', () => {
  for (const [place, direction] of PLACES) {
    for (const height of [20_000_000, 1_000_000, 10_000, 100]) {
      it(`asks what the nadir tile holds from ${height} m over ${place}`, () => {
        const eye = eyeOver(direction, height);
        const nadir = selectCubeTiles(eye, { coast: disc }).filter((key) =>
          holds(key, direction),
        );
        const widest = Math.max(...nadir.map((key) => twoSpacings(key)));
        const cut = cubeDetailCut(eye, disc)(unit(direction));
        assert.ok(cut >= widest * (1 - 1e-12), `${cut} < ${widest}`);
        // A coarser neighbour's cap may reach a little past its tile.
        assert.ok(cut <= 2 * widest, `${cut} vs ${widest}`);
      });
    }
  }
});

describe('cubeDetailCut', () => {
  for (const [place, direction] of PLACES.slice(0, 3)) {
    it(`never asks finer than a tile the selection draws, over ${place}`, () => {
      const eye = eyeOver(direction, 10_000);
      const cut = cubeDetailCut(eye, disc);
      for (const key of selectCubeTiles(eye, { coast: disc })) {
        const least = twoSpacings(key) * (1 - 1e-9);
        for (const p of lattice(key, 8)) {
          assert.ok(cut(p) >= least, cubeTileId(key));
        }
      }
    });
  }

  it('never cuts finer than the coarser of two neighbours draws, across faces too', () => {
    // Off the edge, so the levels on its two sides differ.
    const eye = eyeOver(faceToSphere('px', 0.995, 0.3), 1000);
    const cut = cubeDetailCut(eye);
    const pairs = steps(selectCubeTiles(eye));
    assert.ok(pairs.some(([fine, coarse]) => fine.face !== coarse.face));
    for (const [, coarse] of pairs.slice(0, 40)) {
      const least = twoSpacings(coarse) * (1 - 1e-9);
      for (const p of lattice(coarse, 4)) {
        assert.ok(cut(p) >= least, cubeTileId(coarse));
      }
    }
  });
});

/**
 * Pairs of directions `gap` metres apart straddling the `right` edge of
 * `face`, at `count` places along it, and the faces each lands on.
 */
function straddling(
  face: Face,
  count: number,
  gap: number,
  [from, to] = [-0.99, 0.99],
) {
  return Array.from({ length: count }, (_, k) => {
    const along = from + ((to - from) * k) / (count - 1);
    const edge = faceToSphere(face, 1, along);
    const across = unit(sub(edge, faceToSphere(face, 1 - 1e-6, along)));
    const half = gap / 2 / R;
    return [
      unit(sum(edge, scaled(across, -half))),
      unit(sum(edge, scaled(across, half))),
    ] as const;
  });
}

describe('cubeDetailCut across a face edge', () => {
  const edge = faceToSphere('px', 1, 0.3);

  for (const height of [10_000, 1_000_000]) {
    it(`differs by under 1e-6 relative 1 mm across it, from ${height} m`, () => {
      const cut = cubeDetailCut(eyeOver(edge, height), disc);
      let worst = 0;
      for (const [inside, outside] of straddling('px', 2001, 1e-3)) {
        assert.notEqual(sphereToFace(inside).face, sphereToFace(outside).face);
        const a = cut(inside);
        const b = cut(outside);
        worst = Math.max(worst, Math.abs(a - b) / Math.max(a, b));
      }
      assert.ok(worst < 1e-6, `${worst}`);
    });
  }

  it('changes no faster than its ramp 1 mm across it, from 2 m', () => {
    const cut = cubeDetailCut(eyeOver(edge, 2));
    // A leaf's ramp falls by its twice-spacing over half its side.
    const steepest = (2 * 2) / CELLS;
    // Densest where the leaves are finest, under the eye.
    for (const [inside, outside] of straddling(
      'px',
      2001,
      1e-3,
      [0.299, 0.301],
    )) {
      const step = Math.abs(cut(inside) - cut(outside));
      assert.ok(step <= steepest * 1e-3 * 1.01, `${step}`);
    }
  });
});

describe('the cut stays where the eye is', () => {
  it('asks the finest level only near the eye', () => {
    const cut = cubeDetailCut(eyeOver(CENTRE, 2));
    assert.ok(cut(CENTRE) < 3);
    // Past the horizon the leaves are the roots: ~2 500 km, ~78 km spacings.
    assert.ok(cut(faceToSphere('nx', 0, 0)) > 50_000);
  });
});
