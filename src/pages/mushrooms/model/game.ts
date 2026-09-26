/**
 * What the player has made of the meadow, and every way a tap changes it. The
 * scene dispatches actions and reconciles what it shows with the state that
 * comes back; nothing here knows how any of it is drawn.
 */

import type { WithId } from '@/shared/typings';

import { type CapKind, firstMushrooms, type Mushroom } from './mushroom-genes';
import type { Random } from './random';

/**
 * How many mushrooms the meadow holds at most, one per slot the layout
 * stands them in: as many as still read apart on a phone.
 */
export const MUSHROOM_SLOTS = 6;

/** Where a mushroom stands for its whole life, an index into the layout's slots. */
export type Slotted = { slot: number };
export type Planted = Mushroom & Slotted;

export type Meadow = {
  mushrooms: readonly Planted[];
  selected: string | undefined;
  /** Whether the four caps are showing, waiting for a pick. */
  picking: boolean;
  /** How many mushrooms the meadow has ever grown, so every id is new. */
  grown: number;
};

export type Action =
  | { kind: 'pick' }
  | { kind: 'grow'; cap: CapKind; seed: number }
  | ({ kind: 'select' } & WithId)
  | { kind: 'deselect' }
  | { kind: 'remove' };

/** The drawing's two fly agarics, standing as one clump in the first two slots. */
export function firstMeadow(random: Random): Meadow {
  const mushrooms = firstMushrooms(random).map((mushroom, slot) => ({
    ...mushroom,
    slot,
  }));
  return {
    mushrooms,
    selected: undefined,
    picking: false,
    grown: mushrooms.length,
  };
}

export function isFull({ mushrooms }: Pick<Meadow, 'mushrooms'>): boolean {
  return mushrooms.length >= MUSHROOM_SLOTS;
}

function freeSlot({ mushrooms }: Meadow): number | undefined {
  const taken = new Set(mushrooms.map(({ slot }) => slot));
  for (let slot = 0; slot < MUSHROOM_SLOTS; slot++) {
    if (!taken.has(slot)) return slot;
  }
  return undefined;
}

export function reduce(meadow: Meadow, action: Action): Meadow {
  switch (action.kind) {
    case 'pick': {
      return { ...meadow, picking: !meadow.picking && !isFull(meadow) };
    }
    case 'grow': {
      const slot = freeSlot(meadow);
      if (slot === undefined) return { ...meadow, picking: false };
      const grown = meadow.grown + 1;
      const id = `mushroom-${grown}`;
      const { cap, seed } = action;
      return {
        mushrooms: [...meadow.mushrooms, { id, seed, cap, slot }],
        selected: id,
        picking: false,
        grown,
      };
    }
    case 'select': {
      const known = meadow.mushrooms.some(({ id }) => id === action.id);
      return known ? { ...meadow, selected: action.id, picking: false } : meadow;
    }
    case 'deselect': {
      return { ...meadow, selected: undefined, picking: false };
    }
    case 'remove': {
      return {
        ...meadow,
        mushrooms: meadow.mushrooms.filter(({ id }) => id !== meadow.selected),
        selected: undefined,
      };
    }
    default: {
      return action satisfies never;
    }
  }
}
