/**
 * The writes of one meadow, coalesced rather than debounced: one in flight at
 * a time, and the newest record waiting behind it replaces any older one
 * waiting, so a closed tab loses at most the write in flight.
 */

import type { Kept } from '../model/kept-record';
import type { Store } from './meadow-store';

/** The tick's own changes and the walking eye are kept at most this often. */
export const POLL_MS = 1000;

/** What the scene hands its meadow to, each record built by `settled`. */
export type Keeper = {
  /** Keeps `record` as soon as the write in flight lands: after a dispatch, and when the tab hides. */
  keep: (record: Kept) => void;
  /** Keeps `record()` when `POLL_MS` has passed since the last poll that kept, building it only then. */
  poll: (at: number, record: () => Kept) => void;
};

/**
 * The keeper of meadow `number`. A write the browser refuses after the store
 * opened is the "no storage, no keeping" case met late: keeping stops for
 * the rest of the load and the refusal is reported once, while the meadow on
 * screen plays on unaffected.
 */
export function keeper(
  store: Store,
  number: number,
  report = (error: unknown) => {
    reportError(error);
  },
): Keeper {
  let writing = false;
  let waiting: Kept | undefined;
  let stopped = false;
  let polled = -Infinity;

  const write = (record: Kept): void => {
    writing = true;
    store.write(number, record).then(
      () => {
        const next = waiting;
        waiting = undefined;
        writing = false;
        if (next !== undefined) write(next);
      },
      (error: unknown) => {
        stopped = true;
        waiting = undefined;
        report(error);
      },
    );
  };
  const keep = (record: Kept) => {
    if (stopped) return;
    if (writing) waiting = record;
    else write(record);
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
