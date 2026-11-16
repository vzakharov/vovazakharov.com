/**
 * The island plane laid on the planet, which #1's fit and the places the play
 * scripts name by their trace coordinates read: local
 * `(x east, y north)` metres around `ISLAND_CENTRE`, mapped to the sphere
 * azimuthally equidistant — a point's distance from the centre on the plane is
 * its great-circle distance on the ground. The world origin is the planet's
 * centre, `+Y` its axis.
 */

import {
  dot,
  type LatLon,
  latLonToUnit,
  length,
  R,
  scaled,
  sum,
  unitToLatLon,
  type Vec3,
} from '@/island/shared/globe';

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

/** The unit vector under plane point `(x, y)`. */
export function planeToUnit(x: number, y: number): Vec3 {
  const d = Math.hypot(x, y);
  const angle = d / R;
  // sin(d/R)/d tends to 1/R at the centre, where the direction is undefined.
  const across = d === 0 ? 0 : Math.sin(angle) / d;
  return sum(
    scaled(ISLAND_CENTRE, Math.cos(angle)),
    sum(scaled(ISLAND_EAST, x * across), scaled(ISLAND_NORTH, y * across)),
  );
}

const DEGREE = Math.PI / 180;

/** The latitude and longitude of direction `p`, in degrees, as the play hook's `moveTo` takes them. */
export function unitToDegrees(p: Vec3): { lat: number; lon: number } {
  const { lat, lon } = unitToLatLon(p);
  return { lat: lat / DEGREE, lon: lon / DEGREE };
}

/** The direction at latitude and longitude in degrees: `unitToDegrees`' inverse. */
export const degreesToUnit = ({ lat, lon }: LatLon) =>
  latLonToUnit({ lat: lat * DEGREE, lon: lon * DEGREE });

/** The latitude and longitude, in degrees, of plane point `(x, y)`. */
export const planeToDegrees = (x: number, y: number) =>
  unitToDegrees(planeToUnit(x, y));
