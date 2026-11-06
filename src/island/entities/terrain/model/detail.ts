import { planeToWorld, type Vec3, worldToPlane } from '@/island/shared/globe';

import { HIGHEST_GROUND, LOWEST_GROUND } from './height';
import {
  MAX_LEVEL,
  MIN_LEVEL,
  SPLIT_RATIO,
  TILE_GRID,
  tileSide,
} from './tile';

/**
 * Metres from `eye` (world metres) to plane point `(x, y)` taken at the eye's
 * own height, held within the ground's range: the distance a tile's split is
 * judged by.
 */
export function viewDistance(eye: Vec3): (x: number, y: number) => number {
  const { h } = worldToPlane(eye);
  const level = Math.min(HIGHEST_GROUND, Math.max(LOWEST_GROUND, h));
  return (x, y) => {
    const p = planeToWorld(x, y, level);
    return Math.hypot(eye[0] - p[0], eye[1] - p[1], eye[2] - p[2]);
  };
}

/**
 * The shortest relief, in metres, to draw at plane point `(x, y)` seen from
 * `eye`: twice the vertex spacing of the coarsest tile `selectTiles` from
 * `eye` may leave there, so no tile it selects aliases it. It is a continuous
 * function of position, so two tiles of any levels cut the same octaves along
 * the edge they share, and the detail thins with distance with no step where
 * the level changes.
 */
export function detailCut(eye: Vec3): (x: number, y: number) => number {
  const distance = viewDistance(eye);
  const cells = TILE_GRID - 1;
  const finest = (2 * tileSide(MAX_LEVEL)) / cells;
  const coarsest = (2 * tileSide(MIN_LEVEL)) / cells;
  return (x, y) =>
    Math.min(
      coarsest,
      Math.max(finest, (2 * SPLIT_RATIO * distance(x, y)) / cells),
    );
}
