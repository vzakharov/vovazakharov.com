/** Seconds within which a second Shift press makes a double press. */
const DOUBLE_PRESS = 0.3;

/**
 * The pace a body keeps with no Shift held — `runsUnheld` — and when the last
 * Shift press that could start a double press came, in seconds.
 */
type Pace = { runsUnheld: boolean; pressedAt: number | null };

/** The pace a body keeps at first: a walk. */
export const WALKING: Pace = { runsUnheld: false, pressedAt: null };

/**
 * `pace` after a Shift press at `at` seconds: a press within `DOUBLE_PRESS`
 * of the one before turns the standing pace over, and is spent by it, so a
 * third press starts a fresh pair.
 */
export function pressedShift(pace: Pace, at: number): Pace {
  const { runsUnheld, pressedAt } = pace;
  return pressedAt !== null && at - pressedAt <= DOUBLE_PRESS
    ? { runsUnheld: !runsUnheld, pressedAt: null }
    : { runsUnheld, pressedAt: at };
}
