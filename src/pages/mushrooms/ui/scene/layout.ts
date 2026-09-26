/**
 * Where everything in the meadow stands, as a pure function of the viewport in
 * CSS pixels. Every size is proportional, so a phone held upright and a tablet
 * held sideways get the same picture composed for each.
 */

import type { Sized } from '@/shared/typings';

import type { Circle, Point } from '../../model/geometry';

/** Where a mushroom's foot stands, and its size — the unit its genes are in. */
type Placement = Point & { size: number };

export type MeadowLayout = Sized & {
  /** Where the far hills meet the sky. */
  horizon: number;
  /** The top of the near hills' band. */
  nearHills: number;
  /** Where the flat ground the mushrooms stand on begins. */
  groundTop: number;
  sun: Circle;
  clouds: readonly Circle[];
  /** Back to front, which is the order they are painted in. */
  mushrooms: readonly Placement[];
};

export function meadowLayout(width: number, height: number): MeadowLayout {
  const portrait = height > width;
  const groundTop = height * (portrait ? 0.62 : 0.6);
  const horizon = height * (portrait ? 0.46 : 0.42);
  const ground = height - groundTop;
  const short = Math.min(width, height);
  // Sized by height when the screen is wide, by width when it is tall, so a
  // mushroom never outgrows the side of the screen it has less of.
  const size = portrait ? Math.min(width * 0.6, height * 0.4) : height * 0.52;
  return {
    width,
    height,
    horizon,
    nearHills: horizon + (groundTop - horizon) * 0.45,
    groundTop,
    sun: { x: width * 0.84, y: height * 0.15, r: short * 0.075 },
    clouds: [
      { x: width * 0.16, y: height * 0.14, r: short * 0.06 },
      { x: width * 0.5, y: height * 0.08, r: short * 0.045 },
      { x: width * 0.68, y: height * 0.24, r: short * 0.05 },
    ],
    mushrooms: [
      {
        x: width * (portrait ? 0.32 : 0.38),
        y: groundTop + ground * 0.4,
        size: size * 0.92,
      },
      {
        x: width * (portrait ? 0.68 : 0.6),
        y: groundTop + ground * 0.72,
        size,
      },
    ],
  };
}
