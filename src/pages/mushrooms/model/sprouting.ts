/**
 * After a shower: the oldest full-grown mushroom in sight sheds its spores,
 * and up to `SPROUTS` little ones of its species come up round it and grow to
 * full size on the clock. The scene finds where they stand (`roomFor`'s
 * `near`); this decides when, from whom and from which seeds, and checks the
 * caps again as `grow` does. Times are ms on the insects' clock, as
 * `weather.ts`'s are.
 */

import { pick } from '@/shared/lib/collections';
import type { WithId } from '@/shared/typings';

import { isCrowdedAt, isFull } from './crowding';
import type { Timed } from './flight';
import type { Meadow, Planted } from './game';
import { EMPTY_HOUSE } from './house';
import type { Stamped } from './motion';
import type { Footed } from './placement';
import {
  nextSeed,
  type Parented,
  saltedStream,
  type Seeded,
  type Seeds,
} from './random';

/** How many sprouts a shower sheds at most. */
export const SPROUTS = 3;
/** How many old mushrooms in sight a shed tries, oldest first, before it sheds nothing. */
const PARENTS = 2;
/** How big a sprout comes up, of its full size. */
export const SPROUT_START = 0.4;
/** How long a sprout takes from coming up to its full size. */
export const SPROUT_MS = 120_000;
/** How long the spores take to fall from the parent's crown before a sprout comes up. */
export const SPORE_FALL_MS = 700;
/** How long after a shower stops a shed is due: about the rainbow's span. */
export const SHED_WINDOW_MS = 12_000;
/** Keeps the sprouts' seeds apart from every other stream grown off a parent's seed. */
const SHED_SALT = 0x3c_9e_51_a7;

/** A sprout's start: the moment its parent shed it, and that parent. */
export type Sprout = Parented & Stamped;

/** A mushroom shed after a shower carries its `sprout`; one the child or the opening grew carries none. */
export type Sprouting = { sprout?: Sprout };

/** The `stopsAt` of the last shower that has shed, so each sheds once; `undefined` before the first. */
export type Shed = { shed: number | undefined };

/**
 * A tick's shed: the feet the scene found round `parent` for the seeds
 * `shedding` named, a seed it found no room for left out.
 */
export type Shedding = {
  shed?: Parented & { sprouts: ReadonlyArray<Seeded & Footed> };
};

/** An old mushroom a shed may come from, and the seeds of the sprouts it would shed, in order. */
export type Shedder = WithId & Seeds;

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

/** The `stopsAt` of the shower whose shed is due at `now`, or `undefined` while none is. */
function dueShed({ rain, shed }: Meadow, now: number): number | undefined {
  if (rain === undefined || shed === rain.stopsAt) return undefined;
  const { stopsAt } = rain;
  return stopsAt <= now && now < stopsAt + SHED_WINDOW_MS ? stopsAt : undefined;
}

/**
 * Who sheds at `now`, oldest first among the old mushrooms `inSight`, with
 * the seeds each would shed: `undefined` while no shed is due or none old is
 * in sight. The scene tries them in order and passes the first that finds
 * room for any sprout. One meadow, one answer.
 */
export function shedding(
  meadow: Meadow,
  now: number,
  inSight: (id: string) => boolean,
): readonly Shedder[] | undefined {
  if (dueShed(meadow, now) === undefined) return undefined;
  const parents = meadow.mushrooms
    .filter((mushroom) => isOld(mushroom, now) && inSight(mushroom.id))
    .slice(0, PARENTS);
  if (parents.length === 0) return undefined;
  return parents.map(({ id, seed }) => ({
    id,
    seeds: Array.from({ length: SPROUTS }, (_, index) =>
      nextSeed(saltedStream(seed, SHED_SALT, meadow.grown + index)),
    ),
  }));
}

/**
 * `meadow` with the sprouts the tick carries grown round their parent, of
 * its species and unselected, those the caps still allow; the shower then
 * counts as shed even where none grew. The same object when the tick
 * carries no shed or none is due.
 */
export function sprouted(
  meadow: Meadow,
  { now, shed }: Timed & Shedding,
): Meadow {
  const stopsAt = dueShed(meadow, now);
  if (shed === undefined || stopsAt === undefined) return meadow;
  let { mushrooms, grown } = meadow;
  const parent = mushrooms.find(({ id }) => id === shed.parent);
  if (parent && isOld(parent, now)) {
    for (const { seed, foot, lean } of shed.sprouts.slice(0, SPROUTS)) {
      if (isFull({ mushrooms }) || isCrowdedAt({ mushrooms }, foot)) continue;
      grown += 1;
      const sprout: Planted = {
        id: `mushroom-${grown}`,
        seed,
        ...pick(parent, 'species'),
        house: EMPTY_HOUSE,
        foot,
        lean,
        sprout: { at: now, parent: parent.id },
      };
      mushrooms = [...mushrooms, sprout];
    }
  }
  return { ...meadow, mushrooms, grown, shed: stopsAt };
}
