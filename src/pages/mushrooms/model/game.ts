/**
 * What the player has made of the meadow, and every way a tap changes it. The
 * scene dispatches actions and reconciles what it shows with the state that
 * comes back; nothing here knows how any of it is drawn.
 */

import type { WithId } from '@/shared/typings';

import type { Perches, Sight, Timed } from './flight';
import {
  EMPTY_HOUSE,
  furnished,
  type Furnishing,
  FURNISHINGS,
  type Housed,
  windowSlots,
} from './house';
import type { InsectKind } from './insect-genes';
import { type Flier, released, startled, ticked } from './insects';
import {
  type CapKind,
  firstMushrooms,
  type Mushroom,
  mushroomGenes,
} from './mushroom-genes';
import type { Random, Seeded } from './random';

/**
 * How many mushrooms the meadow holds at most, one per slot the layout
 * stands them in: as many as still read apart on a phone.
 */
export const MUSHROOM_SLOTS = 6;

/** Where a mushroom stands for its whole life, an index into the layout's slots. */
type Slotted = { slot: number };
export type Planted = Mushroom & Housed & Slotted;

export type Meadow = {
  /** In the order they were planted, so the last is the newest. */
  mushrooms: readonly Planted[];
  selected: string | undefined;
  /** Whether the four caps are showing, waiting for a pick. */
  picking: boolean;
  /** Whether the windows and the door are showing, waiting for a pick. */
  furnishing: boolean;
  /** How many mushrooms the meadow has ever grown, so every id is new. */
  grown: number;
  /** In the order they were released, so the first is the oldest. */
  insects: readonly Flier[];
  /** How many insects the meadow has ever released, so every id is new. */
  released: number;
};

export type Action =
  | { kind: 'pick' }
  | { kind: 'grow'; cap: CapKind; seed: number }
  | ({ kind: 'select' } & WithId)
  | { kind: 'deselect' }
  | { kind: 'remove' }
  | { kind: 'house' }
  | { kind: 'furnish'; piece: Furnishing }
  | ({ kind: 'release'; insect: InsectKind } & Seeded & Sighted)
  | ({ kind: 'startle' } & WithId & Sighted)
  | ({ kind: 'tick' } & Sighted);

/** An insect action's moment, and what the scene sees of the perches as it happens. */
type Sighted = Timed & Sight;

/** The drawing's two fly agarics, standing as one clump in the first two slots. */
export function firstMeadow(random: Random): Meadow {
  const mushrooms = firstMushrooms(random).map((mushroom, slot) => ({
    ...mushroom,
    house: EMPTY_HOUSE,
    slot,
  }));
  return {
    mushrooms,
    selected: undefined,
    picking: false,
    furnishing: false,
    grown: mushrooms.length,
    insects: [],
    released: 0,
  };
}

export function isFull({ mushrooms }: Pick<Meadow, 'mushrooms'>): boolean {
  return mushrooms.length >= MUSHROOM_SLOTS;
}

export function isEmpty({ mushrooms }: Pick<Meadow, 'mushrooms'>): boolean {
  return mushrooms.length === 0;
}

/** `mushroom` with `piece` put into its house, or `undefined` when it has no room for it. */
function withPiece(mushroom: Planted, piece: Furnishing): Planted | undefined {
  const house = furnished(
    mushroom.house,
    piece,
    windowSlots(mushroomGenes(mushroom)).length,
  );
  return house && { ...mushroom, house };
}

function selectedMushroom({
  mushrooms,
  selected,
}: Meadow): Planted | undefined {
  return mushrooms.find(({ id }) => id === selected);
}

/**
 * The newest mushroom with room for any of `pieces`, or with none that has
 * room the newest: the one a house tap acts on while nothing is selected, so
 * a full mushroom never greys the picker out while another still has room.
 */
function newestWithRoom(
  { mushrooms }: Meadow,
  pieces: readonly Furnishing[],
): Planted | undefined {
  return (
    mushrooms.findLast((mushroom) =>
      pieces.some((piece) => withPiece(mushroom, piece) !== undefined),
    ) ?? mushrooms.at(-1)
  );
}

/**
 * The selected mushroom with `piece` put into its house, or with none
 * selected the newest that has room for it; `undefined` when that one has no
 * room.
 */
function furnishedTarget(
  meadow: Meadow,
  piece: Furnishing,
): Planted | undefined {
  const mushroom =
    meadow.selected === undefined
      ? newestWithRoom(meadow, [piece])
      : selectedMushroom(meadow);
  return mushroom && withPiece(mushroom, piece);
}

/**
 * Whether a pick of `piece` would furnish anything: not on an empty meadow,
 * not into a full row of windows, not a second door.
 */
export function canFurnish(meadow: Meadow, piece: Furnishing): boolean {
  return furnishedTarget(meadow, piece) !== undefined;
}

/** Every perch an insect can go to: the mushrooms still standing, and what the scene sees. */
const perchesOf = (
  { mushrooms }: Meadow,
  { flowers, crowded }: Sight,
): Perches => ({ caps: mushrooms.map(({ id }) => id), flowers, crowded });

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
      return {
        ...meadow,
        picking: !meadow.picking && !isFull(meadow),
        furnishing: false,
      };
    }
    case 'house': {
      const furnishing = !meadow.furnishing && !isEmpty(meadow);
      // Opening with nothing selected selects where the next pick goes, so
      // its glow shows before the pick lands.
      const selected =
        furnishing && meadow.selected === undefined
          ? newestWithRoom(meadow, FURNISHINGS)?.id
          : meadow.selected;
      return { ...meadow, furnishing, selected, picking: false };
    }
    case 'furnish': {
      const done = furnishedTarget(meadow, action.piece);
      if (done === undefined) return meadow;
      return {
        ...meadow,
        mushrooms: meadow.mushrooms.map((mushroom) =>
          mushroom.id === done.id ? done : mushroom,
        ),
      };
    }
    case 'grow': {
      const slot = freeSlot(meadow);
      if (slot === undefined) return { ...meadow, picking: false };
      const grown = meadow.grown + 1;
      const id = `mushroom-${grown}`;
      const { cap, seed } = action;
      return {
        ...meadow,
        mushrooms: [
          ...meadow.mushrooms,
          { id, seed, cap, house: EMPTY_HOUSE, slot },
        ],
        selected: id,
        picking: false,
        grown,
      };
    }
    case 'select': {
      const known = meadow.mushrooms.some(({ id }) => id === action.id);
      return known
        ? { ...meadow, selected: action.id, picking: false }
        : meadow;
    }
    case 'deselect': {
      return {
        ...meadow,
        selected: undefined,
        picking: false,
        furnishing: false,
      };
    }
    case 'remove': {
      // With nothing selected, `−` thins the newest.
      const gone = (
        meadow.selected === undefined
          ? meadow.mushrooms.at(-1)
          : selectedMushroom(meadow)
      )?.id;
      return {
        ...meadow,
        mushrooms: meadow.mushrooms.filter(({ id }) => id !== gone),
        selected: undefined,
        picking: false,
        furnishing: false,
      };
    }
    case 'release': {
      const count = meadow.released + 1;
      const { insect: kind, seed, now } = action;
      const insect = { id: `${kind}-${count}`, seed, kind };
      return {
        ...meadow,
        insects: released(
          meadow.insects,
          insect,
          perchesOf(meadow, action),
          now,
        ),
        released: count,
      };
    }
    case 'startle': {
      const insects = startled(
        meadow.insects,
        action.id,
        perchesOf(meadow, action),
        action.now,
      );
      return insects === meadow.insects ? meadow : { ...meadow, insects };
    }
    case 'tick': {
      const insects = ticked(
        meadow.insects,
        perchesOf(meadow, action),
        action.now,
      );
      return insects === meadow.insects ? meadow : { ...meadow, insects };
    }
    default: {
      return action satisfies never;
    }
  }
}
