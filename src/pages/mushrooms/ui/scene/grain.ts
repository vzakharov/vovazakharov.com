/**
 * The land's grain, pure: a tile of seeded noise, each pixel white or black at its own alpha, so laid over a
 * fill it lifts some pixels and sinks others and leaves the fill's colour as
 * it was on the whole.
 */

import type { Topped } from '../../model/geometry';
import { mulberry32 } from '../../model/random';
import type { MeadowLayout } from './layout';

/** Each pixel's own share against its four neighbours' in the blur, which softens noise into tooth. */
const OWN = 0.5;

/** `side`² pixels of RGBA grain, row by row, from `seed` alone; it tiles, its blur wrapping at the edges. */
export function grainPixels(seed: number, side: number): Uint8ClampedArray {
  const random = mulberry32(seed);
  const noise = Array.from({ length: side * side }, () => random());
  const at = (x: number, y: number) =>
    noise[((y + side) % side) * side + ((x + side) % side)] ?? 0;
  const soft = noise.map((own, index) => {
    const x = index % side;
    const y = Math.floor(index / side);
    const around =
      (at(x - 1, y) + at(x + 1, y) + at(x, y - 1) + at(x, y + 1)) / 4;
    return own * OWN + around * (1 - OWN);
  });
  const mean = soft.reduce((sum, value) => sum + value, 0) / soft.length;
  const spread = Math.max(...soft.map((value) => Math.abs(value - mean)));
  const pixels = new Uint8ClampedArray(side * side * 4);
  for (const [index, value] of soft.entries()) {
    const signed = spread === 0 ? 0 : (value - mean) / spread;
    const light = signed > 0 ? 255 : 0;
    pixels.set([light, light, light, Math.abs(signed) * 255], index * 4);
  }
  return pixels;
}

/** How far down the ground, as a share of its depth, the grain takes to come fully in, and in how many strips. */
const GRAIN_RAMP = 0.2;
const GRAIN_STEPS = 10;

/** The rows from `top` to `bottom`, in CSS pixels. */
export type Band = Topped & { bottom: number };

/** One strip of the grain: the rows it covers, and its share of the grain's full alpha. */
export type GrainStrip = Band & { share: number };

/**
 * The grain's strips from `top`, the seam's highest point, to the bottom
 * edge, each a little stronger than the one above: the grain fades in over
 * `GRAIN_RAMP` of the ground rather than stepping in along one line.
 */
export function grainStrips(
  { height, groundTop }: MeadowLayout,
  top: number,
): GrainStrip[] {
  const step = ((height - groundTop) * GRAIN_RAMP) / GRAIN_STEPS;
  return Array.from({ length: GRAIN_STEPS + 1 }, (_, index) => ({
    top: top + index * step,
    bottom: index === GRAIN_STEPS ? height : top + (index + 1) * step,
    share: (index + 1) / (GRAIN_STEPS + 1),
  }));
}
