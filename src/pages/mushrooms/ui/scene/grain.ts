/**
 * The land's texture, pure: the ground's mottling, and its grain — a tile of
 * seeded noise, each pixel white or black at its own alpha, so laid over a
 * fill it lifts some pixels and sinks others and leaves the fill's colour as
 * it was on the whole.
 */

import type { Oval } from '../../model/bee-outline';
import { between, mulberry32, type Random } from '../../model/random';
import { depthScale, type MeadowLayout } from './layout';

const MOTTLES = 24;

/** A flattened patch of the ground a little lighter or deeper than round it, so the meadow reads as rolling. */
export type Mottle = Oval & { deep: boolean };

/** The ground's patches, drawn from `random`, so the same source mottles it the same; smaller the farther back they lie. */
export function mottles(
  random: Random,
  { width, height, groundTop }: MeadowLayout,
): Mottle[] {
  const depth = height - groundTop;
  return Array.from({ length: MOTTLES }, () => {
    const down = between(random, 0.06, 1) ** 1.3;
    const rx = between(random, 0.05, 0.12) * width * depthScale(down) * 0.8;
    return {
      x: between(random, 0, width),
      y: groundTop + depth * down,
      rx,
      ry: rx * between(random, 0.18, 0.25),
      deep: random() < 0.5,
    };
  });
}

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
