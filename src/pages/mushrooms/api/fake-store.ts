import type { Kept } from '../model/kept-record';
import type { Store } from './meadow-store';

/** An in-memory `Store`; a held one lands or refuses each write, in order, when told. */
export type FakeStore = Store & {
  records: Map<number, unknown>;
  written: Kept[];
  land: () => void;
  refuse: (error: unknown) => void;
};

/** A turn of the event loop, as IndexedDB answers a read. */
const later = async () =>
  new Promise<void>((resolve) => {
    setImmediate(resolve);
  });

type Pending = { resolve: () => void; reject: (error: unknown) => void };

export function fakeStore(
  records = new Map<number, unknown>(),
  answer: 'held' | 'at-once' = 'at-once',
): FakeStore {
  const written: Kept[] = [];
  const pending: Pending[] = [];
  return {
    records,
    written,
    numbers: async () => {
      await later();
      return [...records.keys()];
    },
    read: async (number) => {
      await later();
      return records.get(number);
    },
    write: async (number, record) => {
      written.push(record);
      records.set(number, record);
      if (answer === 'held') {
        await new Promise<void>((resolve, reject) => {
          pending.push({ resolve, reject });
        });
      }
    },
    land: () => pending.shift()?.resolve(),
    refuse: (error) => pending.shift()?.reject(error),
  };
}
