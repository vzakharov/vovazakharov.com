import type { Seeded } from '@/kernel/shared/typings';

import {
  type LatLonGrid,
  sphereDistanceField,
  type SphereField,
} from '../../coast-field';
import { isLand } from './contour';
import { pathHash } from './hash';
import { type Envelope, landSeries, PROBE_ENVELOPE } from './land-series';
import { legendreRecursion } from './legendre';
import { pinnedSeries } from './pinned-row';
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
export type SphereWorld = Seeded & { field: SphereField };

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
  sweep: number;
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
  if (times) times.sweep = performance.now() - start;
  return field;
}

/** How a world is built when not wholly from its own hash. */
export type BuildOptions = {
  /** Where the words are rolled from; the hash by path by default. */
  source?: WordSource;
  /** A ready land series up to `LAND_DEGREE` (a pinned row's) in place of the rolled one; the seed is still rolled. */
  series?: Float64Array;
  envelope?: Envelope;
  /** Filled with each stage's cost when given. */
  times?: BuildTimes;
};

/**
 * World `N` built for the ground: its parameters rolled from `source`, the
 * land series (rolled, or `series`) synthesised onto the 1024 × 2048 field
 * grid, and its signed great-circle distance to the coast.
 */
export function buildSphereWorld(
  world: string,
  {
    source = pathHash(world),
    series,
    envelope = PROBE_ENVELOPE,
    times,
  }: BuildOptions = {},
): SphereWorld {
  let start = performance.now();
  const {
    land,
    noise: { seed },
  } = rollWith(worldSchema(LAND_DEGREE), source);
  const c = series ?? landSeries(land, LAND_DEGREE, envelope);
  if (times) times.roll = performance.now() - start;
  start = performance.now();
  const { ringGrid, latLonGrid } = fieldGrids(FIELD_RINGS, FIELD_COLUMNS);
  const f = landOnGrid(c, LAND_DEGREE, ringGrid);
  if (times) times.synthesis = performance.now() - start;
  return { field: fieldOf(f, latLonGrid, times), seed };
}

/** World `N` as the game opens it: its pinned row's series when it has one, else rolled. */
export async function openSphereWorld(
  world: string,
  times?: BuildTimes,
): Promise<SphereWorld> {
  const series = await pinnedSeries(world);
  return buildSphereWorld(world, { series, times });
}
