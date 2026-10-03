/**
 * How a flower closes in the rain: by the meadow's `wetness`, from 0 (open)
 * to 1 (its petals folded up to the centre), in `CLOSING_STEPS` steps, since a
 * head is repainted only when its closing crosses one.
 */

import type { BedPlace } from './bed-place';

/** How many steps a flower closes in, each one repaint of its head. */
export const CLOSING_STEPS = 12;

/** Of its open size, how far a closed flower's petals reach, how wide they stand, and how much of its centre shows. */
const FOLDED_REACH = 0.45;
const FOLDED_WIDTH = 0.8;
const FOLDED_DISC = 0.4;

/** `closing` clamped to 0–1 and rounded to the nearest of `CLOSING_STEPS` steps. */
export function closingStep(closing: number): number {
  const clamped = Math.min(1, Math.max(0, closing));
  return Math.round(clamped * CLOSING_STEPS) / CLOSING_STEPS;
}

/**
 * A head's shape `closing` of the way shut, each a share of the open head's:
 * how far its petals reach, how wide they stand, how much of its centre
 * shows, and where its petals start along their length, the closed ones
 * starting at the middle so they meet over it.
 */
export type Folding = Record<'reach' | 'width' | 'disc' | 'inner', number>;

export function folding(closing: number): Folding {
  const toward = (folded: number) => 1 - (1 - folded) * closing;
  return {
    reach: toward(FOLDED_REACH),
    width: toward(FOLDED_WIDTH),
    disc: toward(FOLDED_DISC),
    inner: 1 - closing,
  };
}

/** An open flower's head. */
export const OPEN: Folding = folding(0);

/**
 * How many heads a frame repaints for the closing at the most: a step's
 * repaints spread over a few frames rather than landing on one.
 */
export const CLOSINGS_PER_FRAME = 6;

/** How far shut a flower was last painted, a step of `closingStep`. */
export type Shut = { closing: number };

/** A flower as the closing sees it: how far shut it was painted, and where it stands. */
type Closing = Shut & { stands: Pick<BedPlace, 'drawn' | 'ahead'> };

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
