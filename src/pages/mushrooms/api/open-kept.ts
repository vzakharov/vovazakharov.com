/**
 * Which meadow a load opens, and what it opens with: the number off the
 * page's hash, the record kept under it, and the keeper that writes it back.
 */

import { pick } from '@/shared/lib/collections';

import { type Kept, readKept } from '../model/kept-record';
import { meadowHash, meadowNumber } from '../model/meadow-number';
import type { Seeded } from '../model/random';
import { type Keeper, keeper } from './keeper';
import { openStore, type Store } from './meadow-store';

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
 * neither read nor written and a fresh meadow opens unkept — as it does,
 * the fault reported, when a store that opened then fails a read: storage
 * costs the keeping, never the game. `report` and `reopen` are the keeper's.
 */
export async function openKept(
  location: Pick<Location, 'hash'>,
  history: Pick<History, 'state' | 'replaceState'>,
  store?: Store,
  report = (error: unknown) => {
    reportError(error);
  },
  reopen: () => Promise<Store | undefined> = openStore,
): Promise<Opening> {
  if (store === undefined) return fresh();
  try {
    return await openIn(store, location, history, report, reopen);
  } catch (error) {
    report(error);
    return fresh();
  }
}

async function openIn(
  store: Store,
  location: Pick<Location, 'hash'>,
  history: Pick<History, 'state' | 'replaceState'>,
  report: (error: unknown) => void,
  reopen: () => Promise<Store | undefined>,
): Promise<Opening> {
  const numbers = await store.numbers();
  const choice = meadowNumber(location.hash, numbers);
  const raw = choice.fresh ? undefined : await store.read(choice.number);
  const kept = readKept(raw);
  const number =
    choice.fresh || kept !== undefined
      ? choice.number
      : Math.max(...numbers) + 1;
  history.replaceState(history.state, '', meadowHash(number));
  const watch = watchedWrites(store, number, kept && raw, reopen);
  const keeping = {
    ...pick(watch, 'overwritten'),
    keeper: keeper(watch.watched, number, report, watch.reopen),
  };
  // A reload's new creatures draw afresh, so none is the twin of one before it.
  return kept === undefined
    ? { ...fresh(), ...keeping }
    : { ...pick(kept, 'seed'), streams: randomSeed(), kept, ...keeping };
}

/**
 * `store`, remembering the record under `number` this load last saw land,
 * `opened` to begin with, and reopened in place, so the memory and
 * `overwritten` follow the keeper onto a fresh connection. A read queues behind the writes already sent, and
 * a landed write updates the memory before that read answers, so a read
 * that differs from it was written by another load.
 */
function watchedWrites(
  store: Store,
  number: number,
  opened: unknown,
  reopen: () => Promise<Store | undefined>,
) {
  let inner = store;
  let landed = opened;
  const watched: Store = {
    numbers: async () => inner.numbers(),
    read: async (at) => inner.read(at),
    write: async (at, record) => {
      await inner.write(at, record);
      landed = record;
    },
    connection: () => inner.connection(),
  };
  return {
    watched,
    reopen: async () => {
      const next = await reopen();
      if (next === undefined) return next;
      inner = next;
      return watched;
    },
    overwritten: async () =>
      JSON.stringify(await inner.read(number)) !== JSON.stringify(landed),
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
