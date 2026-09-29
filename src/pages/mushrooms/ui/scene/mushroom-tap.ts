import {
  boxAround,
  type Circle,
  containsPoint,
  type Point,
} from '../../model/geometry';
import { TAP_PARTS, type TapArea } from '../../model/mushroom-outline';
import { TAP_RADIUS } from './sky-layout';

/**
 * How much narrower than its `capWidth` gene a mushroom's cap and gills are
 * drawn across at most, in its canvas frame: the rim's rounding cuts a corner
 * and the cap's lean tilts it.
 */
export const HEAD_SHORTFALL = 0.05;

/**
 * How wide across a mushroom's cap and gills stand in its canvas frame before
 * it counts as smaller than a finger: what a cap `2 × TAP_RADIUS` wide by its
 * gene — the narrowest the slot floors allow (`FINGER_SIZE` in `layout.ts`) —
 * is drawn across at the least.
 */
export const FINGER_ACROSS = 2 * TAP_RADIUS * (1 - HEAD_SHORTFALL);

/**
 * The circle a mushroom's tap area grows to hold once its head — cap and
 * gills, where a child aims — is drawn narrower than `FINGER_ACROSS`:
 * `TAP_RADIUS` round the middle of the head. `undefined` for a mushroom drawn
 * bigger, whose tap area stays exactly what is drawn, and for one not drawn
 * yet. In the same frame as `area`, pixels with y down.
 */
export function fingerPad(area: TapArea): Circle | undefined {
  const head = [...area.cap, ...area.gills];
  if (head.length === 0) return undefined;
  const { left, right, top, bottom } = boxAround(head);
  if (right - left >= FINGER_ACROSS) return undefined;
  return { x: (left + right) / 2, y: (top + bottom) / 2, r: TAP_RADIUS };
}

/** Whether the parts of a mushroom as they are filled hold `at`, in `area`'s frame. */
export function drawnHolds(area: TapArea, at: Point): boolean {
  return TAP_PARTS.some((part) => containsPoint(area[part], at));
}

/** A mushroom as a tap finds it: its tap area, and a point on screen in that area's frame. */
export type MushroomTarget = {
  area: TapArea;
  local: (at: Point) => Point;
};

/**
 * Which of `mushrooms`, listed back to front as they are painted, a tap at
 * `finger` on screen goes to: the front-most whose drawn parts hold it, so a
 * padded small mushroom never takes a tap on another's drawn body; where no
 * drawn part holds it, the one whose `fingerPad` does with its middle
 * nearest, the later of two as near. `undefined` where neither holds it.
 */
export function tappedMushroom<Target extends MushroomTarget>(
  finger: Point,
  mushrooms: readonly Target[],
): Target | undefined {
  let padded: { mushroom: Target; away: number } | undefined;
  for (const mushroom of mushrooms.toReversed()) {
    const at = mushroom.local(finger);
    if (drawnHolds(mushroom.area, at)) return mushroom;
    const pad = fingerPad(mushroom.area);
    if (!pad) continue;
    const away = Math.hypot(at.x - pad.x, at.y - pad.y);
    if (away > pad.r || (padded && away >= padded.away)) continue;
    padded = { mushroom, away };
  }
  return padded?.mushroom;
}
