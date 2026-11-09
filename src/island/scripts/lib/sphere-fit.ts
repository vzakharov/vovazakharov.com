import {
  dot,
  type LatLon,
  latLonToUnit,
  R,
  type Vec3,
} from '@/island/shared/globe';
import {
  type CoastField,
  type RingGrid,
  sampleCoastField,
} from '@/island/entities/terrain';

import { CENTRE, worldToPlane } from './azimuthal';

/**
 * Past this ground distance from `CENTRE` a node takes the clip outright: the
 * island is nowhere near, and `worldToPlane` loses its direction at the
 * antipode.
 */
const FAR_METRES = 9_000_000;

/** Ring `r`'s node `j` of `grid` on the unit sphere, `φ = 0` on `+X`. */
export function nodeLatLon(grid: RingGrid, r: number, j: number): LatLon {
  return {
    lat: Math.asin(grid.x[r] ?? 0),
    lon: (2 * Math.PI * j) / grid.columns,
  };
}

const nodeUnit = (grid: RingGrid, r: number, j: number): Vec3 =>
  latLonToUnit(nodeLatLon(grid, r, j));

/**
 * The fit's target on `grid`: the drawn coast's signed distance in metres,
 * positive on land, through the azimuthal plane, clipped to `±clip` (call 6);
 * `clip = Infinity` leaves it unclipped, the far nodes then reading the
 * field's extrapolation.
 */
export function coastTarget(
  grid: RingGrid,
  field: CoastField,
  clip: number,
): Float64Array {
  const target = new Float64Array(grid.rows * grid.columns);
  const farCosine = Math.cos(FAR_METRES / R);
  for (let r = 0; r < grid.rows; r += 1) {
    for (let j = 0; j < grid.columns; j += 1) {
      const p = nodeUnit(grid, r, j);
      const n = r * grid.columns + j;
      if (Number.isFinite(clip) && dot(p, CENTRE) < farCosine) {
        target[n] = -clip;
        continue;
      }
      const { x, y } = worldToPlane(p);
      const d = sampleCoastField(field, x, y);
      target[n] = Math.min(clip, Math.max(-clip, d));
    }
  }
  return target;
}

/** `series` up to its own degree, zero-padded to `degree`'s slots. */
export function padSeries(series: Float64Array, degree: number): Float64Array {
  const padded = new Float64Array((degree + 1) ** 2);
  padded.set(series.subarray(0, Math.min(series.length, padded.length)));
  return padded;
}

/** A connected run of nodes the fit has wrong. */
export type WrongPatch = LatLon & {
  kind: 'added' | 'dropped';
  km2: number;
};

export type WrongLand = {
  /** Wrong area over the drawn land's area. */
  wrongShare: number;
  addedKm2: number;
  droppedKm2: number;
  landKm2: number;
  /** The largest wrong patches, largest first. */
  patches: WrongPatch[];
};

const cellKm2 = (grid: RingGrid, r: number) =>
  ((grid.weights[r] ?? 0) * 2 * Math.PI * (R / 1000) ** 2) / grid.columns;

/** Labels 8-connected runs of `kind` nodes, wrapping in `φ`. */
function patchesOf(grid: RingGrid, kinds: Int8Array, kind: number) {
  const { rows, columns } = grid;
  const label = new Int32Array(rows * columns).fill(-1);
  const queue = new Int32Array(rows * columns);
  const patches: Array<{ km2: number; lat: number; x: number; z: number }> = [];
  for (let start = 0; start < kinds.length; start += 1) {
    if (kinds[start] !== kind || (label[start] ?? 0) >= 0) continue;
    const id = patches.length;
    const patch = { km2: 0, lat: 0, x: 0, z: 0 };
    label[start] = id;
    queue[0] = start;
    let tail = 1;
    for (let head = 0; head < tail; head += 1) {
      const n = queue[head] ?? 0;
      const r = Math.floor(n / columns);
      const j = n % columns;
      const area = cellKm2(grid, r);
      const { lat, lon } = nodeLatLon(grid, r, j);
      patch.km2 += area;
      patch.lat += area * lat;
      patch.x += area * Math.cos(lon);
      patch.z += area * Math.sin(lon);
      for (let dr = -1; dr <= 1; dr += 1) {
        const rr = r + dr;
        if (rr < 0 || rr >= rows) continue;
        for (let dj = -1; dj <= 1; dj += 1) {
          const m = rr * columns + ((j + dj + columns) % columns);
          if (kinds[m] !== kind || (label[m] ?? 0) >= 0) continue;
          label[m] = id;
          queue[tail++] = m;
        }
      }
    }
    patches.push(patch);
  }
  return patches.map(({ km2, lat, x, z }) => ({
    km2,
    lat: lat / km2,
    lon: Math.atan2(z, x),
  }));
}

/**
 * Where `field`'s land (`> 0`) differs from `truth`'s on `grid`, by area:
 * land added over the drawn sea, land the drawing has and the field drops.
 */
export function wrongLand(
  grid: RingGrid,
  field: Float64Array,
  truth: Float64Array,
  patchCount = 10,
): WrongLand {
  const kinds = new Int8Array(field.length);
  let addedKm2 = 0;
  let droppedKm2 = 0;
  let landKm2 = 0;
  for (let r = 0; r < grid.rows; r += 1) {
    const area = cellKm2(grid, r);
    for (let j = 0; j < grid.columns; j += 1) {
      const n = r * grid.columns + j;
      const land = (field[n] ?? 0) > 0;
      const drawn = (truth[n] ?? 0) > 0;
      if (drawn) landKm2 += area;
      if (land && !drawn) {
        kinds[n] = 1;
        addedKm2 += area;
      } else if (!land && drawn) {
        kinds[n] = 2;
        droppedKm2 += area;
      }
    }
  }
  const patches = [
    ...patchesOf(grid, kinds, 1).map((p) => ({ ...p, kind: 'added' as const })),
    ...patchesOf(grid, kinds, 2).map((p) => ({
      ...p,
      kind: 'dropped' as const,
    })),
  ]
    .sort((a, b) => b.km2 - a.km2)
    .slice(0, patchCount);
  return {
    wrongShare: (addedKm2 + droppedKm2) / landKm2,
    addedKm2,
    droppedKm2,
    landKm2,
    patches,
  };
}

/** Whether plane point `(x, y)` lies inside `ring`, even-odd. */
function insideRing(ring: Array<[number, number]>, x: number, y: number) {
  let inside = false;
  for (const [i, [ax, ay]] of ring.entries()) {
    const [bx, by] = ring[(i + 1) % ring.length] ?? [ax, ay];
    if (ay > y !== by > y && x < ax + ((y - ay) * (bx - ax)) / (by - ay))
      inside = !inside;
  }
  return inside;
}

type LakeWaterParams = { ring: Array<[number, number]> };

/**
 * How many of `grid`'s nodes fall inside `ring` (plane kilometres), and how
 * many of those `field` makes water.
 */
export function lakeWater(
  grid: RingGrid,
  field: Float64Array,
  { ring }: LakeWaterParams,
): { nodes: number; water: number } {
  const xs = ring.map(([x]) => x);
  const ys = ring.map(([, y]) => y);
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
  const [minY, maxY] = [Math.min(...ys), Math.max(...ys)];
  const farCosine = Math.cos(FAR_METRES / R);
  let nodes = 0;
  let water = 0;
  for (let r = 0; r < grid.rows; r += 1) {
    for (let j = 0; j < grid.columns; j += 1) {
      const p = nodeUnit(grid, r, j);
      if (dot(p, CENTRE) < farCosine) continue;
      const plane = worldToPlane(p);
      const x = plane.x / 1000;
      const y = plane.y / 1000;
      if (x < minX || x > maxX || y < minY || y > maxY) continue;
      if (!insideRing(ring, x, y)) continue;
      nodes += 1;
      if ((field[r * grid.columns + j] ?? 0) <= 0) water += 1;
    }
  }
  return { nodes, water };
}
