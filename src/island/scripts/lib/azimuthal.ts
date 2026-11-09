/**
 * The island plane laid on the planet, which only #1's fit reads: local
 * `(x east, y north)` metres around `CENTRE`, mapped to the sphere azimuthally
 * equidistant — a point's distance from the centre on the plane is its
 * great-circle distance on the ground. The world origin is the planet's
 * centre, `+Y` its axis.
 */

import { dot, length, R, type Vec3 } from '@/island/shared/globe';

const LATITUDE = (10 * Math.PI) / 180;

/** The island's centre on the unit sphere: 10° N on the `+X` meridian. */
export const CENTRE: Vec3 = [Math.cos(LATITUDE), Math.sin(LATITUDE), 0];

/** East at the centre. */
export const EAST: Vec3 = [0, 0, -1];

/** North at the centre. */
export const NORTH: Vec3 = [-Math.sin(LATITUDE), Math.cos(LATITUDE), 0];

/** The world position of plane point `(x, y)` at height `h` above the sphere. */
export function planeToWorld(x: number, y: number, h = 0): Vec3 {
  const d = Math.hypot(x, y);
  const angle = d / R;
  const along = Math.cos(angle);
  // sin(d/R)/d tends to 1/R at the centre, where the direction is undefined.
  const across = d === 0 ? 0 : Math.sin(angle) / d;
  const radius = R + h;
  const component = (i: 0 | 1 | 2) =>
    radius * (along * CENTRE[i] + across * (x * EAST[i] + y * NORTH[i]));
  return [component(0), component(1), component(2)];
}

/**
 * The plane point under world position `p` and its height above the sphere.
 * Defined everywhere but the centre's antipode, where every direction is
 * equally far.
 */
export function worldToPlane(p: Vec3): { x: number; y: number; h: number } {
  const radius = length(p);
  const east = dot(p, EAST);
  const north = dot(p, NORTH);
  const angle = Math.atan2(Math.hypot(east, north), dot(p, CENTRE));
  const sideways = Math.hypot(east, north);
  const scale = sideways === 0 ? 0 : (angle * R) / sideways;
  return { x: east * scale, y: north * scale, h: radius - R };
}
