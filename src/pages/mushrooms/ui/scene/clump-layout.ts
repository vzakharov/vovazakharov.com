/**
 * Where the clump's two mushrooms stand, each foot by the species growing
 * there: a slot's place is a function of its own species alone, so a
 * mushroom never moves while it stands, whatever grows beside it.
 */

import type { Planted } from '../../model/game';
import { type Camera, type Ground, project } from '../../model/ground';
import type { Species } from '../../model/mushroom-genes';
import type { Placement } from './layout';

/**
 * Where the clump's back and front feet stand on the ground as the opening's
 * two fly agarics stand, and each one's size against the clump's: close
 * together, the back one a step farther off. The steps across set where the
 * two stems cross, which the back door needs low, the door above it: a
 * crossing midway hides every height the door could take (`doorInSight`),
 * and a high one stands the caps nearly one over the other, the back one
 * hidden.
 */
const CLUMP_FEET = [
  { x: 0, z: 0.24, size: 0.92 },
  { x: -0.03, z: 0, size: 1 },
] as const;
/**
 * How far each species' foot stands off the fly agaric's on the ground, in
 * the clump's size, back foot then front. A porcini's low, wide bun in front
 * stands to the right, clear of the back stem's door; a russula's flat cap a
 * little so. Behind, whatever caps lower or narrower than a fly agaric stands
 * farther back and to the left, so its cap still shows past the front one's.
 */
const CLUMP_SHIFT = {
  'fly-agaric': [
    { x: 0, z: 0 },
    { x: 0, z: 0 },
  ],
  porcini: [
    { x: -0.03, z: 0.24 },
    { x: 0.12, z: 0.12 },
  ],
  chanterelle: [
    { x: -0.05, z: 0.16 },
    { x: 0, z: 0 },
  ],
  russula: [
    { x: -0.05, z: 0.16 },
    { x: 0.04, z: 0 },
  ],
} as const satisfies Record<Species, readonly [Ground, Ground]>;
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

/**
 * A foot of `size`, in the clump's, stood at `foot` with `splay` as `camera`
 * shows it.
 */
export function standOn(
  camera: Camera,
  foot: Ground,
  size: number,
  splay: number,
): Placement {
  const { x, y, scale, haze } = project(camera, foot);
  return { x, y, size: size * scale, splay, haze };
}

/**
 * The clump's two slots as `camera` shows them, each species' foot shifted
 * off the fly agaric's by `CLUMP_SHIFT`: the back one leaning left and the
 * front one right, their stems crossing, as in the drawing.
 */
export function clumpSlots(camera: Camera): SlotPlaces[] {
  return CLUMP_FEET.map(({ x, z, size }, foot) => {
    const splay = (foot === 0 ? -1 : 1) * CLUMP_SPLAY;
    return bySpecies((species) => {
      const shift = CLUMP_SHIFT[species][foot] ?? { x: 0, z: 0 };
      return standOn(camera, { x: x + shift.x, z: z + shift.z }, size, splay);
    });
  });
}
