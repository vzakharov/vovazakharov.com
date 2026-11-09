/**
 * The island plane laid on the planet, which only #1's fit reads: local
 * `(x east, y north)` metres around `ISLAND_CENTRE`, mapped to the sphere
 * azimuthally equidistant — a point's distance from the centre on the plane is
 * its great-circle distance on the ground. The world origin is the planet's
 * centre, `+Y` its axis.
 */

import { dot, length, R, type Vec3 } from '@/island/shared/globe';

const LATITUDE = (10 * Math.PI) / 180;

/** The island's centre on the unit sphere: 10° N on the `+X` meridian. */
export const ISLAND_CENTRE: Vec3 = [Math.cos(LATITUDE), Math.sin(LATITUDE), 0];

/** East at the island's centre. */
const ISLAND_EAST: Vec3 = [0, 0, -1];

/** North at the island's centre. */
const ISLAND_NORTH: Vec3 = [-Math.sin(LATITUDE), Math.cos(LATITUDE), 0];

/**
 * The plane point under world position `p` and its height above the sphere.
 * Defined everywhere but the centre's antipode, where every direction is
 * equally far.
 */
export function worldToPlane(p: Vec3): { x: number; y: number; h: number } {
  const radius = length(p);
  const east = dot(p, ISLAND_EAST);
  const north = dot(p, ISLAND_NORTH);
  const angle = Math.atan2(Math.hypot(east, north), dot(p, ISLAND_CENTRE));
  const sideways = Math.hypot(east, north);
  const scale = sideways === 0 ? 0 : (angle * R) / sideways;
  return { x: east * scale, y: north * scale, h: radius - R };
}
