/**
 * The board's state: the items baked into the page, overlaid with the rows of
 * the artifact's `db` collection `items` — one document per item, written whole
 * — through the same merge the repo's sync uses.
 */
import { type Item, mergeItems, parseDbRow } from '../model.ts';
import { type Db, errorCode } from './runtime.ts';

const COLLECTION = 'items';
/** How long a subscription may stay silent before the page says so. */
const LOADING_LIMIT_MS = 10_000;

export type Status =
  | { kind: 'read-only'; reason: string }
  | { kind: 'connecting' }
  /** `rejected` names the rows whose body is not an item. */
  | { kind: 'live'; rejected: string[] }
  | { kind: 'stale' }
  | { kind: 'error'; message: string };

export type Store = {
  items: () => Item[];
  /** Stamps `item` as `author`'s, now, and saves it; `undefined` on a read-only board. */
  write: ((item: Item) => void) | undefined;
};

type Writer = { db: Db; author: string };

export function createStore(
  baked: readonly Item[],
  writer: Writer | undefined,
  onChange: () => void,
  onStatus: (status: Status) => void,
): Store {
  const rows = new Map<string, Item>();
  const local = new Map<string, Item>();
  const queues = new Map<string, Promise<void>>();

  const items = (): Item[] =>
    mergeItems(mergeItems(baked, [...rows.values()]), [...local.values()]);

  if (!writer) {
    onStatus({
      kind: 'read-only',
      reason: 'Live edits need the board open on claude.ai, signed in.',
    });
    return { items, write: undefined };
  }

  const { db, author } = writer;
  const collection = db.collection(COLLECTION);
  onStatus({ kind: 'connecting' });
  let timer: ReturnType<typeof setTimeout> | undefined = setTimeout(() => {
    onStatus({ kind: 'stale' });
  }, LOADING_LIMIT_MS);

  collection.onSnapshot(
    (snap) => {
      rows.clear();
      const rejected: string[] = [];
      for (const doc of snap.docs) {
        try {
          rows.set(doc.id, parseDbRow(doc.id, doc.data()));
        } catch {
          rejected.push(doc.id);
        }
      }
      if (!snap.metadata.fromCache) {
        clearTimeout(timer);
        timer = undefined;
        onStatus({ kind: 'live', rejected });
      }
      onChange();
    },
    (error) => {
      clearTimeout(timer);
      onStatus({ kind: 'error', message: `Live edits stopped: ${error.code}` });
    },
  );

  const save = (item: Item): void => {
    const previous = queues.get(item.id) ?? Promise.resolve();
    const next = previous
      .then(async () => collection.doc(item.id).set({ ...item }))
      .then(() => {
        // The snapshot's row carries this write from here on; the local copy can go.
        if (local.get(item.id) === item) local.delete(item.id);
      })
      .catch((error: unknown) => {
        onStatus({
          kind: 'error',
          message: `Could not save ${item.id}: ${errorCode(error)}`,
        });
      });
    queues.set(item.id, next);
  };

  return {
    items,
    write: (item) => {
      const stamped = {
        ...item,
        updated: new Date().toISOString(),
        author,
      };
      local.set(stamped.id, stamped);
      onChange();
      save(stamped);
    },
  };
}
