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
 * gene — the narrowest the zoom floor allows (`ZOOM_FLOOR` in `meadow-camera.ts`) —
 * is drawn across at the least.
 */
export const FINGER_ACROSS = 2 * TAP_RADIUS * (1 - HEAD_SHORTFALL);

/**
 * The circle a mushroom's tap area grows to hold once its head — cap and
 * gills, where a child aims — is drawn narrower than `FINGER_ACROSS`, or
 * shallower than `TAP_RADIUS`, a flat cap whose dome a finger overhangs:
 * `TAP_RADIUS` round the middle of the head. `undefined` for a head drawn
 * bigger both ways, whose tap area stays exactly what is drawn, and for one
 * not drawn yet. In the same frame as `area`, pixels with y down.
 */
export function fingerPad(area: TapArea): Circle | undefined {
  const head = [...area.cap, ...area.gills];
  if (head.length === 0) return undefined;
  const { left, right, top, bottom } = boxAround(head);
  if (right - left >= FINGER_ACROSS && bottom - top >= TAP_RADIUS) {
    return undefined;
  }
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

/** Whether any of `mushrooms` has a drawn part under `finger` on screen. */
export function drawnUnder(
  finger: Point,
  mushrooms: readonly MushroomTarget[],
): boolean {
  return mushrooms.some(({ area, local }) => drawnHolds(area, local(finger)));
}

/** How far a flower's head reaches round its middle, in px: its petals, and its tap. */
export type FlowerReach = { petals: number; tap: number };

/**
 * Whether a flower takes a tap `away` px from its head's middle, its petals
 * reaching `petals` and its tap `tap` (`flowerTapReach`): anywhere on its
 * head, and past it only where `underDrawn` says no mushroom is drawn under
 * the finger — so the reach round a small flower never takes a tap on a cap
 * the finger is on. Where both are drawn, the nearer the front takes it.
 */
export function flowerTakes(
  away: number,
  { petals, tap }: FlowerReach,
  underDrawn: () => boolean,
): boolean {
  if (away <= petals) return true;
  return away <= tap && !underDrawn();
}

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
