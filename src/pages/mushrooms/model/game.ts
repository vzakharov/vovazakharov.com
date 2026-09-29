/**
 * What the player has made of the meadow, and every way a tap changes it. The
 * scene dispatches actions and reconciles what it shows with the state that
 * comes back; nothing here knows how any of it is drawn.
 */

import { pick } from '@/shared/lib/collections';
import type { WithId } from '@/shared/typings';

import type { Perches, Sight, Timed } from './flight';
import type { Coloured } from './flower-genes';
import { FLOWER_SHAPES, type FlowerShape } from './flower-sounds';
import type { FlowerFoot, Rooted } from './ground';
import {
  EMPTY_HOUSE,
  furnished,
  type Furnishing,
  FURNISHINGS,
  type Housed,
  windowSlots,
} from './house';
import type { InsectKind } from './insect-genes';
import { released, startled, type Swarm, ticked } from './insects';
import {
  firstMushrooms,
  type Mushroom,
  mushroomGenes,
  type Species,
} from './mushroom-genes';
import { type Footed, OPENING_FEET } from './placement';
import { plantedId } from './pollen';
import type { Random, Seeded } from './random';

/**
 * How many mushrooms the meadow holds at most: as many as still read apart
 * on a phone.
 */
export const MUSHROOM_SLOTS = 6;

export type Planted = Mushroom & Housed & Footed;

/**
 * A colour the child picked to plant, and the seed each of `FLOWER_SHAPES`
 * grows from in it, in that order, drawn before the pick so the picker shows
 * the very flower that will grow.
 */
type Chosen = Coloured & { seeds: readonly number[] };

/**
 * The tuft the child tapped to plant on, as its foot on the ground, while
 * the flower picker waits: for a colour while `chosen` is `undefined`, then
 * for a shape.
 */
export type Planting = Rooted & { chosen: Chosen | undefined };

export type Meadow = Swarm & {
  /** In the order they were planted, so the last is the newest. */
  mushrooms: readonly Planted[];
  selected: string | undefined;
  /** Whether the four species are showing, waiting for a pick. */
  picking: boolean;
  /** Whether the windows and the door are showing, waiting for a pick. */
  furnishing: boolean;
  /** The flower picker, open on a tuft, `undefined` while closed. */
  planting: Planting | undefined;
  /** How many mushrooms the meadow has ever grown, so every id is new. */
  grown: number;
  /** How many insects the meadow has ever released, so every id is new. */
  released: number;
};

export type Action =
  | { kind: 'pick' }
  | ({ kind: 'grow'; species: Species } & Seeded & Footed)
  | ({ kind: 'select' } & WithId)
  | { kind: 'deselect' }
  | { kind: 'remove' }
  | { kind: 'house' }
  | { kind: 'furnish'; piece: Furnishing }
  | { kind: 'tuft'; foot: FlowerFoot }
  | ({ kind: 'colour' } & Chosen)
  | { kind: 'plant'; shape: FlowerShape }
  | ({ kind: 'release'; insect: InsectKind } & Seeded & Sighted)
  | ({ kind: 'startle' } & WithId & Sighted)
  | ({ kind: 'tick' } & Sighted);

/** An insect action's moment, and what the scene sees of the perches as it happens. */
type Sighted = Timed & Sight;

/** The drawing's two fly agarics, standing as one clump on the opening's feet. */
export function firstMeadow(random: Random): Meadow {
  const mushrooms = firstMushrooms(random).map((mushroom, index) => ({
    ...mushroom,
    house: EMPTY_HOUSE,
    foot: OPENING_FEET[index] ?? OPENING_FEET[0],
  }));
  return {
    mushrooms,
    selected: undefined,
    picking: false,
    furnishing: false,
    planting: undefined,
    grown: mushrooms.length,
    insects: [],
    planted: [],
    released: 0,
  };
}

/** The seed `shape` grows from in the colour `planting` has picked; `undefined` before a pick. */
export function shapeSeed(
  planting: Planting | undefined,
  shape: FlowerShape,
): number | undefined {
  return planting?.chosen?.seeds[FLOWER_SHAPES.indexOf(shape)];
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
const perchesOf = ({ mushrooms }: Meadow, sight: Sight): Perches => ({
  ...sight,
  caps: mushrooms.map(({ id }) => id),
  spotted: mushrooms
    .filter(({ species }) => species === 'fly-agaric')
    .map(({ id }) => id),
});

/** `meadow` with what the insects made of it, the same object when they changed nothing. */
const swarmed = (meadow: Meadow, swarm: Swarm): Meadow =>
  swarm === meadow ? meadow : { ...meadow, ...swarm };

export function reduce(meadow: Meadow, action: Action): Meadow {
  switch (action.kind) {
    case 'pick': {
      return {
        ...meadow,
        picking: !meadow.picking && !isFull(meadow),
        furnishing: false,
        planting: undefined,
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
      return {
        ...meadow,
        furnishing,
        selected,
        picking: false,
        planting: undefined,
      };
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
    case 'tuft': {
      // A tap outside an open picker closes it, another tuft's too.
      return {
        ...meadow,
        planting:
          meadow.planting === undefined
            ? { ...pick(action, 'foot'), chosen: undefined }
            : undefined,
        selected: undefined,
        picking: false,
        furnishing: false,
      };
    }
    case 'colour': {
      const { planting } = meadow;
      if (planting === undefined) return meadow;
      const { colour, seeds } = action;
      return {
        ...meadow,
        planting: { ...planting, chosen: { colour, seeds } },
      };
    }
    case 'plant': {
      const { planting, planted } = meadow;
      const seed = shapeSeed(planting, action.shape);
      if (planting === undefined || seed === undefined) return meadow;
      const { foot } = planting;
      return {
        ...meadow,
        planted: [...planted, { id: plantedId(planted), seed, foot }],
        planting: undefined,
      };
    }
    case 'grow': {
      // Where it grows is the scene's pick (`pickFoot`), made before the tap.
      if (isFull(meadow)) return { ...meadow, picking: false };
      const grown = meadow.grown + 1;
      const id = `mushroom-${grown}`;
      const { species, seed, foot } = action;
      return {
        ...meadow,
        mushrooms: [
          ...meadow.mushrooms,
          { id, seed, species, house: EMPTY_HOUSE, foot },
        ],
        selected: id,
        picking: false,
        planting: undefined,
        grown,
      };
    }
    case 'select': {
      const known = meadow.mushrooms.some(({ id }) => id === action.id);
      return known
        ? {
            ...meadow,
            selected: action.id,
            picking: false,
            planting: undefined,
          }
        : meadow;
    }
    case 'deselect': {
      return {
        ...meadow,
        selected: undefined,
        picking: false,
        furnishing: false,
        planting: undefined,
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
        planting: undefined,
      };
    }
    case 'release': {
      const count = meadow.released + 1;
      const { insect: kind, seed, now } = action;
      const insect = { id: `${kind}-${count}`, seed, kind };
      return {
        ...meadow,
        ...released(meadow, insect, perchesOf(meadow, action), now),
        released: count,
      };
    }
    case 'startle': {
      const perches = perchesOf(meadow, action);
      return swarmed(meadow, startled(meadow, action.id, perches, action.now));
    }
    case 'tick': {
      const perches = perchesOf(meadow, action);
      return swarmed(meadow, ticked(meadow, perches, action.now));
    }
    default: {
      return action satisfies never;
    }
  }
}
