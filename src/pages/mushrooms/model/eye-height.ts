/**
 * How high the eye stands: at `EYE_HEIGHT` in steps, `FLIGHT_RISE` times
 * that in flight, easing between the two over `RISE_EASE` when the gait
 * flips. The horizon's row stays where it is, so the ground's top row, the
 * brow, the hills and the seam stay put on the screen and only the ground
 * they show grows deeper: the brow stands `browDistance` off.
 */

import { D_SEE, EYE_HEIGHT } from './ground';
import { smooth } from './motion';
import type { Gait } from './stride';

/**
 * How many times its walking height the eye stands in flight: a child
 * lifted onto a grown-up's shoulders, so the meadow still reads as a meadow
 * seen from in it, a little deeper, never as a map.
 */
export const FLIGHT_RISE = 1.2;

/** How long, in seconds, the eye takes to rise or settle when the gait flips. */
export const RISE_EASE = 0.5;

/** How high the eye stands above the plane, in the clump's size. */
export type Raised = { eyeHeight: number };

/** The eye's height easing toward its gait's: the height it eased `from`, `since` when. */
export type Rise = { from: number; since: number };

/** The rise a visit opens on: standing at the walking height. */
export const OPENING_RISE: Rise = { from: EYE_HEIGHT, since: 0 };

/** `lens` with the eye standing at its walking height. */
export function walking<Lens extends object>(lens: Lens): Lens & Raised {
  return { ...lens, eyeHeight: EYE_HEIGHT };
}

/** The height `gait` stands the eye at, once the ease is over. */
export function gaitHeight(gait: Gait): number {
  return gait === 'flight' ? EYE_HEIGHT * FLIGHT_RISE : EYE_HEIGHT;
}

/** The eye's height at `time`, easing from `rise.from` to `gait`'s. */
export function heightAt(rise: Rise, gait: Gait, time: number): number {
  const to = gaitHeight(gait);
  return rise.from + (to - rise.from) * smooth((time - rise.since) / RISE_EASE);
}

/**
 * The rise that eases on from wherever `rise` stands the eye at `time`
 * under the gait it had, `gait`, toward the next gait's height.
 */
export function riseFrom(rise: Rise, gait: Gait, time: number): Rise {
  return { from: heightAt(rise, gait, time), since: time };
}

/**
 * How far from the eye, in the clump's size, the brow stands at
 * `eyeHeight`: the ground's top row, which shows ground as much farther as
 * the eye stands higher.
 */
export function browDistance({ eyeHeight }: Raised): number {
  return (D_SEE * eyeHeight) / EYE_HEIGHT;
}

/** The farthest the brow ever stands: in flight. */
export const D_SEE_MOST = D_SEE * FLIGHT_RISE;
