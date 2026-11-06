import type { PlanePoint } from '@/island/shared/globe';

/**
 * A tile of the terrain quadtree over the island's square on the plane. Level 0
 * is the whole square, side `TILE_SQUARE` metres centred on the island's
 * centre; each level halves the side, so a level-`l` tile has
 * `0 ≤ x, y < 2^l`, `x` counting east and `y` north from the square's
 * south-west corner.
 */
export type TileKey = PlanePoint & { readonly level: number };

/**
 * The level-0 square's side: 16 384 km, covering the traced coast's
 * ~8 300 × 5 900 km bounding box, offshore islands and an off-centre main
 * body included, with margin.
 */
export const TILE_SQUARE = 16_384_000;

/** The deepest level: 18 puts a 33-vertex grid's spacing at ~1.95 m. */
export const MAX_LEVEL = 18;

/** Vertices along a tile's side; `TILE_GRID - 1` cells, a power of two. */
export const TILE_GRID = 33;

/** A stable string for a key, for maps and caches. */
export const tileId = ({ level, x, y }: TileKey) => `${level}/${x}/${y}`;

export const tileSide = (level: number) => TILE_SQUARE / 2 ** level;

/**
 * The plane coordinate of lattice line `k` at `level` with `cells` cells per
 * tile. Every tile computes a shared edge through this one expression with the
 * same `k`, so neighbours at a level agree on it bit for bit.
 */
export const latticeCoordinate = (level: number, cells: number, k: number) =>
  -TILE_SQUARE / 2 + k * (TILE_SQUARE / (2 ** level * cells));

/** The tile's extent on the plane, in metres. */
export function tileRect(key: TileKey) {
  const side = tileSide(key.level);
  const west = -TILE_SQUARE / 2 + key.x * side;
  const south = -TILE_SQUARE / 2 + key.y * side;
  return { west, south, east: west + side, north: south + side };
}
