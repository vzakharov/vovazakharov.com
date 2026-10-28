/**
 * The flowers planted in the meadow, a bee's ringed round its parent or the
 * child's on a tuft, and the room a bee has to plant one in.
 */

import type { Parented } from '@/mushrooms/shared/lib/random';
import type { Rooted } from '@/mushrooms/shared/world';

import type { Flower } from './flower-genes';

/** A ring slot round a flower, by its index: the scene fixes each slot's step on the ground, in the flower's size. */
type Ringed = { ring: number };
/** A flower in sight with a ring slot free round it, and the slot. */
type Room = Ringed & { flower: string };
/** What the scene says of the room to plant in: the flowers a planted one could open beside. */
export type Plot = { room: readonly Room[] };

/**
 * A flower a bee planted, in ring slot `ring` round `parent` — a seeded
 * flower's id or a planted one's, so planted flowers ring planted flowers
 * too. Its genes grow from `seed` as any flower's do.
 */
export type BeeSown = Flower & Ringed & Parented;
/**
 * A flower on its own foot on the ground: as a planted one, the child's,
 * planted on a tuft.
 */
export type RootedFlower = Flower & Rooted;
/** A planted flower, a bee's or the child's: either can be a bee's parent. */
export type Sown = BeeSown | RootedFlower;

/** Whether `flower` is a bee's, ringed round its parent, rather than the child's. */
export function isBeeSown(flower: Sown): flower is BeeSown {
  return 'parent' in flower;
}

/** Whether a flower of `planted` stands in ring slot `ring` round `parent`. */
export function slotTaken(
  planted: readonly Sown[],
  parent: string,
  ring: number,
): boolean {
  return planted.some(
    (each) => isBeeSown(each) && each.parent === parent && each.ring === ring,
  );
}

/** The id the next flower planted onto `planted` takes. */
export function plantedId(planted: readonly Sown[]): string {
  return `planted-${String(planted.length + 1)}`;
}

/** The flowers planted since the visit opened, bees' and the child's, in the order they opened. */
export type WithPlanted = { planted: readonly Sown[] };
