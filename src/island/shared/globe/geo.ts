/**
 * Latitude and longitude on the planet frame, in radians: `+Y` the axis,
 * Greenwich on `+X`, longitude growing east toward `−Z`, so
 * `p = (cos φ cos λ, sin φ, −cos φ sin λ)`.
 */

import { dot, scaled, sub, unit, type Vec3 } from './vec3';

/** A place by latitude `lat` and longitude `lon`, in radians. */
export type LatLon = { readonly lat: number; readonly lon: number };

/** The unit vector at latitude `lat` and longitude `lon`. */
export function latLonToUnit({ lat, lon }: LatLon): Vec3 {
  const across = Math.cos(lat);
  return [across * Math.cos(lon), Math.sin(lat), -across * Math.sin(lon)];
}

/**
 * The latitude and longitude of direction `p` (any length but zero),
 * longitude in `[−π, π]`; at a pole longitude is `±0`.
 */
export function unitToLatLon(p: Vec3): LatLon {
  const [x, y, z] = p;
  return { lat: Math.atan2(y, Math.hypot(x, z)), lon: Math.atan2(-z, x) };
}

/** Where `northAt` stops trusting the meridian and falls back to `+X`'s. */
const POLE_LATITUDE = (89.9999 * Math.PI) / 180;

/**
 * The unit tangent toward geographic north at direction `p`. Within 1e-4° of a
 * pole, where the meridian through `p` is ill-defined, it is the `+X`
 * meridian's north instead — `−X` at the North Pole, `+X` at the South —
 * projected onto the tangent plane at `p`.
 */
export function northAt(p: Vec3): Vec3 {
  const at = unit(p);
  const { lat } = unitToLatLon(at);
  const toward: Vec3 =
    Math.abs(lat) > POLE_LATITUDE ? [lat > 0 ? -1 : 1, 0, 0] : [0, 1, 0];
  return unit(sub(toward, scaled(at, dot(toward, at))));
}
