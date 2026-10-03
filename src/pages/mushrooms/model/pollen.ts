/**
 * A bee's pollen, and the flowers it plants. A bee carries pollen from the
 * last flower it drank at; landing at a different one pollinates it, and as
 * it leaves that flower a new one is planted in a free ring slot round it,
 * wherever the scene offers the room. Nothing here knows where a slot stands: the scene fixes each on the
 * ground round its parent, and says which flowers have room, and in which.
 */

import type { Flight, Leg } from './flight';
import type { Flower } from './flower-genes';
import type { Rooted } from './ground';
import {
  nextSeed,
  type Parented,
  pick,
  saltedStream,
  type Seeded,
} from './random';

/** How many specks of pollen a bee's baskets hold at most. */
export const POLLEN_MOST = 3;

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

/**
 * What a bee carries: `from`, the last flower it drank at, `undefined` until
 * its first; `specks`, the pollen on its legs, 0 to `POLLEN_MOST`, as it
 * stands in flight; `pollinates`, whether the flower its current leg goes to
 * is one it pollinates, a flower other than `from`.
 */
export type Pollen = {
  from: string | undefined;
  specks: number;
  pollinates: boolean;
};
export type Carrying = { pollen: Pollen };

/** A bee's pollen as it flies in, before any flower. */
export const NO_POLLEN: Pollen = {
  from: undefined,
  specks: 0,
  pollinates: false,
};

/** Keeps a planting's stream apart from the legs and genes grown off the same seed. */
const SOW_SALT = 0x2f_6a_c3_17;
/** Keeps the pick of a planting's slot apart from its flower's seed. */
const SLOT_SALT = 0x5b_e1_09_d4;

/** The flower `leg` has the insect at by `now`, when it went to one and landed. */
function landedAt({ to, arrives }: Leg, now: number): string | undefined {
  return to.kind === 'flower' && now >= arrives ? to.id : undefined;
}

/**
 * `pollen` as the bee leaves `leg` at `now` for `next`. Having landed at a
 * flower, it carries that flower's pollen on, a speck more than it had, up
 * to `POLLEN_MOST` — one speck alone when it had shed the rest there,
 * pollinating it; a leg cut short before landing leaves the load as it was.
 * `next` pollinates when it goes to a flower other than the one carried from.
 */
export function pollenAfter(
  pollen: Pollen,
  leg: Leg,
  now: number,
  next: Leg,
): Pollen {
  const flower = landedAt(leg, now);
  const visited =
    flower === undefined
      ? pollen
      : {
          from: flower,
          specks: pollen.pollinates
            ? 1
            : Math.min(POLLEN_MOST, pollen.specks + 1),
        };
  const pollinates =
    next.to.kind === 'flower' &&
    visited.from !== undefined &&
    visited.from !== next.to.id;
  return { ...visited, pollinates };
}

/**
 * How many specks the bee on `leg` shows at `now`: what it carries, and none
 * once it has landed at a flower it pollinates, having shed them there.
 */
export function specksAt(
  { pollen, leg }: Carrying & Flight,
  now: number,
): number {
  return pollen.pollinates && landedAt(leg, now) !== undefined
    ? 0
    : pollen.specks;
}

/**
 * The flower planted as `bee` leaves its current leg at `now`: beside the
 * flower that leg took it to, when it landed there and pollinated it and
 * `plot` offers a slot there no planted flower already takes — any such
 * slot as likely as the next, since a fixed first choice sends every
 * planting the same way off its parent and the bees sow a line. Slot and
 * seed come off the bee's own stream, so a replay plants the same flowers.
 */
export function sown(
  { seed, leg, legs, pollen }: Seeded & Flight & Carrying,
  now: number,
  { room }: Plot,
  planted: readonly Sown[],
): BeeSown | undefined {
  const parent = landedAt(leg, now);
  if (!pollen.pollinates || parent === undefined) return undefined;
  const [first, ...rest] = room.filter(
    ({ flower, ring }) =>
      flower === parent && !slotTaken(planted, parent, ring),
  );
  if (first === undefined) return undefined;
  const { ring } = pick(saltedStream(seed, SLOT_SALT, legs), [first, ...rest]);
  return {
    id: plantedId(planted),
    seed: nextSeed(saltedStream(seed, SOW_SALT, legs)),
    parent,
    ring,
  };
}
