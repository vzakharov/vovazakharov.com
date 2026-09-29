/**
 * Where the clump's two mushrooms stand, each foot by the species growing
 * there: a slot's place is a function of its own species alone, so a
 * mushroom never moves while it stands, whatever grows beside it.
 */

import type { Planted } from '../../model/game';
import type { Point } from '../../model/geometry';
import type { Species } from '../../model/mushroom-genes';
import { speciesReach } from '../../model/mushroom-pose';
import type { Placement } from './layout';

type Orientation = 'landscape' | 'portrait';

/**
 * Where the clump stands: across as a fraction of the width, its back and
 * front feet down as fractions of the ground's depth, and each foot's step
 * off `across` in the clump's size — all as the opening's two fly agarics
 * stand. A tall screen's clump stands nearer the front, leaving the back row
 * room above its caps, and its feet closer in depth on its deeper ground.
 * The steps set where the two stems cross, which the back door needs low,
 * the door above it: a crossing midway hides every height the door could
 * take (`doorInSight`), and a high one stands the caps nearly one over the
 * other, the back one hidden.
 */
const CLUMP_ACROSS = { landscape: 0.47, portrait: 0.5 } as const;
const CLUMP_DOWN = { landscape: [0.42, 0.6], portrait: [0.74, 0.8] } as const;
const CLUMP_STEP = {
  landscape: [0.02, -0.04],
  portrait: [0, -0.03],
} as const;
/**
 * How far each species' foot stands off the fly agaric's, across in the
 * clump's size and down in the ground's depth, back foot then front. A
 * porcini's low, wide bun in front stands to the right, clear of the back
 * stem's door; a russula's flat cap a little so. Behind, whatever caps lower
 * or narrower than a fly agaric stands farther back and to the left, so its
 * cap still shows past the front one's.
 */
const CLUMP_SHIFT = {
  landscape: {
    'fly-agaric': [
      [0, 0],
      [0, 0],
    ],
    porcini: [
      [-0.07, -0.07],
      [0.15, 0],
    ],
    chanterelle: [
      [-0.08, -0.06],
      [0, 0],
    ],
    russula: [
      [-0.08, -0.06],
      [0.07, 0],
    ],
  },
  portrait: {
    'fly-agaric': [
      [0, 0],
      [0, 0],
    ],
    porcini: [
      [-0.05, -0.04],
      [0.12, 0],
    ],
    chanterelle: [
      [-0.05, -0.04],
      [0, 0],
    ],
    russula: [
      [-0.05, -0.04],
      [0.04, 0],
    ],
  },
} as const satisfies Record<
  Orientation,
  Record<
    Species,
    readonly [readonly [number, number], readonly [number, number]]
  >
>;
/** The opening pair's turn apart, like the V of Syama's two caps. */
export const CLUMP_SPLAY = 0.22;

/** A slot's place for each species that may grow in it. */
export type SlotPlaces = Readonly<Record<Species, Placement>>;

type PlaceInParams = Pick<Planted, 'slot' | 'species'>;

/** Where `mushroom` stands among `slots`: its slot's place for its species. */
export function placeIn(
  slots: readonly SlotPlaces[],
  { slot, species }: PlaceInParams,
): Placement | undefined {
  return slots[slot]?.[species];
}

/** Every place any mushroom may stand among `slots`, each once. */
export function everyPlace(slots: readonly SlotPlaces[]): Placement[] {
  return [...new Set(slots.flatMap((places) => Object.values(places)))];
}

/** Where each of `standing` stands among `slots`. */
export function standingPlaces(
  slots: readonly SlotPlaces[],
  standing: readonly PlaceInParams[],
): Placement[] {
  return standing.flatMap((mushroom) => placeIn(slots, mushroom) ?? []);
}

/**
 * Every place among `slots` a mushroom stands or may yet grow, with
 * `standing` in them: a taken slot's place for what stands in it, a free
 * slot's for every species, since any may grow there next.
 */
export function claimedPlaces(
  slots: readonly SlotPlaces[],
  standing: readonly PlaceInParams[],
): Placement[] {
  const taken = new Set(standing.map(({ slot }) => slot));
  return [
    ...standingPlaces(slots, standing),
    ...everyPlace(slots.filter((_, slot) => !taken.has(slot))),
  ];
}

/** `make` of each species, keyed by it. */
function bySpecies<Made>(
  make: (species: Species) => Made,
): Record<Species, Made> {
  return {
    'fly-agaric': make('fly-agaric'),
    porcini: make('porcini'),
    chanterelle: make('chanterelle'),
    russula: make('russula'),
  };
}

/** The same place for every species: a forest slot's. */
export function forAll(place: Placement): SlotPlaces {
  return bySpecies(() => place);
}

/** Where a clump foot stands as the fly agaric's, and how it stands. */
type ClumpFoot = Point & { scale: number; side: -1 | 1 };

/** The clump's back foot and front foot as the fly agaric's stand, `wanted` its size. */
export function clumpFeet(
  orientation: Orientation,
  {
    width,
    groundTop,
    ground,
    wanted,
  }: Record<'width' | 'groundTop' | 'ground' | 'wanted', number>,
): readonly [ClumpFoot, ClumpFoot] {
  const clump = width * CLUMP_ACROSS[orientation];
  const [backDown, frontDown] = CLUMP_DOWN[orientation];
  const [backStep, frontStep] = CLUMP_STEP[orientation];
  return [
    {
      x: clump + wanted * backStep,
      y: groundTop + ground * backDown,
      scale: 0.9,
      side: -1,
    },
    {
      x: clump + wanted * frontStep,
      y: groundTop + ground * frontDown,
      scale: 1,
      side: 1,
    },
  ];
}

/**
 * The clump's two slots at `unit`, each species' foot shifted off the fly
 * agaric's by `CLUMP_SHIFT` and held `margin` inside the screen by its own
 * cap's reach, which never reaches past the fly agaric's bound the unit is
 * sized under.
 */
export function clumpSlots(
  orientation: Orientation,
  feet: readonly [ClumpFoot, ClumpFoot],
  {
    width,
    ground,
    wanted,
    unit,
    margin,
  }: Record<'width' | 'ground' | 'wanted' | 'unit' | 'margin', number>,
): SlotPlaces[] {
  return feet.map(({ x, y, scale, side }, foot) => {
    const size = unit * scale;
    const splay = side * CLUMP_SPLAY;
    const place = (species: Species): Placement => {
      const [across, down] = CLUMP_SHIFT[orientation][species][foot] ?? [0, 0];
      const { toward, away } = speciesReach(species, splay);
      const [left, right] = side < 0 ? [toward, away] : [away, toward];
      const wantedX = x + wanted * across;
      return {
        x: Math.min(
          width - margin - right * size,
          Math.max(margin + left * size, wantedX),
        ),
        y: y + ground * down,
        size,
        splay,
        haze: 0,
      };
    };
    return bySpecies(place);
  });
}
