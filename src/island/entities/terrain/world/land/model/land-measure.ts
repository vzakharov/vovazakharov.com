import { nodeOf } from '../../../coast-field';
import { cellArea, type RingGrid } from '../../grid';
import { isLand } from './sphere-contour';

/** The share of the sphere's area that `isLand`. */
export function landShare(grid: RingGrid, field: Float64Array): number {
  const { rows: rings, columns } = grid;
  let land = 0;
  for (let ring = 0; ring < rings; ring += 1) {
    let count = 0;
    for (let j = 0; j < columns; j += 1) {
      if (isLand(field[ring * columns + j] ?? 0)) count += 1;
    }
    land += count * cellArea(grid, ring);
  }
  return land / (4 * Math.PI);
}

/**
 * Each landmass's area as a share of all land, largest first: land cells
 * joined to their eight neighbours as `nodeOf` finds them.
 */
export function landmasses(grid: RingGrid, field: Float64Array): number[] {
  const { rows: rings, columns } = grid;
  const seen = new Uint8Array(rings * columns);
  const stack = new Int32Array(rings * columns);
  const landAt = (cell: number) => isLand(field[cell] ?? 0);
  const areas: number[] = [];
  let top = 0;
  const visit = (next: number) => {
    if (seen[next] === 0 && landAt(next)) {
      seen[next] = 1;
      stack[top++] = next;
    }
  };
  for (let first = 0; first < seen.length; first += 1) {
    if (seen[first] === 1 || !landAt(first)) continue;
    seen[first] = 1;
    stack[top++] = first;
    let area = 0;
    while (top > 0) {
      const cell = stack[--top] ?? 0;
      const ring = Math.floor(cell / columns);
      const j = cell - ring * columns;
      area += cellArea(grid, ring);
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dj = -1; dj <= 1; dj += 1) {
          visit(nodeOf(grid, ring + dr, j + dj));
        }
      }
    }
    areas.push(area);
  }
  const total = areas.reduce((sum, area) => sum + area, 0);
  return areas.map((area) => area / total).toSorted((a, b) => b - a);
}
