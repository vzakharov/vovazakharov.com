# S4 — the store, `openKept` and the keeper (hand-over)

Done, one step, in the new `api/` segment of `pages/mushrooms` (steiger and
boundaries accept it):

- `api/meadow-store.ts` — `type Store = { numbers: () => Promise<number[]>;
read: (number: number) => Promise<unknown>; write: (number: number,
record: Kept) => Promise<void> }`; `openStore(): Promise<Store |
undefined>` (undefined when `indexedDB` is absent or throws, the open
  fires `error`, or nothing answers within 2 s; a late success is closed).
- `api/keeper.ts` — `POLL_MS = 1000`; `type Keeper = { keep: (record:
Kept) => void; poll: (at: number, record: () => Kept) => void }`;
  `keeper(store, number, report?): Keeper`.
- `api/open-kept.ts` — `type Opening = Seeded & { streams: number; kept?:
Kept; keeper?: Keeper }`; `openKept(location: Pick<Location, 'hash'>,
history: Pick<History, 'state' | 'replaceState'>, store?: Store):
Promise<Opening>`.
- `api/fake-store.ts` — the in-memory `Store` both tests use.
- Tests: `keeper.test.ts`, `open-kept.test.ts` (with `openStore` answering
  `undefined` under node, which has no IndexedDB).

For S5: the boot is `openKept(location, history, await openStore())`. The
scene grows from `opening.seed`, seeds its streams from `opening.streams`,
reopens `opening.kept` (`reopened(kept.meadow)`, `openingWalk(camera,
kept)`) when present, and hands records built with `settled` to
`opening.keeper?.keep(record)` after a dispatch and on `hidden`, and
`opening.keeper?.poll(time, () => record)` from `update`. A `hashchange`
listener goes on only when `opening.keeper` is set (a store is open).

Decided here:

- **The refused write is reported with `reportError`, not `console.error`.**
  `no-console` is an error repo-wide and a suppression needs the operator's
  word. `reportError` logs to the console as an uncaught error and fires
  the window's `error` event, so the play run's `Runtime.exceptionThrown`
  catches it too. `keeper`'s third parameter takes the reporter (tests pass
  a fake); switching to `console.error` is that default plus an approved
  suppression.
- Out-of-line keys (`createObjectStore('meadows')`, `put(record, number)`)
  rather than `keyPath: 'number'`, so the stored value is the record exactly
  as call 2 spells it, with no `number` field for `readKept` to strip.
- The keeper owns the once-a-second gate (`poll`), counted from the last
  poll that kept; a `keep` does not reset it. The record is built only when
  the poll keeps.
- `Opening` names the sink `keeper` (an object with `keep` and `poll`), not
  the spec's `keep?: (record) => void`, and carries no `number`: the scene
  needs nothing of it.
- The hash is written with `replaceState(history.state, '', '#n')`, keeping
  whatever state the page had.

Left: nothing for S4.
