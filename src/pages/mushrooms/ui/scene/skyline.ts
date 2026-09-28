/**
 * The hills' skylines, as points across the screen in CSS pixels: pure, so
 * a sweep can check what stands in front of the sun without painting.
 */

import { type Point, sample } from '../../model/geometry';
import { between, type Random } from '../../model/random';
import type { MeadowLayout } from './layout';
import { SUN_RAY_REACH } from './sun-layout';

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
 * How deep under the sun's middle, in its radii, the far hills part; and how
 * soft, in radii, the crease is where a hill slope meets the parting.
 */
const PARTED_DEPTH = 2;
const PARTED_SOFTNESS = 0.4;

/** The larger of `a` and `b` — the lower on screen — with the crease between them rounded over `k`. */
function softLower(a: number, b: number, k: number): number {
  const h = Math.min(1, Math.max(0, 0.5 + (0.5 * (b - a)) / k));
  return a + (b - a) * h + k * h * (1 - h);
}

/**
 * The far hills' skyline: a rolling line rising from the horizon, parted
 * under the sun by a bowl `PARTED_DEPTH` radii deep at its middle, wide
 * enough that its sides stay under every ray, so no hill stands in front of
 * the sun and the parting has no level floor.
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
  const depth = sun.r * PARTED_DEPTH;
  const rays = sun.r * SUN_RAY_REACH;
  // A parabola through `depth` below the middle and `depth / 2` below it at
  // the rays' reach either side, which keeps it under the rays' circle.
  const bowl = (x: number) =>
    sun.y + depth - (depth * (x - sun.x) ** 2) / (2 * rays ** 2);
  return line.map(({ x, y }) => ({
    x,
    y: softLower(y, bowl(x), sun.r * PARTED_SOFTNESS),
  }));
}

/** The near hills' skyline, rolling across the band below the far hills'. */
export function nearSkyline(
  random: Random,
  { width, nearHills, groundTop }: MeadowLayout,
): Point[] {
  return hillLine(
    random,
    width,
    nearHills + (groundTop - nearHills) * 0.6,
    (groundTop - nearHills) * 1.1,
  );
}
