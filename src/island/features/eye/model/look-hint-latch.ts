/**
 * How long a look hint stays on screen: lit for a while from the tick it is
 * earned, then fading out by itself, whatever its condition does meanwhile —
 * so a hint earned for a fraction of a second is still read. It shows again
 * only once its condition has lapsed and come back.
 */

import type { LookHint } from './look-hint';

/** Seconds a shown look hint stays lit before it starts to fade. */
export const LOOK_HINT_LIT_SECONDS = 3;

/** Seconds a look hint then takes to fade out. */
export const LOOK_HINT_FADE_SECONDS = 0.5;

/** One showing of a hint, a new object each time a hint is shown. */
export type HintShowing = {
  readonly hint: LookHint;
  /** When it was shown, seconds on the clock `latchHint` is fed. */
  readonly since: number;
};

export type HintLatch = {
  /** The hint the eye earned on the last tick, shown or not. */
  readonly earned: LookHint | undefined;
  /** What is on screen, lit or fading. */
  readonly showing: HintShowing | undefined;
};

export const NO_HINT: HintLatch = { earned: undefined, showing: undefined };

/**
 * The latch one tick on, at `now` seconds, the eye having earned `earned`. A
 * hint shows on the tick it is earned after a tick that earned anything else
 * — none, or the other hint, which it then replaces at once — and goes once
 * lit and faded. `showing` keeps its identity while it stays up.
 */
export function latchHint(
  latch: HintLatch,
  earned: LookHint | undefined,
  now: number,
): HintLatch {
  if (earned !== undefined && earned !== latch.earned) {
    return { earned, showing: { hint: earned, since: now } };
  }
  const { showing } = latch;
  const over =
    showing !== undefined &&
    now - showing.since >= LOOK_HINT_LIT_SECONDS + LOOK_HINT_FADE_SECONDS;
  return { earned, showing: over ? undefined : showing };
}
