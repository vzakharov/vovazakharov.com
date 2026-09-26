/**
 * Where everything in the meadow stands, as a pure function of the viewport in
 * CSS pixels. Every size is proportional, so a phone held upright and a tablet
 * held sideways get the same picture composed for each.
 */

import type { Sized } from '@/shared/typings';

import type { Circle, Point } from '../../model/geometry';
import { maxReach } from '../../model/mushroom-pose';

/**
 * Where a mushroom's foot stands, its size — the unit its genes are in — and
 * the `splay` it is stood with (`splayed`).
 */
type Placement = Point & { size: number; splay: number };

/** How close, in CSS pixels, a cap may come to the side of the screen. */
export const EDGE_MARGIN = 12;
/** The opening pair's turn apart, like the V of Syama's two caps. */
const CLUMP_SPLAY = 0.22;
/** The sun's glow reaches this many radii out, and must stay on screen. */
export const SUN_GLOW_REACH = 2.6;

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
  const wanted = portrait
    ? Math.min(width * 0.6, height * 0.34)
    : height * 0.44;
  // One clump, as in the drawing: two feet close together, the back one
  // leaning left and the front one right, their stems crossing.
  const clump = width * (portrait ? 0.5 : 0.49);
  const feet = [
    {
      x: clump + wanted * 0.08,
      y: groundTop + ground * 0.42,
      scale: 0.9,
      side: -1,
    },
    {
      x: clump - wanted * 0.06,
      y: groundTop + ground * 0.6,
      scale: 1,
      side: 1,
    },
  ] as const;
  // A size held under `maxReach` keeps every cap on screen, whatever its genes.
  const reach = maxReach(CLUMP_SPLAY);
  const fits = Math.min(
    ...feet.map(({ x, scale, side }) => {
      const [left, right] =
        side < 0 ? [reach.toward, reach.away] : [reach.away, reach.toward];
      return (
        Math.min((x - EDGE_MARGIN) / left, (width - EDGE_MARGIN - x) / right) /
        scale
      );
    }),
  );
  const size = Math.min(wanted, fits);
  const sunR = short * 0.075;
  return {
    width,
    height,
    horizon,
    nearHills: horizon + (groundTop - horizon) * 0.45,
    groundTop,
    // Pulled in from the corner until its glow fits, which only a phone's
    // narrow width calls for.
    sun: {
      x: Math.min(width * 0.84, width - sunR * SUN_GLOW_REACH),
      y: Math.max(height * 0.15, sunR * SUN_GLOW_REACH),
      r: sunR,
    },
    clouds: [
      { x: width * 0.16, y: height * 0.14, r: short * 0.06 },
      { x: width * 0.5, y: height * 0.08, r: short * 0.045 },
      { x: width * 0.68, y: height * 0.24, r: short * 0.05 },
    ],
    mushrooms: feet.map(({ x, y, scale, side }) => ({
      x,
      y,
      size: size * scale,
      splay: side * CLUMP_SPLAY,
    })),
  };
}
