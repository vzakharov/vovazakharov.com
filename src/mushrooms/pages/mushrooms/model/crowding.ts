/**
 * How much the meadow holds: how many mushrooms and flowers may stand round
 * one foot, and how many mushrooms the whole field takes.
 */

import { distanceBetween, type Point } from './geometry';
import { D_SEE } from './ground';
import type { Footed } from './placement';

/**
 * How many mushrooms stand at most within `D_SEE` of a new one's foot, room
 * permitting: as far as the eye sees holds twice the six one screen reads
 * apart.
 */
export const MUSHROOM_SLOTS = 12;
/**
 * How many flowers stand at most within `D_SEE` of a new one's foot: past
 * it a bee plants nothing and no tuft takes the child's flower, so bee
 * rings cannot sow the endless field without bound.
 */
export const FLOWER_SLOTS = 48;
/** How many mushrooms the whole field holds at most. */
export const FIELD_MUSHROOMS = 96;

type Stood = Pick<Footed, 'foot'>;

/**
 * What a mushroom count reads, each by its foot: the mushrooms, and the
 * spores, each holding the place of the sprout it will be.
 */
type Stand = { mushrooms: readonly Stood[]; spores: readonly Stood[] };

export function isFull({ mushrooms, spores }: Stand): boolean {
  return mushrooms.length + spores.length >= FIELD_MUSHROOMS;
}

/** Whether `slots` of `standing` already stand within `D_SEE` of `foot`, on the plane. */
function fullRound(
  standing: readonly Stood[],
  foot: Point,
  slots: number,
): boolean {
  let near = 0;
  for (const each of standing) {
    if (distanceBetween(each.foot, foot) <= D_SEE && ++near >= slots) {
      return true;
    }
  }
  return false;
}

/**
 * Whether `MUSHROOM_SLOTS` of the meadow's mushrooms and spores already stand
 * within `D_SEE` of `foot`, or of the anchor `from` it grows from, so none
 * grows there. Counting round the anchor holds every screen's opening to the
 * same count: a wide screen shows more ground than one foot's circle, and
 * what it grew past `MUSHROOM_SLOTS` would leave the screen when the phone is
 * turned.
 */
export function isCrowdedAt(
  { mushrooms, spores }: Stand,
  foot: Point,
  from: Point = foot,
): boolean {
  const standing = [...mushrooms, ...spores];
  return (
    fullRound(standing, foot, MUSHROOM_SLOTS) ||
    fullRound(standing, from, MUSHROOM_SLOTS)
  );
}

/** Whether `FLOWER_SLOTS` of the flowers `standing` already stand within `D_SEE` of `foot`, so none is planted there. */
export function flowersCrowdAt(
  standing: readonly Stood[],
  foot: Point,
): boolean {
  return fullRound(standing, foot, FLOWER_SLOTS);
}
