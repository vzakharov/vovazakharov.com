/**
 * What the player has made of the meadow, and every way a tap changes it. The
 * scene dispatches actions and reconciles what it shows with the state that
 * comes back; nothing here knows how any of it is drawn.
 */

import { pick } from '@/shared/lib/collections';
import type { WithId } from '@/shared/typings';

import type { Perches, Sight, Timed } from './flight';
import type { Onscreen } from './flight-in';
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
import { type Rain, RAIN_MS, raining } from './weather';

/**
 * How many mushrooms the meadow holds at most, room permitting: a world two
 * tablet screens wide holds twice the six one screen reads apart.
 */
export const MUSHROOM_SLOTS = 12;

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
  /** The latest shower, kept once it stops for what it leaves behind; `undefined` before the first. */
  rain: Rain | undefined;
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
  // A tap on a control that changes nothing here, the mute's: it closes
  // the flower picker, as any tap outside it does.
  | { kind: 'shut' }
  // A tap on a cloud: starts a shower, or while one falls restarts its time.
  | ({ kind: 'rain' } & Timed)
  | ({ kind: 'release'; insect: InsectKind; onscreen?: Onscreen } & Seeded &
      Sighted)
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
    rain: undefined,
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

/** `meadow` with the flower picker shut, the same object when it was. */
const flowersShut = (meadow: Meadow): Meadow =>
  meadow.planting === undefined ? meadow : { ...meadow, planting: undefined };

/** Whether `a` and `b` are the one foot on the ground. */
export const sameFoot = (a: FlowerFoot, b: FlowerFoot): boolean =>
  a.x === b.x && a.z === b.z && a.size === b.size;

/** Every picker shut: the mushrooms', the house's and the flowers'. */
const PICKERS_SHUT = {
  picking: false,
  furnishing: false,
  planting: undefined,
} as const satisfies Pick<Meadow, 'picking' | 'furnishing' | 'planting'>;

export function reduce(meadow: Meadow, action: Action): Meadow {
  switch (action.kind) {
    case 'pick': {
      return {
        ...meadow,
        ...PICKERS_SHUT,
        picking: !meadow.picking && !isFull(meadow),
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
      return { ...meadow, ...PICKERS_SHUT, furnishing, selected };
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
      // A tap on the open picker's own tuft closes it; on another, the
      // picker opens there afresh.
      const again =
        meadow.planting !== undefined &&
        sameFoot(meadow.planting.foot, action.foot);
      return {
        ...meadow,
        ...PICKERS_SHUT,
        planting: again
          ? undefined
          : { ...pick(action, 'foot'), chosen: undefined },
        selected: undefined,
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
      return { ...meadow, ...PICKERS_SHUT, selected: undefined };
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
        ...PICKERS_SHUT,
        selected: undefined,
      };
    }
    case 'release': {
      const count = meadow.released + 1;
      const { insect: kind, seed, now, onscreen } = action;
      const insect = { id: `${kind}-${count}`, seed, kind };
      const perches = perchesOf(meadow, action);
      return {
        ...meadow,
        ...released(meadow, insect, perches, now, onscreen),
        released: count,
        planting: undefined,
      };
    }
    case 'startle': {
      const perches = perchesOf(meadow, action);
      const swarm = startled(meadow, action.id, perches, action.now);
      return flowersShut(swarmed(meadow, swarm));
    }
    case 'shut': {
      return flowersShut(meadow);
    }
    case 'rain': {
      const { rain } = meadow;
      const { now } = action;
      const startedAt = rain && raining(rain, now) ? rain.startedAt : now;
      return {
        ...flowersShut(meadow),
        rain: { startedAt, stopsAt: now + RAIN_MS },
      };
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
