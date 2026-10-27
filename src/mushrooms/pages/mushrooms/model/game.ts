/**
 * What the player has made of the meadow, and every way a tap changes it. The
 * scene dispatches actions and reconciles what it shows with the state that
 * comes back; nothing here knows how any of it is drawn.
 */

import { pick } from '@/kernel/shared/lib/collections';
import type { WithId } from '@/kernel/shared/typings';

import type { Timed } from '@/mushrooms/shared/lib/motion';
import type { Random, Seeded } from '@/mushrooms/shared/lib/random';
import {
  dusky,
  FULL_DAY,
  isCrowdedAt,
  isFull,
  RAIN_MS,
  raining,
  type Rooted,
  sameFoot,
  type StartRain,
  turned,
  type TurnLight,
  type WithDusk,
  type WithRain,
} from '@/mushrooms/shared/world';
import {
  type HoldFlower,
  type PickColour,
  plantedId,
  type Planting,
  type PlantShape,
  shapeSeed,
  type Sown,
  type WithPulled,
} from '@/mushrooms/entities/flower/index.node-safe';
import {
  type InsectKind,
  type Onscreen,
  perchName,
} from '@/mushrooms/entities/insect/index.node-safe';
import {
  type Deselect,
  EMPTY_HOUSE,
  firstMushrooms,
  type Footed,
  type Furnishing,
  FURNISHINGS,
  type Grown,
  OPENING_FOOTING,
  type Species,
  type WithMushrooms,
  type WithSelected,
} from '@/mushrooms/entities/mushroom/index.node-safe';
import {
  furnishedTarget,
  newestWithRoom,
  selectedMushroom,
} from '@/mushrooms/features/furnish-house';
import {
  sown,
  type Spored,
  type SporeTap,
  sproutedInRain,
  unsown,
} from '@/mushrooms/features/grow-mushroom/index.node-safe';
import {
  type Perches,
  released,
  type Sight,
  startled,
  type Swarm,
  ticked,
} from '@/mushrooms/features/insects-fly/index.node-safe';
import {
  type Burrows,
  nightRan,
  type NightRuns,
  NO_NIGHT_RUNS,
} from '@/mushrooms/features/mice-run/index.node-safe';

export type Meadow = Unkept & KeptMeadow;

/** The pickers a meadow has open. */
export type Pickers = {
  /** Whether the four species are showing, waiting for a pick. */
  picking: boolean;
  /** Whether the windows and the door are showing, waiting for a pick. */
  furnishing: boolean;
  /** The flower picker, open on a tuft or a flower, `undefined` while closed. */
  planting: Planting | undefined;
};

/** What of a meadow belongs to the load that has it: the selection, the pickers and the shower. */
export type Unkept = Pickers & WithSelected & WithRain;

/** The mushrooms standing and the flowers pulled up: what the child's hands left on the ground. */
export type Tended = WithMushrooms & WithPulled;

/** A meadow as a reload keeps it: all of it but `Unkept`. */
export type KeptMeadow = Swarm &
  Tended &
  WithDusk &
  Spored &
  Grown & {
    /** How many insects the meadow has ever released, so every id is new. */
    released: number;
    /** The mice's own outings at dusk (`nightRan`). */
    nightRuns: NightRuns;
  };

export type Action =
  | { kind: 'pick' }
  | ({ kind: 'grow'; species: Species } & Seeded & Footed)
  | ({ kind: 'select' } & WithId & SporeTap)
  // A tap on a spore: picks it up.
  | ({ kind: 'unsow' } & WithId)
  | Deselect
  | { kind: 'remove' }
  | { kind: 'house' }
  | { kind: 'furnish'; piece: Furnishing }
  | ({ kind: 'tuft' } & Rooted)
  | HoldFlower
  | PickColour
  | PlantShape
  // A key's flower grown on a tuft, the picker shut: none in view sounded it.
  | ({ kind: 'sow' } & Seeded & Rooted)
  // The picker's cross: pulls up the flower it is open on.
  | { kind: 'pull' }
  // The flower picker shut, its tuft gone from under it.
  | { kind: 'shut' }
  // The map button's press: every picker shut, so nothing but that button
  // stands above the open map.
  | { kind: 'map' }
  | StartRain
  | TurnLight
  | ({ kind: 'release'; insect: InsectKind; onscreen?: Onscreen } & Seeded &
      Sighted)
  | ({ kind: 'startle' } & WithId & Sighted)
  // The houses ride along for the mice's dusk outings; without them none go.
  | ({ kind: 'tick'; burrows?: Burrows } & Sighted);

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
    dusk: FULL_DAY,
    nightRuns: NO_NIGHT_RUNS,
    spores: [],
    scattered: 0,
  };
}

export function isEmpty({ mushrooms }: WithMushrooms): boolean {
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
 * scene places (all of them where it places none), and what the scene sees
 * — at dusk with no room to plant in, so the bees plant nothing.
 */
const perchesOf = (
  { mushrooms, dusk }: Meadow,
  { now, ...sight }: Sighted,
): Perches => {
  const { places, room } = sight;
  const offered = places
    ? mushrooms.filter(({ id }) =>
        Object.hasOwn(places, perchName({ kind: 'cap', id })),
      )
    : mushrooms;
  return {
    ...sight,
    room: dusky(dusk, now) ? [] : room,
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

/** Every picker shut: the mushrooms', the house's and the flowers'. */
export const PICKERS_SHUT = {
  picking: false,
  furnishing: false,
  planting: undefined,
} as const satisfies Pickers;

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
    case 'map': {
      return { ...meadow, ...PICKERS_SHUT };
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
    case 'dusk': {
      // The flowers close for the night as for the rain, the picker with
      // them; morning opens them, and leaves an open picker be.
      const dusk = turned(meadow.dusk, action.now);
      const shut = dusk.toward === 'dusk' ? flowersShut(meadow) : meadow;
      return { ...shut, dusk };
    }
    case 'tick': {
      const { now, burrows } = action;
      const rained = sproutedInRain(meadow, now);
      const nightRuns = nightRan(rained.nightRuns, rained.dusk, now, burrows);
      const ran =
        nightRuns === rained.nightRuns ? rained : { ...rained, nightRuns };
      return swarmed(ran, ticked(ran, perchesOf(ran, action), now));
    }
    default: {
      return action satisfies never;
    }
  }
}
