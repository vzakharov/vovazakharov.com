/**
 * A stride, in the room sides a full-size body covers: 75 cm on floor 1. A
 * shrunk body's distances are divided by its scale before they are paced, so
 * it steps as often for its size.
 */
export const STRIDE = 0.15;

/** How far into the stride the body is, and how many steps just landed. */
export type Paced = { intoStride: number; landed: number };

/**
 * The walk after `moved` more room sides, `walked` being what the last call
 * gave back (0 to begin with): a step lands each time a stride is completed,
 * so a frame usually lands none, and a long one may land several.
 */
export function pace(walked: number, moved: number): Paced {
  const total = walked + Math.abs(moved);
  const steps = Math.floor(total / STRIDE);
  return { intoStride: total - steps * STRIDE, landed: steps };
}
