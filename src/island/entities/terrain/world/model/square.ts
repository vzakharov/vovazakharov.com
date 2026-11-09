/**
 * The world's square on the island plane, metres: centred on the drawing's
 * bounding box with ~1,650 km of sea beside it east and west and ~2,400 km
 * north and south. Off it is ocean.
 */
export const SQUARE = {
  centreX: 1_045_000,
  centreY: -271_500,
  side: 10_400_000,
} as const;

/** Grid nodes per axis: eight per finest wave at `K = 128`, ~10.2 km apart. */
export const GRID_NODES = 1024;

/** The grid: its size, spacing and node `(0, 0)`, the square's low corner. */
export const GRID = {
  columns: GRID_NODES,
  rows: GRID_NODES,
  cellMetres: SQUARE.side / GRID_NODES,
  originX: SQUARE.centreX - SQUARE.side / 2,
  originY: SQUARE.centreY - SQUARE.side / 2,
} as const;
