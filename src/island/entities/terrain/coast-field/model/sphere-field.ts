import { R } from '@/island/shared/globe';

import type { SignedDistances } from './coast-field';
import { colatitudeLongitude, type LatLonGrid, ringAbove } from './lat-lon';
import { nearestChords } from './sphere-sweep';

/**
 * The signed great-circle distance to the coast over the whole sphere, on a
 * `LatLonGrid`: plain numbers and typed arrays, so it survives `postMessage`.
 */
export type SphereField = LatLonGrid &
  SignedDistances & {
    /** The value at the north and south pole: its ring's mean. */
    poles: Float64Array;
  };

const read = (array: Float32Array | Float64Array, index: number) =>
  array[index] ?? Number.NaN;

/** A ring's mean value. */
function ringMean(distance: Float32Array, columns: number, ring: number) {
  let sum = 0;
  for (let j = 0; j < columns; j += 1)
    sum += read(distance, ring * columns + j);
  return sum / columns;
}

/**
 * The signed great-circle distance, metres on a sphere of radius `R`, from
 * every node of `grid` to the coast drawn by `segments` (six numbers each,
 * two unit vectors), positive where `inside` is 1. The segments and the mask
 * must agree on where the coast is; nothing here checks that they do.
 */
export function sphereDistanceField(
  segments: Float64Array,
  inside: Uint8Array,
  grid: LatLonGrid,
): SphereField {
  if (segments.length === 0) {
    throw new Error('sphereDistanceField: there is no coast');
  }
  const distance = nearestChords(segments, grid);
  for (const [n, isInside] of inside.entries()) {
    const chord = Math.sqrt(read(distance, n));
    const arc = 2 * R * Math.asin(Math.min(1, chord / 2));
    distance[n] = isInside === 1 ? arc : -arc;
  }
  const poles = Float64Array.of(
    ringMean(distance, grid.columns, 0),
    ringMean(distance, grid.columns, grid.rows - 1),
  );
  return { ...grid, distance, poles };
}

/** Ring `ring`'s value at fractional column `u`, linear, wrapping. */
function alongRingAt(field: SphereField, ring: number, u: number) {
  const { columns, distance } = field;
  const j = Math.min(columns - 1, Math.floor(u));
  const t = u - j;
  const a = read(distance, ring * columns + j);
  const b = read(distance, ring * columns + ((j + 1) % columns));
  return a + (b - a) * t;
}

/**
 * The signed distance at direction `p` (any nonzero length): bilinear in
 * colatitude and longitude between rings, wrapping at longitude 0, and inside
 * each polar cap linear in colatitude from the outermost ring to the pole's
 * value, so it is continuous everywhere, the poles included.
 */
export function sampleSphereField(
  field: SphereField,
  p: readonly [number, number, number],
) {
  const { rows, columns, theta: rings, poles } = field;
  const { theta, lambda } = colatitudeLongitude(p);
  const u = (lambda * columns) / (2 * Math.PI);
  const r = ringAbove(field, theta);
  if (r < 0) {
    const share = theta / read(rings, 0);
    const pole = read(poles, 0);
    return pole + (alongRingAt(field, 0, u) - pole) * share;
  }
  if (r >= rows - 1) {
    const share = (Math.PI - theta) / (Math.PI - read(rings, rows - 1));
    const pole = read(poles, 1);
    return pole + (alongRingAt(field, rows - 1, u) - pole) * share;
  }
  const north = read(rings, r);
  const t = (theta - north) / (read(rings, r + 1) - north);
  const a = alongRingAt(field, r, u);
  return a + (alongRingAt(field, r + 1, u) - a) * t;
}
