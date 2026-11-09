import { type GridCell, planeToWorld } from '@/island/shared/globe';

import { latticeCoordinate, TILE_GRID, tileSide } from './tile';
import {
  assembleTile,
  type LatticePoint,
  type MeshOptions,
  type TileMesh,
} from './tile-mesh';

/**
 * Height above sea level, in metres, at plane point `(x, y)`, holding no
 * relief shorter than `finest` metres — at least twice the tile's vertex
 * spacing, the shortest wave its lattice draws without aliasing.
 */
export type HeightSample = (x: number, y: number, finest: number) => number;

export type FillOptions = MeshOptions & {
  /**
   * The shortest relief to draw at a plane point, metres, when it should not
   * depend on the tile's own level (`detailCut`): a vertex then cuts at the
   * larger of it and twice the tile's spacing.
   */
  readonly finest?: (x: number, y: number) => number;
};

/**
 * Fills a tile from its key and the height function: a `grid × grid` lattice
 * bent onto the sphere, plus a skirt (`assembleTile`).
 */
export function fillTile(
  key: GridCell,
  sample: HeightSample,
  options: FillOptions = {},
): TileMesh {
  const grid = options.grid ?? TILE_GRID;
  const cells = grid - 1;
  const spacing = tileSide(key.level) / cells;
  const skirtDepth = options.skirtDepth ?? 2 * spacing;
  const { finest } = options;
  const cutAt = (x: number, y: number) =>
    finest === undefined ? 2 * spacing : Math.max(finest(x, y), 2 * spacing);

  const ring = grid + 2;
  const points: LatticePoint[] = [];
  for (let b = 0; b < ring; b++) {
    const y = latticeCoordinate(key.level, cells, key.y * cells + b - 1);
    for (let a = 0; a < ring; a++) {
      const x = latticeCoordinate(key.level, cells, key.x * cells + a - 1);
      const height = sample(x, y, cutAt(x, y));
      points.push({ world: planeToWorld(x, y, height), height });
    }
  }

  const half = cells / 2;
  const middle = planeToWorld(
    latticeCoordinate(key.level, cells, key.x * cells + half),
    latticeCoordinate(key.level, cells, key.y * cells + half),
  );
  return assembleTile(key, { ring, points }, middle, skirtDepth);
}
