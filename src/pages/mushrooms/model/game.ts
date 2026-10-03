/**
 * What the player has made of the meadow, and every way a tap changes it. The
 * scene dispatches actions and reconciles what it shows with the state that
 * comes back; nothing here knows how any of it is drawn.
 */

import { pick } from '@/shared/lib/collections';
import type { WithId } from '@/shared/typings';

import { isCrowdedAt, isFull } from './crowding';
import { type Perches, perchName, type Sight, type Timed } from './flight';
import type { Onscreen } from './flight-in';
import type { Coloured } from './flower-genes';
import { FLOWER_SHAPES, type FlowerShape } from './flower-sounds';
import {
  furnishedTarget,
  newestWithRoom,
  selectedMushroom,
} from './furnishing';
import type { Footing, Rooted } from './ground';
import {
  EMPTY_HOUSE,
  type Furnishing,
  FURNISHINGS,
  type Housed,
} from './house';
import type { InsectKind } from './insect-genes';
import { released, startled, type Swarm, ticked } from './insects';
import { firstMushrooms, type Species } from './mushroom-genes';
import { type Footed, OPENING_FOOTING } from './placement';
import { plantedId, type Sown } from './pollen';
import type { Random, Seeded, Seeds } from './random';
import {
  type Placed,
  sown,
  type Spored,
  type SporeTap,
  sproutedInRain,
  type Sprouting,
  unsown,
} from './sprouting';
import { type Rain, RAIN_MS, raining } from './weather';

export type Planted = Placed & Housed & Sprouting;

/**
 * A colour the child picked to plant, and the seed each of `FLOWER_SHAPES`
 * grows from in it, in that order, drawn before the pick so the picker shows
 * the very flower that will grow.
 */
type Chosen = Coloured & Seeds;

/**
 * Where the flower picker is open, as a foot on the plane, while it waits:
 * for a colour while `chosen` is `undefined`, then for a shape. On a tuft the
 * child tapped, `flower` is `undefined`; on a flower the child held, it is
 * that flower's id, which a pick replaces and the cross pulls up.
 */
export type Planting = Rooted & {
  chosen: Chosen | undefined;
  flower: string | undefined;
};

export type Meadow = Swarm & {
  /** In the order they were planted, so the last is the newest. */
  mushrooms: readonly Planted[];
  selected: string | undefined;
  /** Whether the four species are showing, waiting for a pick. */
  picking: boolean;
  /** Whether the windows and the door are showing, waiting for a pick. */
  furnishing: boolean;
  /** The flower picker, open on a tuft or a flower, `undefined` while closed. */
  planting: Planting | undefined;
  /**
   * The ids of the flowers the child pulled up or replaced, the visit's
   * seeded ones and planted ones alike, in the order they went: none of them
   * stands again, and a replacing flower is planted afresh in `planted`.
   */
  pulled: readonly string[];
  /** How many mushrooms the meadow has ever grown, so every id is new. */
  grown: number;
  /** How many insects the meadow has ever released, so every id is new. */
  released: number;
  /** The latest shower, kept once it stops for what it leaves behind; `undefined` before the first. */
  rain: Rain | undefined;
} & Spored;

export type Action =
  | { kind: 'pick' }
  | ({ kind: 'grow'; species: Species } & Seeded & Footed)
  | ({ kind: 'select' } & WithId & SporeTap)
  // A tap on a spore: picks it up.
  | ({ kind: 'unsow' } & WithId)
  | { kind: 'deselect' }
  | { kind: 'remove' }
  | { kind: 'house' }
  | { kind: 'furnish'; piece: Furnishing }
  | ({ kind: 'tuft' } & Rooted)
  // A long press on the flower `id`, standing at `foot`.
  | ({ kind: 'flower' } & WithId & Rooted)
  | ({ kind: 'colour' } & Chosen)
  | { kind: 'plant'; shape: FlowerShape }
  // A key's flower grown on a tuft, the picker shut: none in view sounded it.
  | ({ kind: 'sow' } & Seeded & Rooted)
  // The picker's cross: pulls up the flower it is open on.
  | { kind: 'pull' }
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
    ...(OPENING_FOOTING[index] ?? OPENING_FOOTING[0]),
  }));
  return {
    mushrooms,
    selected: undefined,
    picking: false,
    furnishing: false,
    planting: undefined,
    pulled: [],
    grown: mushrooms.length,
    insects: [],
    planted: [],
    released: 0,
    rain: undefined,
    spores: [],
    scattered: 0,
  };
}

/** The seed `shape` grows from in the colour `planting` has picked; `undefined` before a pick. */
export function shapeSeed(
  planting: Planting | undefined,
  shape: FlowerShape,
): number | undefined {
  return planting?.chosen?.seeds[FLOWER_SHAPES.indexOf(shape)];
}

export function isEmpty({ mushrooms }: Pick<Meadow, 'mushrooms'>): boolean {
  return mushrooms.length === 0;
}

/** `planted` with a flower grown from `seed` at `foot` after the rest, under the next free id. */
function withSown(
  planted: readonly Sown[],
  { seed, foot }: Seeded & Rooted,
): readonly Sown[] {
  return [...planted, { id: plantedId(planted), seed, foot }];
}

/**
 * Every perch an insect can go to: the mushrooms still standing that the
 * scene places (all of them where it places none), and what the scene sees.
 */
const perchesOf = ({ mushrooms }: Meadow, sight: Sight): Perches => {
  const { places } = sight;
  const offered = places
    ? mushrooms.filter(({ id }) =>
        Object.hasOwn(places, perchName({ kind: 'cap', id })),
      )
    : mushrooms;
  return {
    ...sight,
    caps: offered.map(({ id }) => id),
    spotted: offered
      .filter(({ species }) => species === 'fly-agaric')
      .map(({ id }) => id),
  };
};

/** `meadow` with what the insects made of it, the same object when they changed nothing. */
const swarmed = (meadow: Meadow, swarm: Swarm): Meadow =>
  swarm === meadow ? meadow : { ...meadow, ...swarm };

/** `meadow` with the flower picker shut, the same object when it was. */
const flowersShut = (meadow: Meadow): Meadow =>
  meadow.planting === undefined ? meadow : { ...meadow, planting: undefined };

/** Whether `a` and `b` are the one foot on the plane, by the stored numbers. */
export const sameFoot = (a: Footing, b: Footing): boolean =>
  a.x === b.x && a.y === b.y && a.size === b.size;

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
          : { ...pick(action, 'foot'), chosen: undefined, flower: undefined },
        selected: undefined,
      };
    }
    case 'flower': {
      // A press on the flower the picker is open on keeps it as it stands.
      if (meadow.planting?.flower === action.id) return meadow;
      return {
        ...meadow,
        ...PICKERS_SHUT,
        planting: {
          ...pick(action, 'foot'),
          chosen: undefined,
          flower: action.id,
        },
        selected: undefined,
      };
    }
    case 'pull': {
      const flower = meadow.planting?.flower;
      if (flower === undefined) return meadow;
      return {
        ...meadow,
        pulled: [...meadow.pulled, flower],
        planting: undefined,
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
      const { planting, planted, pulled } = meadow;
      const seed = shapeSeed(planting, action.shape);
      if (planting === undefined || seed === undefined) return meadow;
      const { foot, flower } = planting;
      return {
        ...meadow,
        planted: withSown(planted, { seed, foot }),
        // The flower picked over goes, and the new one opens in its place.
        pulled: flower === undefined ? pulled : [...pulled, flower],
        planting: undefined,
      };
    }
    case 'sow': {
      const { planted } = meadow;
      const { seed, foot } = action;
      return {
        ...meadow,
        planted: withSown(planted, { seed, foot }),
      };
    }
    case 'grow': {
      // Where it grows is the scene's pick (`pickFoot`), made before the tap.
      const { species, seed, foot, lean } = action;
      if (isFull(meadow) || isCrowdedAt(meadow, foot)) {
        return { ...meadow, picking: false };
      }
      const grown = meadow.grown + 1;
      const id = `mushroom-${grown}`;
      return {
        ...meadow,
        mushrooms: [
          ...meadow.mushrooms,
          { id, seed, species, house: EMPTY_HOUSE, foot, lean },
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
            ...sown(meadow, action),
            selected: action.id,
            picking: false,
            planting: undefined,
          }
        : meadow;
    }
    case 'unsow': {
      return unsown(meadow, action);
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
      const stirred = swarmed(meadow, swarm);
      // A picker open on a flower stays: the tap goes on through an insect
      // at rest, and a press through one on the held flower keeps it open.
      return meadow.planting?.flower === undefined
        ? flowersShut(stirred)
        : stirred;
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
      const rained = sproutedInRain(meadow, action.now);
      return swarmed(
        rained,
        ticked(rained, perchesOf(rained, action), action.now),
      );
    }
    default: {
      return action satisfies never;
    }
  }
}
