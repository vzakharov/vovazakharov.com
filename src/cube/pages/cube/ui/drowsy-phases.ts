import type { Sized } from '@/kernel/shared/typings';

/** The shares the drowsy eye draws at: one pixel in n×n a frame. */
export const SHARES = [2, 3, 4] as const;

export type Share = (typeof SHARES)[number];

/**
 * The order each share's frames visit the pixels of an n×n block, by index
 * `x + n·y`: each step lands as far as it can from the ones before it, so a
 * still view fills evenly rather than in rows. 2 runs the diagonals, 4 is
 * Bayer's.
 */
const ORDERS: Record<Share, readonly number[]> = {
  2: [0, 3, 1, 2],
  3: [0, 5, 7, 1, 6, 8, 2, 3, 4],
  4: [0, 10, 2, 8, 5, 15, 7, 13, 1, 11, 3, 9, 4, 14, 6, 12],
};

/** A pixel's place inside its block, 0 to n − 1 on each axis. */
export type Jitter = { x: number; y: number };

/** The pixel of every block that frame number `frame` draws at `share`. */
export function jitterOf(share: Share, frame: number): Jitter {
  const order = ORDERS[share];
  const index = order[frame % order.length] ?? 0;
  return { x: index % share, y: Math.floor(index / share) };
}

/** The size of the low pass of a `full` frame at `share`: a pixel a block. */
export const lowSizeOf = ({ width, height }: Sized, share: Share): Sized => ({
  width: Math.ceil(width / share),
  height: Math.ceil(height / share),
});

/**
 * `viewProjection` (column-major) moved so that the low pass's pixel
 * `(i, j)`, of a `low` frame, shows the full frame's pixel
 * `(share·i + x, share·j + y)` at its centre: the low frame covers
 * `share·low` full pixels from the full frame's top left, a little past its
 * far edges where `share` does not divide them.
 */
export function shifted(
  viewProjection: Float32Array,
  { x, y }: Jitter,
  full: Sized,
  low: Sized,
  share: Share,
): Float32Array {
  // Clip x (and y, flipped, pixels running down) maps affinely from the full
  // frame to the low one: scale `s`, then an offset in units of w.
  const sx = full.width / (share * low.width);
  const sy = full.height / (share * low.height);
  const tx = sx - 1 - (2 * x + 1 - share) / (share * low.width);
  const ty = 1 - sy + (2 * y + 1 - share) / (share * low.height);
  const out = Float32Array.from(viewProjection);
  for (let column = 0; column < 4; column += 1) {
    const at = column * 4;
    const w = viewProjection[at + 3] ?? 0;
    out[at] = sx * (viewProjection[at] ?? 0) + tx * w;
    out[at + 1] = sy * (viewProjection[at + 1] ?? 0) + ty * w;
  }
  return out;
}
