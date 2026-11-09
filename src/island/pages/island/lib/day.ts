import {
  dot,
  type LatLon,
  latLonToUnit,
  scaled,
  type Vec3,
} from '@/island/shared/globe';

import { sunToward } from './sun';

/**
 * The opening's sun stands low, so a gentle slope turned toward it is lit
 * several times brighter than one turned away; and it comes from the
 * north-west — the top left of a screen looking north — where light reads as
 * raised relief rather than sunken.
 */
export const SUN_ELEVATION = 20;
const SUN_AZIMUTH = 315;

/** Hours in the game's day: one turn of the planet under the sun. */
export const DAY_HOURS = 24;

/** The sun and the full moon opposite it, each a unit vector toward it. */
export type Heavens = { readonly sun: Vec3; readonly moon: Vec3 };

/**
 * The sun and moon `hours` into a world that opens over `opening`. Both are
 * fixed in space and the planet turns under them, eastward about its `+Y`
 * axis, once a `DAY_HOURS` day; the scene turns them instead, the same thing on
 * screen with no tile moved. At hour 0 the sun stands at `SUN_ELEVATION` from
 * the north-west over the opening: its chosen low sun, not one overhead.
 */
export function heavensAt(opening: LatLon, hours: number): Heavens {
  const [x, y, z] = sunToward(
    SUN_ELEVATION,
    SUN_AZIMUTH,
    latLonToUnit(opening),
  );
  // The planet turning east carries the sun west: its longitude falls.
  const turn = (2 * Math.PI * hours) / DAY_HOURS;
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  const sun: Vec3 = [x * c - z * s, y, z * c + x * s];
  return { sun, moon: scaled(sun, -1) };
}

/** The sine of the sun's elevation where night is full. */
const NIGHT_BELOW = -0.1;
/** The sine of the sun's elevation where day is full: under the opening's. */
const DAY_ABOVE = 0.2;

/**
 * How much it is day under `up` with the sun toward `sun`: 1 by day, 0 by
 * night, eased through a twilight from the sun ~6° below the horizon to ~12°
 * above it. The opening's sun stands above that, so it opens in full day.
 */
export function daylight(sun: Vec3, up: Vec3): number {
  const t = Math.min(
    1,
    Math.max(0, (dot(sun, up) - NIGHT_BELOW) / (DAY_ABOVE - NIGHT_BELOW)),
  );
  return t * t * (3 - 2 * t);
}

/** The game's clock: hours since the opening, and whether they pass by themselves. */
export type Clock = { readonly hours: number; readonly running: boolean };

/** Where every world's clock opens: at the opening's sun, stopped. */
export const OPENING_CLOCK: Clock = { hours: 0, running: false };

/** Game hours a held scrub key moves per second; the fast scrub `FAST`× that. */
const SCRUB_HOURS_PER_SECOND = 1;
const FAST = 6;
/** Game hours a running clock passes per second: a day in 20 minutes. */
const RUN_HOURS_PER_SECOND = DAY_HOURS / (20 * 60);

/** Which way the scrub keys move the clock: back, not at all, forward. */
export type Scrub = -1 | 0 | 1;

/** The scrub keys held: which way, and whether fast. */
export type Scrubbing = { readonly scrub: Scrub; readonly fast: boolean };

/** `hours` wrapped into one day, `[0, DAY_HOURS)`. */
export const dayHours = (hours: number): number =>
  ((hours % DAY_HOURS) + DAY_HOURS) % DAY_HOURS;

/**
 * `clock` `dt` seconds on: scrubbed by `scrub` (`fast` six times as fast)
 * while a scrub key is held, and running on its own otherwise when it runs.
 * Hours stay in one day, `[0, DAY_HOURS)`.
 */
export function advance(
  clock: Clock,
  { scrub, fast }: Scrubbing,
  dt: number,
): Clock {
  const rate =
    scrub === 0
      ? clock.running
        ? RUN_HOURS_PER_SECOND
        : 0
      : scrub * SCRUB_HOURS_PER_SECOND * (fast ? FAST : 1);
  return { ...clock, hours: dayHours(clock.hours + rate * dt) };
}
