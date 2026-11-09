/**
 * #0's fit: Earth's coast from Natural Earth's 1:50m land, ice shelves and
 * lakes (`earth-mask.ts`), its signed distance traced on the measure grid by
 * the game's own `fieldOf` from the mask's ±1, then read at the analysis
 * nodes with `sampleSphereField` and clipped (calls 3 and 4).
 *
 * Natural Earth — public domain (naturalearthdata.com/about/terms-of-use).
 * Made with Natural Earth.
 */
import type { LatLon } from '@/island/shared/globe';
import {
  analyze,
  fieldGrids,
  fieldOf,
  type RingGrid,
  sampleSphereField,
  type SphereField,
  type SphereTransform,
} from '@/island/entities/terrain';

import { earthMask, polygonMask } from './earth-mask';
import { DRAWN_CLIP_METRES } from './fit-drawn';
import { namedPolygons, naturalEarthJson } from './natural-earth';
import { type FitTarget, lakeLine, nodeUnit } from './sphere-fit';

/** #0's clip, #1's (call 6 names one target for both). */
export const EARTH_CLIP_METRES = DRAWN_CLIP_METRES;

/** The big lakes whose water share the fit reports (call 2), by Natural Earth's `name`. */
const NAMED_LAKES = [
  'Lake Superior',
  'Lake Michigan',
  'Lake Huron',
  'Lake Victoria',
  'Lake Tanganyika',
  'Lake Baikal',
  'Great Bear Lake',
  'Great Slave Lake',
  'Lake Ladoga',
  'Lake Balkhash',
  'North Aral Sea',
  'South Aral Sea',
  'Lago Titicaca',
] as const;

const atDegrees = (lat: number, lon: number): LatLon => ({
  lat: (lat * Math.PI) / 180,
  lon: (lon * Math.PI) / 180,
});

/** Land bridges the fit may cut, each a point on either side (call 6). */
const LINKS = [
  { name: 'Panama', from: atDegrees(40, -100), to: atDegrees(-10, -60) },
  { name: 'Suez', from: atDegrees(0, 20), to: atDegrees(50, 60) },
  { name: 'Bering', from: atDegrees(66, 175), to: atDegrees(65, -155) },
] as const;

/** `grid`'s node nearest `point`. */
function nodeAt(grid: RingGrid, { lat, lon }: LatLon): number {
  let ring = 0;
  for (let r = 1; r < grid.rows; r += 1) {
    const here = Math.abs(Math.asin(grid.x[r] ?? 0) - lat);
    if (here < Math.abs(Math.asin(grid.x[ring] ?? 0) - lat)) ring = r;
  }
  const turn = (lon / (2 * Math.PI)) * grid.columns;
  const j = ((Math.round(turn) % grid.columns) + grid.columns) % grid.columns;
  return ring * grid.columns + j;
}

/** Whether `field`'s land (`> 0`) joins `a` to `b`, eight-connected, wrapping in longitude. */
export function joined(
  grid: RingGrid,
  field: Float64Array,
  a: LatLon,
  b: LatLon,
): boolean {
  const { rows, columns } = grid;
  const start = nodeAt(grid, a);
  const goal = nodeAt(grid, b);
  if ((field[start] ?? 0) <= 0 || (field[goal] ?? 0) <= 0) return false;
  const seen = new Uint8Array(field.length);
  const stack = [start];
  seen[start] = 1;
  for (let n = stack.pop(); n !== undefined; n = stack.pop()) {
    if (n === goal) return true;
    const r = Math.floor(n / columns);
    const j = n % columns;
    for (
      let rr = Math.max(0, r - 1);
      rr <= Math.min(rows - 1, r + 1);
      rr += 1
    ) {
      for (let dj = -1; dj <= 1; dj += 1) {
        const m = rr * columns + ((j + dj + columns) % columns);
        if (seen[m] === 1 || (field[m] ?? 0) <= 0) continue;
        seen[m] = 1;
        stack.push(m);
      }
    }
  }
  return false;
}

/** #0's target on `transform`'s nodes: `field` read there, clipped to `±clip`. */
export function earthSeries(
  transform: SphereTransform,
  field: SphereField,
  clip = EARTH_CLIP_METRES,
): Float64Array {
  const { grid } = transform;
  const target = new Float64Array(grid.rows * grid.columns);
  for (let r = 0; r < grid.rows; r += 1) {
    for (let j = 0; j < grid.columns; j += 1) {
      const d = sampleSphereField(field, nodeUnit(grid, r, j));
      target[r * grid.columns + j] = Math.min(clip, Math.max(-clip, d));
    }
  }
  return analyze(transform, target);
}

/** Earth's coast field on `grid`, traced from its land mask. */
export function earthField(grid: RingGrid, mask: Uint8Array): SphereField {
  const { latLonGrid } = fieldGrids(grid.rows, grid.columns);
  const f = Float64Array.from(mask, (land) => (land === 1 ? 1 : -1));
  return fieldOf(f, latLonGrid);
}

const hemisphere = (radians: number, positive: string, negative: string) =>
  `${Math.abs((radians * 180) / Math.PI).toFixed(1)}° ${radians < 0 ? negative : positive}`;

/**
 * #0's fit, measured on `fine`'s grid, the mask's own: the truth is the
 * traced field's distance under the mask's sign, so target and truth agree by
 * construction.
 */
export async function earthFit(fine: SphereTransform): Promise<FitTarget> {
  const mask = await earthMask(fine.grid);
  const field = earthField(fine.grid, mask);
  const truth = Float64Array.from(
    field.distance,
    (d, n) => (mask[n] === 1 ? 1 : -1) * Math.max(1, Math.abs(d)),
  );
  const lakes = namedPolygons(await naturalEarthJson('lakes'), NAMED_LAKES);
  const lakeMasks = NAMED_LAKES.map((name) => {
    const polygons = lakes.get(name);
    if (!polygons) throw new Error(`Natural Earth names no lake ${name}`);
    return { name, mask: polygonMask(polygons, fine.grid) };
  });
  return {
    truth,
    series: (transform, clip) => earthSeries(transform, field, clip),
    place: ({ lat, lon }) =>
      `${hemisphere(lat, 'N', 'S')}, ${hemisphere(lon, 'E', 'W')}`,
    report: (kept) => [
      'the named lakes:',
      ...lakeMasks.map(({ name, mask: lake }) => {
        let nodes = 0;
        let water = 0;
        for (const [n, inside] of lake.entries()) {
          if (inside === 0) continue;
          nodes += 1;
          if ((kept[n] ?? 0) <= 0) water += 1;
        }
        return lakeLine(name, nodes, water);
      }),
      'the land bridges:',
      ...LINKS.map(
        ({ name, from, to }) =>
          `  ${name}: ${joined(fine.grid, kept, from, to) ? 'joined' : 'cut'}`,
      ),
    ],
  };
}
