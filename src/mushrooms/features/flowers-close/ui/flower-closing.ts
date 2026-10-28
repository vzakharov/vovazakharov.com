/**
 * How a flower closes in the rain and for the night: by the meadow's
 * `wetness` or its dusk, whichever is the further on (`bedClosing`), from 0
 * (open) to 1 (a bud, its petals standing folded up over the head's
 * middle), in `CLOSING_STEPS` steps, since a head is repainted only when its
 * closing crosses one.
 */

import type { Ahead, Drawn } from '@/mushrooms/shared/world';
import type { Shut } from '@/mushrooms/entities/flower/index.node-safe';

/** How many steps a flower closes in, each one repaint of its head. */
export const CLOSING_STEPS = 12;

/** How far the bed is shut by the meadow's `wetness` and its `duskness`, each 0 to 1: as far as the further on. */
export const bedClosing = (wetness: number, duskness: number): number =>
  Math.max(wetness, duskness);

/** `closing` clamped to 0–1 and rounded to the nearest of `CLOSING_STEPS` steps. */
export function closingStep(closing: number): number {
  const clamped = Math.min(1, Math.max(0, closing));
  return Math.round(clamped * CLOSING_STEPS) / CLOSING_STEPS;
}

/**
 * How many heads a frame repaints for the closing at the most: a step's
 * repaints spread over a few frames rather than landing on one.
 */
const CLOSINGS_PER_FRAME = 6;

/** A flower as the closing sees it: how far shut it was painted, and where it stands. */
type Closing = Shut & { stands: Drawn & Ahead };

/** How far shut `flowers` are painted, on average, from 0 (open) to 1; 0 with none. */
export function meanClosing(flowers: readonly Shut[]): number {
  const sum = flowers.reduce((total, { closing }) => total + closing, 0);
  return flowers.length === 0 ? 0 : sum / flowers.length;
}

/**
 * Those of `flowers` a frame repaints at the closing `step`: the `most` not
 * painted at it, those drawn before those not, the nearest first.
 */
export function closingsDue<Flower extends Closing>(
  flowers: Iterable<Flower>,
  step: number,
  most = CLOSINGS_PER_FRAME,
): Flower[] {
  return [...flowers]
    .filter(({ closing }) => closing !== step)
    .toSorted(
      ({ stands: one }, { stands: other }) =>
        Number(other.drawn) - Number(one.drawn) || one.ahead - other.ahead,
    )
    .slice(0, most);
}
