import type { GridCell } from '@/island/shared/globe';

/**
 * Whatever is held or sent per tile, addressed by its key: a `CubeCell`, a
 * quadtree cell on one of the cube's six faces.
 */
export type TileKeyed<K extends GridCell = GridCell> = { readonly key: K };

/**
 * A tile splits while its side exceeds this share of its distance from the
 * eye, so it keeps roughly the same angular size at every height.
 */
export const SPLIT_RATIO = 1;

/**
 * Vertices along a tile's side; `TILE_GRID - 1` cells, a power of two. Detail
 * is bought here rather than by a lower `SPLIT_RATIO`, since reselecting costs
 * per tile and filling runs in the workers.
 */
export const TILE_GRID = 65;
