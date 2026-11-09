/**
 * What `play-island` shoots on each world: ours at five heights and along its
 * inlet, Earth (#0) at orbit from six sides and at 1,000 km over three coasts,
 * and every other world at orbit from two sides. Places are in degrees, east
 * positive, as the play hook's `moveTo` takes them.
 */

import type { Named } from '@/kernel/shared/typings';

import type { LatLon } from '@/island/shared/globe';
import { OUR_WORLD } from '@/island/entities/terrain';
import { openingOf } from '@/island/features/eye';

import { INLET, INLET_HEAD } from './places';
import { call } from './play-tab';

/**
 * A frame by the name it is filed under, the hook call placing the eye, and
 * the hour `setTime` sets first — none keeps the clock where it stands.
 */
export type Shot = Named & {
  readonly place: string;
  readonly hours?: number;
};

const ORBIT = 20_000_000;
const COAST = 1_000_000;

/** `m` metres over `place`, its `LatLon` in the hook's degrees rather than radians. */
const over = ({ lat, lon }: LatLon, m: number) => call('moveTo', lat, lon, m);

/** The play hook's day, which `setTime` counts in. */
const HOOK_DAY_HOURS = 24;
const DEGREES_PER_HOUR = 360 / HOOK_DAY_HOURS;

/**
 * The hour that stands at meridian `lon` as hour 0 stands at the world's
 * opening, `earlier` hours before it: hour 0 is afternoon over the opening,
 * and the planet turns east under a fixed sun, so a meridian `Δ` degrees
 * west of the opening reaches that sun `Δ / 15` hours later.
 */
function afternoonAt(world: string, lon: number, earlier: number): number {
  const opening = (openingOf(Number(world)).lon * 180) / Math.PI;
  const hours = (opening - lon) / DEGREES_PER_HOUR - earlier;
  return ((hours % HOOK_DAY_HOURS) + HOOK_DAY_HOURS) % HOOK_DAY_HOURS;
}

/**
 * How much earlier than the opening's low afternoon an orbit frame is shot:
 * the opening's sun stands far enough west that, from orbit, the disc's
 * eastern third is night; two and a half hours back lights all but its rim.
 */
const ORBIT_EARLIER = 2.5;

/** A frame from orbit over `place`, at that meridian's early afternoon. */
const orbitOver = (world: string, name: string, place: LatLon): Shot => ({
  name,
  place: over(place, ORBIT),
  hours: afternoonAt(world, place.lon, ORBIT_EARLIER),
});

/** A frame `COAST` metres over `place`, under the opening's own low sun for relief. */
const coastOver = (world: string, name: string, place: LatLon): Shot => ({
  name,
  place: over(place, COAST),
  hours: afternoonAt(world, place.lon, 0),
});

const HEIGHTS: readonly Shot[] = [
  { name: 'orbit', place: call('setHeight', ORBIT) },
  { name: '1000km', place: call('setHeight', COAST) },
  { name: '10km', place: call('setHeight', 10_000) },
  { name: '100m', place: call('setHeight', 100) },
  { name: '2m', place: call('setHeight', 2) },
];

const ALONG_INLET: readonly Shot[] = [
  // The inlet's whole length, then the strait and the pool at its head.
  { name: 'inlet', place: over(INLET, 1_500_000) },
  { name: 'inlet-head', place: over(INLET_HEAD, 300_000) },
  // The same place facing west: last, since every later place keeps the heading.
  { name: 'inlet-head-west', place: call('turnTo', -Math.PI / 2) },
];

const EARTH = '0';

/**
 * Earth from four sides over the equator and over both poles, each pole's
 * meridian chosen so the half the equinox sun lights holds the most ice and
 * land: Greenland and the Canadian Arctic to the north, the Weddell side of
 * Antarctica to the south.
 */
const EARTH_ORBITS: readonly Shot[] = [
  orbitOver(EARTH, 'orbit-0', { lat: 0, lon: 0 }),
  orbitOver(EARTH, 'orbit-90e', { lat: 0, lon: 90 }),
  orbitOver(EARTH, 'orbit-180', { lat: 0, lon: 180 }),
  orbitOver(EARTH, 'orbit-90w', { lat: 0, lon: -90 }),
  orbitOver(EARTH, 'orbit-north', { lat: 90, lon: -15 }),
  orbitOver(EARTH, 'orbit-south', { lat: -90, lon: 30 }),
];

const EARTH_COASTS: readonly Shot[] = [
  coastOver(EARTH, 'italy', { lat: 41, lon: 14 }),
  coastOver(EARTH, 'florida', { lat: 27, lon: -81 }),
  coastOver(EARTH, 'japan', { lat: 36, lon: 138 }),
];

/** A random world from orbit over the equator at 0° and at 180°. */
const twoSides = (world: string): readonly Shot[] => [
  orbitOver(world, 'orbit-0', { lat: 0, lon: 0 }),
  orbitOver(world, 'orbit-180', { lat: 0, lon: 180 }),
];

/** The frames `play-island` shoots on `world`. */
export function shotsFor(world: string): readonly Shot[] {
  if (world === OUR_WORLD) return [...HEIGHTS, ...ALONG_INLET];
  if (world === EARTH) return [...EARTH_ORBITS, ...EARTH_COASTS];
  return twoSides(world);
}
