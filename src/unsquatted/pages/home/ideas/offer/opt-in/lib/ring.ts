/** The share of the ring the model's load fills; the generation fills the rest. */
export const LOAD_SHARE = 0.75;
/** How long the first generation is guessed to take, before any is timed. */
export const FIRST_GUESS_SECONDS = 8;
/**
 * Added to the timed generation, so the variations land a little before the
 * ring closes rather than after it.
 */
export const MARGIN_SECONDS = 2;
/** Smooths the ring between two of the load's progress reports. */
const STEP_SECONDS = 0.3;

/** Where the ring heads, and how long it takes, linearly, to get there. */
export type RingTarget = { to: number; seconds: number };

type RingState = {
  /** The fraction loaded while a load runs. */
  loading: number | undefined;
  /** The visitor pressed the button for the label shown. */
  asked: boolean;
  /** The model is loaded and can generate at once. */
  ready: boolean;
  /** How long the first generation took, once one was timed. */
  timed: number | undefined;
};

/**
 * The ring round the lightbulb: the load fills it to `LOAD_SHARE`, and the
 * generation closes it over the time the first one took, plus the margin. A
 * generation running longer than that leaves the ring closed until it ends.
 */
export function ringOf({
  loading,
  asked,
  ready,
  timed,
}: RingState): RingTarget | undefined {
  if (loading !== undefined)
    return { to: loading * LOAD_SHARE, seconds: STEP_SECONDS };

  if (!asked) return;

  // The load is about to start.
  if (!ready) return { to: 0, seconds: 0 };

  return {
    to: 1,
    seconds: timed === undefined ? FIRST_GUESS_SECONDS : timed + MARGIN_SECONDS,
  };
}

/** The ring moving linearly from one fill to another over its seconds. */
export type RingMove = { from: number } & RingTarget;

/** Where a move has the ring after `elapsed` seconds. */
export function fillAt({ from, to, seconds }: RingMove, elapsed: number) {
  if (seconds <= 0 || elapsed >= seconds) return to;

  return from + ((to - from) * Math.max(elapsed, 0)) / seconds;
}

/**
 * One half of the ring's share of a move: its own fill, 0 to 1, going from
 * `from` to `to` after `delay` seconds and over `seconds`.
 */
export type HalfSweep = RingMove & { delay: number };

/**
 * A move split between the ring's two halves, which turn one after the other:
 * the first fills the ring to its half, the second from there on.
 */
export function halvesOf(move: RingMove): [HalfSweep, HalfSweep] {
  return [halfOf(move, 0), halfOf(move, 0.5)];
}

function halfOf({ from, to, seconds }: RingMove, start: number): HalfSweep {
  const clamp = (fill: number) => Math.min(Math.max(fill, start), start + 0.5);
  const enter = clamp(from);
  const leave = clamp(to);
  const local = (fill: number) => (fill - start) / 0.5;
  // Seconds per unit of fill; a jump, or a half the move never enters, none.
  const pace =
    to === from || enter === leave ? 0 : seconds / Math.abs(to - from);

  return {
    from: local(enter),
    to: local(leave),
    delay: Math.abs(enter - from) * pace,
    seconds: Math.abs(leave - enter) * pace,
  };
}
