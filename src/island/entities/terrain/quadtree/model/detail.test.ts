import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Coast, type GridCell, planeToWorld } from '@/island/shared/globe';

import { buildCoastField } from '../../coast-field';
import { heightAt } from '../../height';
import { fillTile, TILE_GRID, tileId, tileRect, tileSide } from '../../tile';
import {
  type HeightSample,
  latticeCoordinate,
} from '../../tile/index.test-only';
import { detailCut } from './detail';
import { selectTiles } from './quadtree';

/** A disc of radius 1 000 km around the centre. */
const DISC: Coast = {
  kmPerPixel: 4,
  rings: [
    Array.from({ length: 720 }, (_, k): [number, number] => {
      const angle = (2 * Math.PI * k) / 720;
      return [1000 * Math.cos(angle), 1000 * Math.sin(angle)];
    }),
  ],
};

const field = buildCoastField(DISC);
const sample: HeightSample = (x, y, finest) => heightAt(field, 7, x, y, finest);
const CELLS = TILE_GRID - 1;

/** Each grid vertex's height, by its plane point. */
function gridHeights(
  key: GridCell,
  finest?: (x: number, y: number) => number,
): Map<string, number> {
  const mesh = fillTile(key, sample, finest === undefined ? {} : { finest });
  const heights = new Map<string, number>();
  for (let j = 0; j < TILE_GRID; j++) {
    for (let i = 0; i < TILE_GRID; i++) {
      const x = latticeCoordinate(key.level, CELLS, key.x * CELLS + i);
      const y = latticeCoordinate(key.level, CELLS, key.y * CELLS + j);
      const height = mesh.heights[j * TILE_GRID + i];
      assert.ok(height !== undefined);
      heights.set(`${String(x)},${String(y)}`, height);
    }
  }
  return heights;
}

/** Leaf pairs, finer first, that share an edge across one level. */
function steps(
  tiles: readonly GridCell[],
): Array<readonly [GridCell, GridCell]> {
  const ids = new Map(tiles.map((key) => [tileId(key), key]));
  return tiles.flatMap((fine) =>
    (
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const
    ).flatMap(([dx, dy]) => {
      const coarse = ids.get(
        tileId({
          level: fine.level - 1,
          x: (fine.x + dx) >> 1,
          y: (fine.y + dy) >> 1,
        }),
      );
      return coarse === undefined ? [] : [[fine, coarse] as const];
    }),
  );
}

describe('detailCut at the nadir', () => {
  for (const [x, height] of [
    [0, 20_000_000],
    [0, 1_000_000],
    [1_000_000, 1_000_000],
    [300_000, 10_000],
    [999_000, 10_000],
    [300_000, 100],
  ] as const) {
    it(`asks no more than the nadir tile holds from ${height} m over (${x}, 0)`, () => {
      const eye = planeToWorld(x, 0, height);
      const nadir = selectTiles(eye, { coast: field }).filter((key) => {
        const { west, south, east, north } = tileRect(key);
        return west <= x && x <= east && south <= 0 && north >= 0;
      });
      const coarsest = Math.min(...nadir.map((key) => key.level));
      assert.equal(
        detailCut(eye, field)(x, 0),
        (2 * tileSide(coarsest)) / CELLS,
      );
    });
  }

  it('never asks finer than a tile the coast-following selection draws', () => {
    const eye = planeToWorld(999_000, 0, 10_000);
    const cut = detailCut(eye, field);
    for (const key of selectTiles(eye, { coast: field })) {
      const spacing = tileSide(key.level) / CELLS;
      for (let j = 0; j < TILE_GRID; j += 4) {
        for (let i = 0; i < TILE_GRID; i += 4) {
          const x = latticeCoordinate(key.level, CELLS, key.x * CELLS + i);
          const y = latticeCoordinate(key.level, CELLS, key.y * CELLS + j);
          assert.ok(cut(x, y) >= 2 * spacing * (1 - 1e-9), tileId(key));
        }
      }
    }
  });
});

describe('detailCut', () => {
  const eye = planeToWorld(300_000, 0, 100);
  const cut = detailCut(eye);
  const pairs = steps(selectTiles(eye)).slice(0, 12);

  it('finds tiles of adjacent levels side by side', () => {
    assert.ok(pairs.length > 0);
  });

  it('never cuts finer than the coarser of two neighbours draws', () => {
    for (const [, coarse] of pairs) {
      const spacing = tileSide(coarse.level) / CELLS;
      for (const [point] of gridHeights(coarse)) {
        const [x = 0, y = 0] = point.split(',').map(Number);
        assert.ok(cut(x, y) >= 2 * spacing * (1 - 1e-9), tileId(coarse));
      }
    }
  });

  it('gives two tiles of adjacent levels the same heights along their edge', () => {
    let differedBefore = false;
    for (const [fine, coarse] of pairs) {
      const coarseHeights = gridHeights(coarse, cut);
      const fineHeights = gridHeights(fine, cut);
      const own = gridHeights(fine);
      const ownCoarse = gridHeights(coarse);
      let shared = 0;
      for (const [point, height] of fineHeights) {
        const other = coarseHeights.get(point);
        if (other === undefined) continue;
        shared += 1;
        assert.equal(height, other, `${tileId(fine)} at ${point}`);
        if (own.get(point) !== ownCoarse.get(point)) differedBefore = true;
      }
      assert.equal(shared, CELLS / 2 + 1, `${tileId(fine)} ${tileId(coarse)}`);
    }
    // Each tile cutting at its own spacing, the same edges disagree.
    assert.ok(differedBefore);
  });
});
