import type { RingGrid } from '@/island/entities/terrain';

import { type GeoPolygon, naturalEarth } from './natural-earth';

/** Ring `ring`'s latitude in degrees, from its `cos θ`. */
const ringLatitude = (grid: RingGrid, ring: number) =>
  (Math.asin(grid.x[ring] ?? 0) * 180) / Math.PI;

/**
 * Where `polygon`'s edges cross latitude `lat`, in degrees east, unsorted.
 * An edge counts when exactly one end lies north of `lat`, so a vertex on the
 * line is counted once and an edge along it never.
 */
function crossings(polygon: GeoPolygon, lat: number): number[] {
  const found: number[] = [];
  for (const ring of polygon) {
    for (let i = 1; i < ring.length; i += 1) {
      const [lon0 = 0, lat0 = 0] = ring[i - 1] ?? [];
      const [lon1 = 0, lat1 = 0] = ring[i] ?? [];
      if (lat0 > lat === lat1 > lat) continue;
      found.push(lon0 + ((lat - lat0) * (lon1 - lon0)) / (lat1 - lat0));
    }
  }
  return found;
}

/**
 * Throws on an edge spanning more than 180° of longitude: the scanline reads
 * edges straight in lon/lat, so a polygon must be split at ±180° — as Natural
 * Earth's are — rather than wrap across it. An edge along ±90° is one point
 * on the sphere, crossed by no scanline, so it may span any longitude.
 */
function assertSplit(polygon: GeoPolygon): void {
  for (const ring of polygon) {
    for (let i = 1; i < ring.length; i += 1) {
      const [lon0 = 0, lat0 = 0] = ring[i - 1] ?? [];
      const [lon1 = 0, lat1 = 0] = ring[i] ?? [];
      const polar = lat0 === lat1 && Math.abs(lat0) === 90;
      if (!polar && Math.abs(lon1 - lon0) > 180) {
        throw new Error(
          `edge from ${lon0}°, ${lat0}° wraps the antimeridian to ${lon1}°`,
        );
      }
    }
  }
}

/**
 * Sets `mask` at the columns whose longitude lies in `[west, east)` on ring
 * `ring`. Column `j` sits at `2πj/columns` east, read in `[−180°, 180°)`, so
 * a span ending at +180° and one starting at −180° share no column.
 */
function fillSpan(
  mask: Uint8Array,
  grid: RingGrid,
  ring: number,
  west: number,
  east: number,
): void {
  const { columns } = grid;
  const half = columns / 2;
  const first = Math.ceil(((west + 180) * columns) / 360);
  const end = Math.min(columns, Math.ceil(((east + 180) * columns) / 360));
  for (let k = Math.max(0, first); k < end; k += 1) {
    mask[ring * columns + ((k + half) % columns)] = 1;
  }
}

/**
 * Polygons (`[lon, lat]` degrees, exterior then holes, split at ±180°)
 * rasterised on `grid`: 1 where a node lies inside some polygon by the
 * even-odd rule, 0 elsewhere; `ring * columns + j` per node. A ring closing
 * along ±90° covers its pole.
 */
export function polygonMask(
  polygons: readonly GeoPolygon[],
  grid: RingGrid,
): Uint8Array {
  const mask = new Uint8Array(grid.rows * grid.columns);
  const latitudes = Array.from({ length: grid.rows }, (_, ring) =>
    ringLatitude(grid, ring),
  );
  for (const polygon of polygons) {
    assertSplit(polygon);
    let south = 90;
    let north = -90;
    for (const [, lat] of polygon[0] ?? []) {
      south = Math.min(south, lat);
      north = Math.max(north, lat);
    }
    for (const [ring, lat] of latitudes.entries()) {
      if (lat < south || lat > north) continue;
      const lons = crossings(polygon, lat).toSorted((a, b) => a - b);
      for (let i = 0; i + 1 < lons.length; i += 2) {
        fillSpan(mask, grid, ring, lons[i] ?? 0, lons[i + 1] ?? 0);
      }
    }
  }
  return mask;
}

/** The layers a land mask is made of. */
export type EarthLayers = Record<
  'land' | 'shelves' | 'lakes',
  readonly GeoPolygon[]
>;

/**
 * Land on `grid`: land or ice shelf, and no lake — OR rather than XOR, since
 * the shelves abut the land polygons.
 */
export function layersMask(layers: EarthLayers, grid: RingGrid): Uint8Array {
  const mask = polygonMask(layers.land, grid);
  const shelves = polygonMask(layers.shelves, grid);
  const lakes = polygonMask(layers.lakes, grid);
  for (let i = 0; i < mask.length; i += 1) {
    mask[i] = ((mask[i] ?? 0) | (shelves[i] ?? 0)) & ((lakes[i] ?? 0) ^ 1);
  }
  return mask;
}

/**
 * Earth's land on `grid` from Natural Earth's 1:50m layers: 1 on land, 0 on
 * sea or lake, `ring * columns + j` per node. The Caspian is sea, a hole in
 * Eurasia's polygon.
 */
export async function earthMask(grid: RingGrid): Promise<Uint8Array> {
  const [land, shelves, lakes] = await Promise.all([
    naturalEarth('land'),
    naturalEarth('shelves'),
    naturalEarth('lakes'),
  ]);
  return layersMask({ land, shelves, lakes }, grid);
}
