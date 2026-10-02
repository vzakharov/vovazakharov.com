import { containsPoint, placedAt, type Point } from '../../model/geometry';
import type { MushroomGenes } from '../../model/mushroom-genes';
import {
  TAP_PARTS,
  type TapArea,
  tapArea,
  toCanvas,
} from '../../model/mushroom-outline';

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
 * A mushroom of `genes` drawn `size` px to its unit, its foot at `foot` and
 * turned `turn`, as a tap finds it: its tap area as the bed fills it in, in
 * its graphics' canvas frame, and a point on screen in that frame.
 */
export function tapTarget(
  genes: MushroomGenes,
  size: number,
  foot: Point,
  turn: number,
): MushroomTarget {
  const canvas = toCanvas(size);
  const { cap, gills, stem } = tapArea(genes, turn);
  return {
    area: {
      cap: cap.map((point) => canvas(point)),
      gills: gills.map((point) => canvas(point)),
      stem: stem.map((point) => canvas(point)),
    },
    local: ({ x, y }) =>
      placedAt({ x: 0, y: 0 }, -turn, { x: x - foot.x, y: y - foot.y }),
  };
}

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
 * `finger` on screen goes to: the front-most whose drawn parts hold it;
 * `undefined` where none does.
 */
export function tappedMushroom<Target extends MushroomTarget>(
  finger: Point,
  mushrooms: readonly Target[],
): Target | undefined {
  return mushrooms.findLast(({ area, local }) =>
    drawnHolds(area, local(finger)),
  );
}
