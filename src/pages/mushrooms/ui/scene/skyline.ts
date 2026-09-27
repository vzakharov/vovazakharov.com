/**
 * The hills' skylines, as points across the screen in CSS pixels: pure, so
 * a sweep can check what stands in front of the sun without painting.
 */

import { type Point, sample } from '../../model/geometry';
import { smooth } from '../../model/motion';
import { between, type Random } from '../../model/random';
import type { MeadowLayout } from './layout';
import { SUN_GLOW_REACH } from './sun-layout';

const HILL_STEPS = 64;
/** How far the far hills rise above the horizon at most, as a share of the way down to the ground's top. */
const FAR_RISE = 0.9;

/** A rolling skyline from a sum of two waves, its phases drawn from `random`. */
export function hillLine(
  random: Random,
  width: number,
  base: number,
  amplitude: number,
): Point[] {
  const phase = between(random, 0, Math.PI * 2);
  const phase2 = between(random, 0, Math.PI * 2);
  const waves = between(random, 1.2, 2.2);
  return sample(0, 1, HILL_STEPS, (t) => {
    const swell =
      0.65 * Math.sin(t * Math.PI * waves + phase) +
      0.35 * Math.sin(t * Math.PI * waves * 2.3 + phase2);
    return { x: t * width, y: base - amplitude * (0.5 + 0.5 * swell) };
  });
}

/**
 * The far hills' skyline: a rolling line rising from the horizon, parted
 * under the sun — let down to the disc's foot, never below the horizon, and
 * easing back over the glow either side — so no hill stands in front of it.
 */
export function farSkyline(
  random: Random,
  { width, horizon, groundTop, sun }: MeadowLayout,
): Point[] {
  const line = hillLine(
    random,
    width,
    horizon,
    (groundTop - horizon) * FAR_RISE,
  );
  const foot = Math.min(horizon, sun.y + sun.r);
  const glow = sun.r * SUN_GLOW_REACH;
  return line.map(({ x, y }) => {
    const parted = 1 - smooth((Math.abs(x - sun.x) - sun.r) / (glow - sun.r));
    return { x, y: y + Math.max(0, foot - y) * parted };
  });
}
