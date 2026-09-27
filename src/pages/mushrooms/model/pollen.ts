/**
 * A bee's pollen, and the flowers it plants. A bee carries pollen from the
 * last flower it drank at; landing at a different one pollinates it, and as
 * it leaves that flower a new one is planted in a free ring slot round it —
 * while the meadow holds fewer than `FLOWER_LIMIT` and the scene offers the
 * room. Nothing here knows where a slot stands on screen: the scene says
 * which flowers have room, and in which slot.
 */

import type { Flight, Leg } from './flight';
import type { Flower } from './flower-genes';
import { mulberry32, nextSeed, type Seeded } from './random';

/** How many flowers the meadow holds at most, the seeded ones counted. */
export const FLOWER_LIMIT = 14;
/** How many specks of pollen a bee's baskets hold at most. */
export const POLLEN_MOST = 3;

/** A ring slot round a flower, by its index: the scene fixes each slot's angle and distance. */
type Ringed = { ring: number };
/** A flower in sight with a ring slot free round it, and the slot. */
type Room = Ringed & { flower: string };
/**
 * What the scene says of the room to plant in: the flowers a planted one
 * could open beside, and how many seeded flowers stand, which count toward
 * `FLOWER_LIMIT` with the planted ones.
 */
export type Plot = { room: readonly Room[]; seededFlowers: number };

/**
 * A flower a bee planted, in ring slot `ring` round `parent` — a seeded
 * flower's id or a planted one's, so planted flowers ring planted flowers
 * too. Its genes grow from `seed` as any flower's do.
 */
export type Sown = Flower & Ringed & { parent: string };

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
 * flower that leg took it to, when it landed there and pollinated it, the
 * meadow holds fewer than `FLOWER_LIMIT` with `planted` counted, and `plot`
 * offers a slot there no planted flower already takes. Its seed comes off
 * the bee's own stream, so a replay plants the same flowers.
 */
export function sown(
  { seed, leg, legs, pollen }: Seeded & Flight & Carrying,
  now: number,
  { room, seededFlowers }: Plot,
  planted: readonly Sown[],
): Sown | undefined {
  const parent = landedAt(leg, now);
  if (!pollen.pollinates || parent === undefined) return undefined;
  if (seededFlowers + planted.length >= FLOWER_LIMIT) return undefined;
  const slot = room.find(
    ({ flower, ring }) =>
      flower === parent &&
      !planted.some((each) => each.parent === parent && each.ring === ring),
  );
  if (slot === undefined) return undefined;
  const { ring } = slot;
  return {
    id: `planted-${String(planted.length + 1)}`,
    seed: nextSeed(mulberry32(((seed ^ SOW_SALT) + legs) >>> 0)),
    parent,
    ring,
  };
}
