import {
  type LatLonGrid,
  sphereDistanceField,
  type SphereField,
} from '../../coast-field';
import { isLand } from './contour';
import { pathHash } from './hash';
import { type Envelope, landSeries, PROBE_ENVELOPE } from './land-series';
import { legendreRecursion } from './legendre';
import { rollWith, type WordSource } from './roll';
import { sphereContourOf } from './sphere-contour';
import { gaussLegendre, type RingGrid } from './sphere-grid';
import { synthesize } from './sphere-series';
import { LAND_DEGREE, worldSchema } from './world-schema';

/**
 * The coast field's grid: 1024 Gauss–Legendre rings × 2048 longitudes,
 * 19.6 km at the equator, twice the series' own grid each way, so the
 * contour, linear between nodes, holds four nodes per finest wave.
 */
export const FIELD_RINGS = 1024;
export const FIELD_COLUMNS = 2048;

/** A world's land, built: its coast field and its value noise's seed. */
export type SphereWorld = { field: SphereField; seed: number };

/** Gauss–Legendre rings and equal longitudes, as both grids name them. */
export function fieldGrids(rows: number, columns: number) {
  const ringGrid: RingGrid = { rows, columns, ...gaussLegendre(rows) };
  const latLonGrid: LatLonGrid = {
    rows,
    columns,
    theta: ringGrid.x.map((x) => Math.acos(x)),
  };
  return { ringGrid, latLonGrid };
}

/** Where the build spends its time, milliseconds. */
export type BuildTimes = {
  roll: number;
  synthesis: number;
  contour: number;
  distance: number;
};

/**
 * The land `f` of a series up to `degree` on the field grid: synthesised
 * there directly, the series' degree being below the grid's own.
 */
export function landOnGrid(
  c: Float64Array,
  degree: number,
  ringGrid: RingGrid,
): Float64Array {
  return synthesize(
    { grid: ringGrid, recursion: legendreRecursion(degree) },
    c,
  );
}

/** `f`'s signed distance field: its zero line, then the sweep. */
export function fieldOf(
  f: Float64Array,
  grid: LatLonGrid,
  times?: BuildTimes,
): SphereField {
  let start = performance.now();
  const coast = sphereContourOf(f, grid);
  if (times) times.contour = performance.now() - start;
  if (coast.length === 0) throw new Error('fieldOf: the land has no coast');
  start = performance.now();
  const inside = new Uint8Array(f.length);
  for (const [n, value] of f.entries()) inside[n] = isLand(value) ? 1 : 0;
  const field = sphereDistanceField(coast, inside, grid);
  if (times) times.distance = performance.now() - start;
  return field;
}

/**
 * World `N` built for the ground: its parameters rolled from `source` (the
 * hash by path unless a pinned table stands in for it), the land series
 * synthesised onto the 1024 × 2048 field grid, and its signed great-circle
 * distance to the coast. `times`, when given, is filled with each stage's
 * cost.
 */
export function buildSphereWorld(
  world: string,
  source: WordSource = pathHash(world),
  envelope: Envelope = PROBE_ENVELOPE,
  times?: BuildTimes,
): SphereWorld {
  let start = performance.now();
  const {
    land,
    noise: { seed },
  } = rollWith(worldSchema(LAND_DEGREE), source);
  const c = landSeries(land, LAND_DEGREE, envelope);
  if (times) times.roll = performance.now() - start;
  start = performance.now();
  const { ringGrid, latLonGrid } = fieldGrids(FIELD_RINGS, FIELD_COLUMNS);
  const f = landOnGrid(c, LAND_DEGREE, ringGrid);
  if (times) times.synthesis = performance.now() - start;
  return { field: fieldOf(f, latLonGrid, times), seed };
}
