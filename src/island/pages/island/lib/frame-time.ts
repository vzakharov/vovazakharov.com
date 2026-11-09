/** How long a change in frame time takes to show two-thirds of itself, ms. */
const SETTLE_MS = 500;

/**
 * The frame time smoothed over about `SETTLE_MS`, given the last smoothed
 * value (none before the first frame) and the frame just taken, `ms` long:
 * each frame weighs by its own length, so the smoothing holds its time span
 * at any frame rate.
 */
export function smoothedFrameMs(last: number | undefined, ms: number): number {
  if (last === undefined) return ms;
  return last + (ms - last) * (1 - Math.exp(-ms / SETTLE_MS));
}
