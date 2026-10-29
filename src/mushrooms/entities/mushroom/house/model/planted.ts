/**
 * A mushroom as the meadow holds it: where it stands, its house, and the
 * sprout it came up as, if it did; and a spore lying on the ground, the
 * mushroom it will be. How a sprout grows to full size is the mushroom's own.
 */

import type { Stamped } from '@/mushrooms/shared/lib/motion';
import type { Parented } from '@/mushrooms/shared/lib/random';
import type { Occupied } from '@/mushrooms/shared/world';

import type { Mushroom } from '../../fungus/index.node-safe';
import type { Housed } from './house';
import type { Footed } from './placement';

/** How big a sprout comes up, of its full size. */
export const SPROUT_START = 0.4;
/** How long a sprout takes from coming up to its full size. */
export const SPROUT_MS = 120_000;
/** A sprout's start: the moment its clock starts, and the parent that sowed it. */
export type Sprout = Parented & Stamped;

/** A mushroom come up from a spore carries its `sprout`; one the child or the opening grew carries none. */
export type Sprouting = { sprout?: Sprout };

/** A mushroom and where it stands: what a planted one and a spore both are. */
type Placed = Mushroom & Footed;

/** A spore on the ground: the sprout it will be, its `at` the moment it settled. */
export type Spore = Placed & Sprout;

export type Planted = Placed & Housed & Sprouting;

export type WithMushrooms = Occupied<Planted>;

/** How many mushrooms the meadow has ever grown, so every id is new. */
export type Grown = { grown: number };

/** The mushroom the child selected, by id; `undefined` while none is. */
export type WithSelected = { selected: string | undefined };

/** The spores on the ground, in the order they settled. */
export type WithSpores = { spores: readonly Spore[] };

/** Whether a mushroom is full-grown: grown by the child or the opening, or a sprout that has finished growing. */
export function isOld({ sprout }: Sprouting, now: number): boolean {
  return sprout === undefined || now >= sprout.at + SPROUT_MS;
}

/**
 * How big a mushroom stands of its full size at `now`: from `SPROUT_START`
 * eased out to 1 over `SPROUT_MS`; 1 for one that never sprouted.
 */
export function sproutScale(sprout: Sprout | undefined, now: number): number {
  if (sprout === undefined) return 1;
  const left = 1 - Math.min(1, Math.max(0, now - sprout.at) / SPROUT_MS);
  return SPROUT_START + (1 - SPROUT_START) * (1 - left ** 2);
}

/** A tap that selects nothing: the selection let go. */
export type Deselect = { kind: 'deselect' };
