/**
 * The meadow's weather as pure functions of its rain span and the clock, in
 * ms on the insects' clock (`Timed.now`), so the scene sets every frame from
 * the clock and nothing has to end a shower.
 */

import { outAndBack, smooth, type Started } from './motion';

/** A shower, from its first drop to the moment it stops. */
export type Rain = Started & { stopsAt: number };

/** How long a shower lasts from the tap that starts or restarts it. */
export const RAIN_MS = 10_000;
/** How long the meadow takes to get wet as a shower starts, and to dry as it stops. */
const WET_MS = 1500;
/** How long the drops take to come on in full. */
const DOWNPOUR_MS = 600;
/** How long the rainbow takes to show once a shower stops, stays, and takes to go. */
const RAINBOW_RISE_MS = 1500;
const RAINBOW_HOLD_MS = 8000;
const RAINBOW_FADE_MS = 3000;

/** When the dark of `rain` sets in: the moment the meadow is wet through. */
export function darkAt(rain: Rain): number {
  return rain.startedAt + WET_MS;
}

/** Whether `rain` is falling at `now`. */
export function raining(rain: Rain | undefined, now: number): boolean {
  return rain !== undefined && rain.startedAt <= now && now < rain.stopsAt;
}

/**
 * How wet the meadow is at `now`, from 0 to 1: eased in over `WET_MS` from
 * the start, 1 while it rains, eased out over `WET_MS` after the end.
 */
export function wetness(rain: Rain | undefined, now: number): number {
  if (rain === undefined) return 0;
  return (
    smooth((now - rain.startedAt) / WET_MS) *
    (1 - smooth((now - rain.stopsAt) / WET_MS))
  );
}

/**
 * How hard it is raining at `now`, from 0 to 1: the share of the drops
 * falling, coming on over `DOWNPOUR_MS` and stopping at the end.
 */
export function downpour(rain: Rain | undefined, now: number): number {
  if (rain === undefined || !raining(rain, now)) return 0;
  return smooth((now - rain.startedAt) / DOWNPOUR_MS);
}

/**
 * How strongly the rainbow shows at `now`, from 0 to 1: nothing until the
 * shower stops, then in over `RAINBOW_RISE_MS`, held for `RAINBOW_HOLD_MS`
 * and out over `RAINBOW_FADE_MS`. It belongs to the span alone, so a new
 * shower started under it puts it out until that shower's own end.
 */
export function rainbow(rain: Rain | undefined, now: number): number {
  if (rain === undefined || now < rain.stopsAt) return 0;
  return outAndBack(
    now - rain.stopsAt,
    RAINBOW_RISE_MS,
    RAINBOW_HOLD_MS,
    RAINBOW_FADE_MS,
  );
}
