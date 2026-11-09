import { cellArea, type RingGrid } from '../../grid';

/** The share of the sphere's area where `field > 0`. */
export function landShare(grid: RingGrid, field: Float64Array): number {
  const { rows: rings, columns } = grid;
  let land = 0;
  for (let ring = 0; ring < rings; ring += 1) {
    let count = 0;
    for (let j = 0; j < columns; j += 1) {
      if ((field[ring * columns + j] ?? 0) > 0) count += 1;
    }
    land += count * cellArea(grid, ring);
  }
  return land / (4 * Math.PI);
}

/**
 * Each landmass's area as a share of all land, largest first: cells where
 * `field > 0`, joined to their eight neighbours, wrapping in longitude, and
 * across each pole to the polar ring's cells opposite.
 */
export function landmasses(grid: RingGrid, field: Float64Array): number[] {
  const { rows: rings, columns } = grid;
  const half = columns / 2;
  const seen = new Uint8Array(rings * columns);
  const stack = new Int32Array(rings * columns);
  const isLand = (cell: number) => (field[cell] ?? 0) > 0;
  const areas: number[] = [];
  let top = 0;
  const visit = (r: number, k: number) => {
    const next = r * columns + ((k + columns) % columns);
    if (seen[next] === 0 && isLand(next)) {
      seen[next] = 1;
      stack[top++] = next;
    }
  };
  for (let first = 0; first < seen.length; first += 1) {
    if (seen[first] === 1 || !isLand(first)) continue;
    seen[first] = 1;
    stack[top++] = first;
    let area = 0;
    while (top > 0) {
      const cell = stack[--top] ?? 0;
      const ring = Math.floor(cell / columns);
      const j = cell - ring * columns;
      area += cellArea(grid, ring);
      for (let dr = -1; dr <= 1; dr += 1) {
        const r = ring + dr;
        if (r < 0 || r >= rings) continue;
        for (let dj = -1; dj <= 1; dj += 1) visit(r, j + dj);
      }
      if (ring === 0 || ring === rings - 1) {
        for (let dj = -1; dj <= 1; dj += 1) visit(ring, j + half + dj);
      }
    }
    areas.push(area);
  }
  const total = areas.reduce((sum, area) => sum + area, 0);
  return areas.map((area) => area / total).toSorted((a, b) => b - a);
}
