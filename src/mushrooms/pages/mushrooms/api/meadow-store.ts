/**
 * The kept meadows in the browser's IndexedDB: one record per meadow, keyed
 * by its number. The database never deletes a store in an upgrade.
 */

import type { Kept } from '../model/kept-record';

/**
 * How the store's connection stands: `lost` once the browser closed it under
 * the page (WebKit does, after the app sits in the background), so a fresh
 * one would answer; `yielded` once a newer build asked to upgrade the
 * database, the connection closed so that build's open is never blocked.
 */
export type Connection = 'open' | 'lost' | 'yielded';

/** Where the meadows are kept, read raw: a record is parsed by `readKept`. */
export type Store = {
  numbers: () => Promise<number[]>;
  read: (number: number) => Promise<unknown>;
  write: (number: number, record: Kept) => Promise<void>;
  connection: () => Connection;
};

const DATABASE = 'mushrooms';
const MEADOWS = 'meadows';
/** Past this with no answer (a blocked open, a browser that never answers), the meadow opens unkept. */
const ANSWER_MS = 2000;

/**
 * The store, or `undefined` when the browser keeps nothing: `indexedDB`
 * absent or throwing (an opaque-origin sandbox), the open failing, or no
 * answer within `ANSWER_MS`. That is the "no storage, no keeping" case, so
 * the game opens a fresh meadow rather than failing.
 */
export async function openStore(): Promise<Store | undefined> {
  let request: IDBOpenDBRequest;
  try {
    request = globalThis.indexedDB.open(DATABASE, 1);
  } catch {
    return undefined;
  }
  request.addEventListener('upgradeneeded', () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(MEADOWS)) {
      database.createObjectStore(MEADOWS);
    }
  });
  let unkept = false;
  const opened = new Promise<IDBDatabase | undefined>((resolve) => {
    request.addEventListener('success', () => {
      // An open that answers after the meadow opened unkept is let go.
      if (unkept) request.result.close();
      else resolve(request.result);
    });
    request.addEventListener('error', () => {
      resolve(undefined);
    });
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<undefined>((resolve) => {
    timer = setTimeout(() => {
      resolve(undefined);
    }, ANSWER_MS);
  });
  const database = await Promise.race([opened, late]);
  clearTimeout(timer);
  if (database !== undefined) return storeOver(database);
  unkept = true;
  return undefined;
}

function storeOver(database: IDBDatabase): Store {
  let connection: Connection = 'open';
  // Fired only when the browser closes the connection, never on `close()`.
  database.addEventListener('close', () => {
    connection = 'lost';
  });
  database.addEventListener('versionchange', () => {
    connection = 'yielded';
    database.close();
  });
  const meadows = (mode: IDBTransactionMode) =>
    database.transaction(MEADOWS, mode).objectStore(MEADOWS);
  return {
    connection: () => connection,
    async numbers() {
      const keys = await answer(meadows('readonly').getAllKeys());
      return keys.filter((key) => typeof key === 'number');
    },
    async read(number) {
      return answer<unknown>(meadows('readonly').get(number));
    },
    async write(number, record) {
      const store = meadows('readwrite');
      store.put(record, number);
      await committed(store.transaction);
    },
  };
}

async function answer<Result>(request: IDBRequest<Result>): Promise<Result> {
  return new Promise((resolve, reject) => {
    request.addEventListener('success', () => {
      resolve(request.result);
    });
    request.addEventListener('error', () => {
      reject(request.error ?? new Error('IndexedDB request failed'));
    });
  });
}

/** Settles once the write is committed, or rejects when the browser refuses it. */
async function committed(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.addEventListener('complete', () => {
      resolve();
    });
    const refused = () => {
      reject(transaction.error ?? new Error('IndexedDB write aborted'));
    };
    transaction.addEventListener('error', refused);
    transaction.addEventListener('abort', refused);
  });
}
