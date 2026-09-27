/**
 * Where every flower stands on a screen, seeded and planted alike, as a pure
 * function of the layout: a seeded flower on its place in `layout.flowers`, a
 * planted one in its ring slot round its parent, wherever that stands. A
 * slot is fixed in the parent's size, so a flower planted round another keeps
 * to it across a resize, and a well-visited flower grows a round bed.
 */

import { pick } from '@/shared/lib/collections';

import type { Flower } from '../../model/flower-genes';
import type { Circle, Point } from '../../model/geometry';
import type { Sown } from '../../model/pollen';
import {
  depthScale,
  type Footing,
  HEAD_REACH,
  type MeadowLayout,
} from './layout';

/**
 * Each ring slot round a parent, in the order a bee's plantings take them:
 * across and down the ground from the parent's foot, in the parent's size.
 * Beside it either way, then before it, then behind it, so the bed grows
 * round and each head stands clear of its neighbours'.
 */
export const RING_SLOTS: readonly Point[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0.55, y: 0.75 },
  { x: -0.55, y: 0.75 },
  { x: 0.55, y: -0.75 },
  { x: -0.55, y: -0.75 },
];

/** Where a flower stands on one screen. */
export type Placed = { place: Footing };
/** A flower as it stands on one screen. */
export type StandingFlower = Flower & Placed;

/** How far down the ground `y` is on `layout`, from 0 at its top to 1 at the screen's foot. */
export function downOf({ groundTop, height }: MeadowLayout, y: number): number {
  return (y - groundTop) / (height - groundTop);
}

/**
 * Where a flower in ring slot `ring` round `parent` stands on `layout`: its
 * foot the slot's step off the parent's, sized for its depth as a seeded
 * flower there would be; `undefined` for a slot past the ring.
 */
export function ringSpot(
  layout: MeadowLayout,
  parent: Footing,
  ring: number,
): Footing | undefined {
  const slot = RING_SLOTS[ring];
  if (!slot) return undefined;
  const x = parent.x + slot.x * parent.size;
  const y = parent.y + slot.y * parent.size;
  const grown =
    depthScale(downOf(layout, y)) / depthScale(downOf(layout, parent.y));
  return { x, y, size: parent.size * grown };
}

/**
 * Every flower that stands on `layout`: the seeded ones the layout has room
 * for, then each planted one round its parent, in the order they opened, so
 * a parent always stands before its children. A planted flower whose parent
 * stands nowhere here stands nowhere either.
 */
export function standingFlowers(
  layout: MeadowLayout,
  seeded: readonly Flower[],
  planted: readonly Sown[],
): StandingFlower[] {
  const standing: StandingFlower[] = seeded.flatMap((flower, index) => {
    const place = layout.flowers[index];
    return place ? [{ ...flower, place }] : [];
  });
  for (const sown of planted) {
    const parent = standing.find(({ id }) => id === sown.parent);
    const place = parent && ringSpot(layout, parent.place, sown.ring);
    if (place) standing.push({ ...pick(sown, 'id', 'seed'), place });
  }
  return standing;
}

/** The farthest a flower `place` stands for could reach with its head, whatever its genes: over its stem's top. */
export function widestHead({ x, y, size }: Footing): Circle {
  return { x, y: y - size, r: HEAD_REACH * size };
}
