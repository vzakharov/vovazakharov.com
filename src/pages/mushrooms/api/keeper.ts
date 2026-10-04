/**
 * The writes of one meadow, coalesced rather than debounced: one in flight at
 * a time, and the newest record waiting behind it replaces any older one
 * waiting, so a closed tab loses at most the write in flight.
 */

import type { Kept } from '../model/kept-record';
import { openStore, type Store } from './meadow-store';

/** The tick's own changes and the walking eye are kept at most this often. */
export const POLL_MS = 1000;

/** What the scene hands its meadow to, each record built by `settled`. */
export type Keeper = {
  /** Keeps `record` as soon as the write in flight lands: after a dispatch, and when the tab hides. */
  keep: (record: Kept) => void;
  /** Keeps `record()` when `POLL_MS` has passed since the last poll that kept, building it only then. */
  poll: (at: number, record: () => Kept) => void;
};

/** Why keeping stops once a newer build holds the database. */
const YIELDED = new Error('A newer build of the game holds the kept meadows');

/**
 * The keeper of meadow `number`. WebKit drops a backgrounded app's connection
 * and a fresh one answers, so a closed connection is reopened before the next
 * write, and a refused write reopens once and retries the newest record. Only
 * when that fails too, or the connection yielded to a newer build, is it the
 * "no storage, no keeping" case met late: keeping stops for the load and the
 * cause is reported once, while the meadow on screen plays on unaffected.
 */
export function keeper(
  store: Store,
  number: number,
  report = (error: unknown) => {
    reportError(error);
  },
  reopen: typeof openStore = openStore,
): Keeper {
  let current = store;
  let writing = false;
  let waiting: Kept | undefined;
  let stopped = false;
  let polled = -Infinity;

  const reopened = async (refusal: unknown) => {
    const next = await reopen();
    if (next === undefined) throw refusal;
    current = next;
  };
  const written = async (record: Kept) => {
    if (current.connection() === 'yielded') throw YIELDED;
    if (current.connection() === 'lost') {
      await reopened(new Error('IndexedDB connection lost'));
      await current.write(number, record);
      return;
    }
    try {
      await current.write(number, record);
    } catch (error) {
      if (current.connection() === 'yielded') throw YIELDED;
      await reopened(error);
      const newest = waiting ?? record;
      waiting = undefined;
      await current.write(number, newest);
    }
  };
  // `writing` drops in the same turn the last write lands, so a record kept
  // just after it starts a write of its own rather than waiting on none.
  const drain = async (): Promise<void> => {
    const record = waiting;
    if (record === undefined) {
      writing = false;
      return;
    }
    waiting = undefined;
    await written(record);
    await drain();
  };
  const keep = (record: Kept) => {
    if (stopped) return;
    waiting = record;
    if (writing) return;
    writing = true;
    drain().catch((error: unknown) => {
      stopped = true;
      waiting = undefined;
      report(error);
    });
  };

  return {
    keep,
    poll: (at, record) => {
      if (stopped || at - polled < POLL_MS) return;
      polled = at;
      keep(record());
    },
  };
}
