/**
 * Which meadow a load opens, and what it opens with: the number off the
 * page's hash, the record kept under it, and the keeper that writes it back.
 */

import { pick } from '@/shared/lib/collections';

import { type Kept, readKept } from '../model/kept-record';
import { meadowHash, meadowNumber } from '../model/meadow-number';
import type { Seeded } from '../model/random';
import { type Keeper, keeper } from './keeper';
import type { Store } from './meadow-store';

/**
 * What the scene opens on: the visit seed that grows the meadow's world, the
 * seed its new creatures' streams start from, the kept meadow and walk start
 * when there is one, and its keeper, absent with no store.
 */
export type Opening = Seeded & {
  streams: number;
  kept?: Kept;
  keeper?: Keeper;
  /**
   * Whether the meadow's stored record is no longer the one this load opened
   * or last wrote, another tab having kept it since; present with the keeper.
   */
  overwritten?: () => Promise<boolean>;
};

/**
 * Opens the meadow the hash names in `store`, rewriting the hash to its
 * number. A record that cannot be read is left untouched, and a fresh meadow
 * opens beside it, past the highest number kept. With no store the hash is
 * neither read nor written and a fresh meadow opens unkept.
 */
export async function openKept(
  location: Pick<Location, 'hash'>,
  history: Pick<History, 'state' | 'replaceState'>,
  store?: Store,
): Promise<Opening> {
  if (store === undefined) return fresh();
  const numbers = await store.numbers();
  const choice = meadowNumber(location.hash, numbers);
  const raw = choice.fresh ? undefined : await store.read(choice.number);
  const kept = readKept(raw);
  const number =
    choice.fresh || kept !== undefined
      ? choice.number
      : Math.max(...numbers) + 1;
  history.replaceState(history.state, '', meadowHash(number));
  const { watched, overwritten } = watchedWrites(store, number, kept && raw);
  const keeping = { keeper: keeper(watched, number), overwritten };
  // A reload's new creatures draw afresh, so none is the twin of one before it.
  return kept === undefined
    ? { ...fresh(), ...keeping }
    : { ...pick(kept, 'seed'), streams: randomSeed(), kept, ...keeping };
}

/**
 * `store`, remembering the record under `number` this load last saw land,
 * `opened` to begin with. A read queues behind the writes already sent, and
 * a landed write updates the memory before that read answers, so a read
 * that differs from it was written by another load.
 */
function watchedWrites(store: Store, number: number, opened: unknown) {
  let landed = opened;
  return {
    watched: {
      ...store,
      write: async (at: number, record: Kept) => {
        await store.write(at, record);
        landed = record;
      },
    } satisfies Store,
    overwritten: async () =>
      JSON.stringify(await store.read(number)) !== JSON.stringify(landed),
  };
}

/** A fresh visit, its streams off its own seed. */
function fresh(): Opening {
  const seed = randomSeed();
  return { seed, streams: seed };
}

function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}
