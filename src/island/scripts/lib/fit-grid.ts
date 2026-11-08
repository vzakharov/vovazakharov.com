import {
  type CoastField,
  GRID,
  GRID_NODES,
} from '@/island/entities/terrain';

/** A node grid on the island plane: `CoastField` less its values. */
export type PlaneGrid = Omit<CoastField, 'distance'>;

/** The world's 1024² grid over its square. */
export const WORLD_GRID: PlaneGrid = {
  ...GRID,
  columns: GRID_NODES,
  rows: GRID_NODES,
};

/** A square-celled grid over a plane box, `[x0, x1] × [y0, y1]` metres. */
export const boxGrid = (
  [x0, x1]: readonly [number, number],
  [y0, y1]: readonly [number, number],
  cellMetres: number,
): PlaneGrid => ({
  originX: x0,
  originY: y0,
  cellMetres,
  columns: Math.floor((x1 - x0) / cellMetres) + 1,
  rows: Math.floor((y1 - y0) / cellMetres) + 1,
});

/**
 * `field` sampled at every node of `grid`, row-major: bilinear between the
 * field's nodes, and off its grid the nearest edge value less the distance
 * past the edge — a coast field's margin is sea, so that keeps falling away
 * from the land.
 */
export function resample(field: CoastField, grid: PlaneGrid): Float64Array {
  const { originX, originY, cellMetres, columns, rows, distance } = field;
  const out = new Float64Array(grid.columns * grid.rows);
  const at = (n: number) => distance[n] ?? Number.NaN;
  for (let j = 0; j < grid.rows; j += 1) {
    const v = (grid.originY + j * grid.cellMetres - originY) / cellMetres;
    const cv = Math.min(rows - 1, Math.max(0, v));
    const row = Math.min(rows - 2, Math.floor(cv));
    const tv = cv - row;
    for (let i = 0; i < grid.columns; i += 1) {
      const u = (grid.originX + i * grid.cellMetres - originX) / cellMetres;
      const cu = Math.min(columns - 1, Math.max(0, u));
      const column = Math.min(columns - 2, Math.floor(cu));
      const tu = cu - column;
      const n = row * columns + column;
      const bottom = at(n) + (at(n + 1) - at(n)) * tu;
      const top =
        at(n + columns) + (at(n + columns + 1) - at(n + columns)) * tu;
      const beyond = Math.hypot(u - cu, v - cv) * cellMetres;
      out[j * grid.columns + i] = bottom + (top - bottom) * tv - beyond;
    }
  }
  return out;
}

/** Where `values` is positive — land — as 1s. */
export function landOf(values: ArrayLike<number>): Uint8Array {
  const { length } = values;
  return Uint8Array.from({ length }, (_, n) => ((values[n] ?? 0) > 0 ? 1 : 0));
}
