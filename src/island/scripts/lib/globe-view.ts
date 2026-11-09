import type { LatLon } from '@/island/shared/globe';
import type { RingGrid } from '@/island/entities/terrain';

/** The cell index of a view pixel off the globe's disk. */
export const OFF_DISK = -1;

/** The ring of `grid` nearest latitude `lat`: rings fall in `x = sin lat`. */
function nearestRing({ x }: RingGrid, lat: number): number {
  const target = Math.sin(lat);
  let low = 0;
  let high = x.length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if ((x[mid] ?? 0) > target) low = mid;
    else high = mid;
  }
  return Math.abs((x[low] ?? 0) - target) <= Math.abs((x[high] ?? 0) - target)
    ? low
    : high;
}

/**
 * An orthographic view of the globe from far over `centre`, `size` pixels
 * square, north up and east to the right: each pixel's nearest cell of `grid`
 * (`ring·columns + column`, column `j` at east longitude `2πj/columns`), or
 * `OFF_DISK` past the limb. One map serves every field on `grid`.
 */
export function globeSamples(
  grid: RingGrid,
  centre: LatLon,
  size: number,
): Int32Array {
  const cells = new Int32Array(size * size).fill(OFF_DISK);
  const { columns } = grid;
  const sinLat0 = Math.sin(centre.lat);
  const cosLat0 = Math.cos(centre.lat);
  for (let row = 0; row < size; row += 1) {
    const v = 1 - (2 * (row + 0.5)) / size;
    for (let col = 0; col < size; col += 1) {
      const u = (2 * (col + 0.5)) / size - 1;
      const rho = Math.hypot(u, v);
      if (rho > 1) continue;
      const c = Math.asin(rho);
      const sinC = Math.sin(c);
      const cosC = Math.cos(c);
      const lat =
        rho === 0
          ? centre.lat
          : Math.asin(cosC * sinLat0 + (v * sinC * cosLat0) / rho);
      const lon =
        centre.lon +
        Math.atan2(u * sinC, rho * cosC * cosLat0 - v * sinC * sinLat0);
      const turn = lon / (2 * Math.PI);
      const column =
        ((Math.round((turn - Math.floor(turn)) * columns) % columns) +
          columns) %
        columns;
      cells[row * size + col] = nearestRing(grid, lat) * columns + column;
    }
  }
  return cells;
}
