/**
 * Where the sun stands, in CSS pixels: in the top right, over the horizon,
 * its glow on screen and its rays off every button.
 */

import type { Circle } from '../../model/geometry';
import { everyPlace } from './clump-layout';
import type { MeadowLayout } from './layout';
import { BUTTON_INSET, type Controls, tapReach } from './sky-layout';

/** The sun's glow reaches this many radii out, and must stay on screen. */
export const SUN_GLOW_REACH = 2.6;
/** The sun's longest rays reach this many radii out. */
export const SUN_RAY_REACH = 1.8;
/**
 * The least share of its size the sun shrinks to, on a crowded screen, to
 * keep its whole disc above the horizon.
 */
const SUN_LEAST = 0.5;

/** Where the far hills meet the meadow, as a share down a screen `width` by `height`. */
export function horizonAt(width: number, height: number): number {
  return height * (height > width ? 0.36 : 0.42);
}

/**
 * The sun, of radius `r` at the most, as `sunAt` places it: shrunk, a pixel
 * at a time, until its whole disc stands above the horizon, which also frees
 * the corner where only its rays kept it off; never below `SUN_LEAST`.
 */
export function placeSun(
  width: number,
  height: number,
  r: number,
  controls: Controls,
): Circle {
  const horizon = horizonAt(width, height);
  let sun = sunAt(width, height, r, controls);
  for (let size = r - 1; size >= r * SUN_LEAST; size--) {
    if (sun.y + sun.r <= horizon) break;
    sun = sunAt(width, height, size, controls);
  }
  return sun;
}

/**
 * The sun, of radius `r`, in the top right, pulled in from the corner until
 * its glow fits. Where its rays would reach a picker's row it comes down below
 * the rows — over on the left, where a phone's narrow width brings a row down
 * onto the sun itself — and it moves left until its rays keep `BUTTON_INSET`
 * off the buttons down the right, and right until they keep it off the
 * insects'.
 */
function sunAt(
  width: number,
  height: number,
  r: number,
  { plus, minus, house, releases, picker, housePicker }: Controls,
): Circle {
  const glow = r * SUN_GLOW_REACH;
  const rays = r * SUN_RAY_REACH;
  const corner = {
    x: Math.min(width * 0.84, width - glow),
    y: Math.max(height * 0.15, glow),
  };
  const picks = [...picker, ...housePicker];
  const meets = (reach: number) =>
    picks.some(
      (pick) =>
        Math.hypot(pick.x - corner.x, pick.y - corner.y) <
        tapReach(pick.r) + reach,
    );
  const { x: across, y } = meets(rays)
    ? {
        x: meets(r) ? width - corner.x : corner.x,
        y: Math.max(...picks.map((pick) => pick.y + tapReach(pick.r))) + rays,
      }
    : corner;
  /** How far across from `button` the sun's rays keep `BUTTON_INSET` off it: 0 when they clear it at any x. */
  const clearing = (button: Circle) => {
    const reach = tapReach(button.r) + rays + BUTTON_INSET;
    const rise = button.y - y;
    return Math.abs(rise) < reach ? Math.sqrt(reach ** 2 - rise ** 2) : 0;
  };
  const x = Math.min(
    across,
    ...[plus, minus, house].map((button) =>
      clearing(button) > 0 ? button.x - clearing(button) : across,
    ),
  );
  const rightOf = Object.values(releases).map((button) =>
    clearing(button) > 0 ? button.x + clearing(button) : x,
  );
  return { x: Math.max(x, ...rightOf), y, r };
}

/** How far down the ground, as a share of its depth, the sun's wash over the land may reach. */
const WASH_FLOOR = 1 / 3;
/** How far round a mushroom's foot, in its size, the wash leaves the ground as it is: its foot and the shadow round it. */
export const WASH_FOOT_CLEAR = 0.5;
/** The wash's rings, one disc of each alpha per ring. */
const WASH_RINGS = 10;
/** The wash's innermost and outermost rings, in sun radii, before it is shrunk to fit. */
const WASH_REACH = [4, 14] as const;

/**
 * The farthest the sun's wash over the land reaches from its middle: down to
 * the ground's upper third at most, and short of every mushroom slot's foot
 * and the shadow round it, taken or not, so it never lifts the ground a
 * mushroom stands on.
 */
function washReach({
  sun,
  groundTop,
  height,
  mushrooms,
}: Pick<MeadowLayout, 'sun' | 'groundTop' | 'height' | 'mushrooms'>): number {
  return Math.min(
    groundTop + (height - groundTop) * WASH_FLOOR - sun.y,
    ...everyPlace(mushrooms).map(
      ({ x, y, size }) =>
        Math.hypot(x - sun.x, y - sun.y) - size * WASH_FOOT_CLEAR,
    ),
  );
}

/**
 * The radii of the wash's rings round the sun's middle, innermost first:
 * shrunk as a whole to fit inside `washReach`, rather than each clamped, so
 * no two share an edge that would stack into a line.
 */
export function washRings(
  layout: Pick<MeadowLayout, 'sun' | 'groundTop' | 'height' | 'mushrooms'>,
): number[] {
  const outer = Math.min(layout.sun.r * WASH_REACH[1], washReach(layout));
  return Array.from({ length: WASH_RINGS }, (_, ring) => {
    const t = ring / (WASH_RINGS - 1);
    return (
      (outer * (WASH_REACH[0] + (WASH_REACH[1] - WASH_REACH[0]) * t)) /
      WASH_REACH[1]
    );
  });
}
