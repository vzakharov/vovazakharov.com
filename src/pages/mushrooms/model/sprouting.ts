/**
 * Spores and sprouts: a tap on a full-grown mushroom settles a spore near it,
 * up to `SPORE_SEATS`, and when it rains each spore comes up as a little
 * mushroom of its parent's species that grows to full size on the clock.
 * The scene finds where they stand (`roomFor`'s `near`); this decides when,
 * from whom and from which seeds, and checks the caps again as `grow` does.
 * Times are ms on the insects' clock, as `weather.ts`'s are.
 */

import { pick } from '@/shared/lib/collections';
import type { WithId } from '@/shared/typings';

import { isCrowdedAt, isFull } from './crowding';
import type { Timed } from './flight';
import type { Meadow, Planted } from './game';
import { EMPTY_HOUSE } from './house';
import type { Stamped } from './motion';
import type { Mushroom } from './mushroom-genes';
import type { Footed } from './placement';
import { nextSeed, type Parented, saltedStream, type Seeded } from './random';
import { darkAt, type Rain } from './weather';

/** How big a sprout comes up, of its full size. */
export const SPROUT_START = 0.4;
/** How long a sprout takes from coming up to its full size. */
export const SPROUT_MS = 120_000;
/** How long the spores take to fall from the parent's crown before a sprout comes up. */
export const SPORE_FALL_MS = 700;
/** How many spores lie round one mushroom at most. */
export const SPORE_SEATS = 6;
/** How long after the dark sets in the spores may sprout, each at its seed's moment. */
export const SPROUT_WINDOW_MS = 6000;
/** How long a spore sown while it rains lies before it sprouts, at least. */
export const SPORE_DWELL_MS = 2000;
/** Keeps the spores' seeds apart from every other stream grown off a parent's seed. */
const SPORE_SALT = 0x3c_9e_51_a7;
/** Keeps a spore's sprouting moment in a shower apart from every other stream grown off its seed. */
const MOMENT_SALT = 0x5b_e3_17_c4;

/** A sprout's start: the moment its clock starts, and the parent that sowed it. */
export type Sprout = Parented & Stamped;

/** A mushroom come up from a spore carries its `sprout`; one the child or the opening grew carries none. */
export type Sprouting = { sprout?: Sprout };

/** A mushroom and where it stands: what a planted one and a spore both are. */
export type Placed = Mushroom & Footed;

/** A spore on the ground: the sprout it will be, its `at` the moment it settled. */
export type Spore = Placed & Sprout;

/** The spores on the ground, in the order they settled, and how many the meadow has ever scattered, so every id and seed is new. */
export type Spored = { spores: readonly Spore[]; scattered: number };

/** A tap's spore: the foot the scene found for it, and the tap's moment. */
export type SporeTap = { spore?: Footed & Timed };

/** Whether `mushroom` is full-grown: grown by the child or the opening, or a sprout that has finished growing. */
export function isOld({ sprout }: Sprouting, now: number): boolean {
  return sprout === undefined || now >= sprout.at + SPORE_FALL_MS + SPROUT_MS;
}

/**
 * How big a mushroom stands of its full size at `now`: 0 while its spores
 * fall, then from `SPROUT_START` eased out to 1 over `SPROUT_MS`; 1 for one
 * that never sprouted.
 */
export function sproutScale(sprout: Sprout | undefined, now: number): number {
  if (sprout === undefined) return 1;
  const since = now - sprout.at - SPORE_FALL_MS;
  if (since < 0) return 0;
  const left = 1 - Math.min(1, since / SPROUT_MS);
  return SPROUT_START + (1 - SPROUT_START) * (1 - left ** 2);
}

/**
 * The seed the next spore of the mushroom `id` grows from, or `undefined`
 * where it sows none: unknown, not full-grown at `now`, with `SPORE_SEATS`
 * spores lying already, or the field full. One meadow, one answer, so the
 * scene's search and the reducer's re-check draw the same seed.
 */
export function sowable(
  meadow: Meadow,
  id: string,
  now: number,
): Seeded | undefined {
  const parent = meadow.mushrooms.find((mushroom) => mushroom.id === id);
  if (!parent || !isOld(parent, now) || isFull(meadow)) return undefined;
  const lying = meadow.spores.filter((spore) => spore.parent === id).length;
  if (lying >= SPORE_SEATS) return undefined;
  const stream = saltedStream(parent.seed, SPORE_SALT, meadow.scattered);
  return { seed: nextSeed(stream) };
}

/**
 * `meadow` with the spore a tap on the mushroom `id` settled at the foot the
 * scene found, of its species, checked again as `grow` checks; the same
 * object when the tap carries none or it no longer may.
 */
export function sown(meadow: Meadow, { id, spore }: WithId & SporeTap): Meadow {
  if (spore === undefined) return meadow;
  const { foot, lean, now } = spore;
  const parent = meadow.mushrooms.find((mushroom) => mushroom.id === id);
  const seeded = sowable(meadow, id, now);
  if (!parent || !seeded || isCrowdedAt(meadow, foot)) return meadow;
  const scattered = meadow.scattered + 1;
  const laid: Spore = {
    id: `spore-${scattered}`,
    ...seeded,
    ...pick(parent, 'species'),
    foot,
    lean,
    parent: id,
    at: now,
  };
  return { ...meadow, spores: [...meadow.spores, laid], scattered };
}

/** `meadow` with the spore `id` picked up, the same object when none lies there. */
export function unsown(meadow: Meadow, { id }: WithId): Meadow {
  const spores = meadow.spores.filter((spore) => spore.id !== id);
  return spores.length === meadow.spores.length
    ? meadow
    : { ...meadow, spores };
}

/**
 * The moment `spore` sprouts in `rain`: its seed's draw in the
 * `SPROUT_WINDOW_MS` after the dark sets in, stable while a tap lengthens the
 * shower, and for one sown while it rains no sooner than `SPORE_DWELL_MS`
 * after it settled; `undefined` for one settled after the shower stopped,
 * which waits for the next.
 */
export function sproutMoment(spore: Spore, rain: Rain): number | undefined {
  if (spore.at >= rain.stopsAt) return undefined;
  const draw = saltedStream(spore.seed, MOMENT_SALT, rain.startedAt)();
  const drawn = darkAt(rain) + draw * SPROUT_WINDOW_MS;
  return Math.max(drawn, spore.at + SPORE_DWELL_MS);
}

/**
 * `meadow` with every spore whose moment in the latest shower has come by
 * `now` grown into a sprout of its parent's species where it lay, wherever
 * that is and whether or not its parent still stands. The sprout's clock
 * starts `SPORE_FALL_MS` before the moment, so it comes up as the spore goes;
 * the spore already held its place in every count. The same object when none
 * sprouts.
 */
export function sproutedInRain(meadow: Meadow, now: number): Meadow {
  const { spores, rain } = meadow;
  if (spores.length === 0 || rain === undefined) return meadow;
  let { mushrooms, grown } = meadow;
  const lying: Spore[] = [];
  for (const spore of spores) {
    const moment = sproutMoment(spore, rain);
    if (moment === undefined || moment > now) {
      lying.push(spore);
      continue;
    }
    grown += 1;
    const { seed, species, foot, lean, parent } = spore;
    const sprout: Planted = {
      id: `mushroom-${grown}`,
      seed,
      species,
      house: EMPTY_HOUSE,
      foot,
      lean,
      sprout: { at: moment - SPORE_FALL_MS, parent },
    };
    mushrooms = [...mushrooms, sprout];
  }
  return lying.length === spores.length
    ? meadow
    : { ...meadow, mushrooms, grown, spores: lying };
}
