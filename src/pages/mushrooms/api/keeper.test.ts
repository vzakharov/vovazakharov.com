import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { settled } from '../model/keeping';
import { type Kept, KEPT_VERSION } from '../model/kept-record';
import { opened } from '../ui/scene/visit-play';
import { fakeStore } from './fake-store';
import { keeper, POLL_MS } from './keeper';

const stand = opened(3, 1180, 820, false);

/** A kept record told apart from the others by its seed. */
function record(seed: number): Kept {
  return {
    version: KEPT_VERSION,
    seed,
    eye: { x: 0, y: 0, heading: 0 },
    gait: 'steps',
    meadow: settled(stand.meadow, 0),
  };
}

const unreported = (error: unknown) => {
  assert.fail(`a write was refused: ${String(error)}`);
};
const seeds = (written: readonly Kept[]) => written.map(({ seed }) => seed);
/** Lets every settled write's callbacks run. */
const landed = async () =>
  new Promise((resolve) => {
    setImmediate(resolve);
  });

describe('keeper', () => {
  it('writes at once with nothing in flight', () => {
    const store = fakeStore(new Map(), 'held');
    keeper(store, 4, unreported).keep(record(1));
    assert.deepEqual(seeds(store.written), [1]);
    assert.deepEqual(store.records.get(4), record(1));
  });

  it('keeps one write in flight, the newest waiting behind it', async () => {
    const store = fakeStore(new Map(), 'held');
    const keeping = keeper(store, 4, unreported);
    for (const seed of [1, 2, 3, 4]) keeping.keep(record(seed));
    assert.deepEqual(seeds(store.written), [1]);
    store.land();
    await landed();
    assert.deepEqual(seeds(store.written), [1, 4]);
    store.land();
    await landed();
    keeping.keep(record(5));
    assert.deepEqual(seeds(store.written), [1, 4, 5]);
  });

  it('stops keeping after a refused write, reporting it once', async () => {
    const store = fakeStore(new Map(), 'held');
    const reported: unknown[] = [];
    const keeping = keeper(store, 4, (error) => {
      reported.push(error);
    });
    keeping.keep(record(1));
    keeping.keep(record(2));
    const refusal = new Error('quota');
    store.refuse(refusal);
    await landed();
    keeping.keep(record(3));
    keeping.poll(0, () => record(4));
    await landed();
    assert.deepEqual(seeds(store.written), [1]);
    assert.deepEqual(reported, [refusal]);
  });

  it('polls at most once a period, building the record only then', () => {
    const store = fakeStore();
    const keeping = keeper(store, 4, unreported);
    const built: number[] = [];
    const at = (now: number) => {
      keeping.poll(now, () => {
        built.push(now);
        return record(now);
      });
    };
    for (const now of [0, 400, POLL_MS - 1, POLL_MS, POLL_MS + 10, 2500]) {
      at(now);
    }
    assert.deepEqual(built, [0, POLL_MS, 2500]);
  });
});
