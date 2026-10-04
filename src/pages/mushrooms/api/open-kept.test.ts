import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { settled } from '../model/keeping';
import { type Kept, KEPT_VERSION } from '../model/kept-record';
import { opened } from '../ui/scene/visit-play';
import { fakeStore } from './fake-store';
import { openStore } from './meadow-store';
import { openKept } from './open-kept';

const stand = opened(3, 1180, 820, false);

function kept(seed: number): Kept {
  return {
    version: KEPT_VERSION,
    seed,
    eye: { x: 0.5, y: -1, heading: 0.2 },
    gait: 'flight',
    meadow: settled(stand.meadow, 0),
  };
}

/** A page at `hash`, recording every hash written to it. */
function page(hash: string) {
  const written: string[] = [];
  const history = {
    state: null,
    replaceState: (_state: unknown, _unused: string, url?: string | URL) => {
      written.push(String(url));
    },
  };
  return { location: { hash }, history, written };
}

describe('openKept', () => {
  it('reopens the highest kept on a bare hash', async () => {
    const store = fakeStore(new Map([1, 3, 2].map((n) => [n, kept(n * 10)])));
    const { location, history, written } = page('');
    const opening = await openKept(location, history, store);
    assert.equal(opening.seed, 30);
    assert.deepEqual(opening.kept, kept(30));
    assert.notEqual(opening.keeper, undefined);
    assert.deepEqual(written, ['#3']);
  });

  it('opens a fresh meadow past the highest for #new, replacing the hash', async () => {
    const store = fakeStore(new Map([[2, kept(20)]]));
    const { location, history, written } = page('#new');
    const opening = await openKept(location, history, store);
    assert.equal(opening.kept, undefined);
    assert.equal(opening.streams, opening.seed);
    assert.deepEqual(written, ['#3']);
    opening.keeper?.keep(kept(opening.seed));
    assert.deepEqual(store.records.get(3), kept(opening.seed));
  });

  it('opens a fresh meadow under a number none is kept as', async () => {
    const store = fakeStore(new Map([[2, kept(20)]]));
    const { location, history, written } = page('#7');
    const opening = await openKept(location, history, store);
    assert.equal(opening.kept, undefined);
    assert.deepEqual(written, ['#7']);
  });

  it('opens a kept meadow with streams of its own', async () => {
    const store = fakeStore(new Map([[2, kept(20)]]));
    const { location, history } = page('#2');
    const opening = await openKept(location, history, store);
    assert.equal(opening.seed, 20);
    assert.notEqual(opening.streams, opening.seed);
  });

  it('opens fresh beside an unreadable record, leaving it untouched', async () => {
    const other = { ...kept(20), version: 2 };
    const broken = { version: KEPT_VERSION, seed: 'nine' };
    const store = fakeStore(
      new Map<number, unknown>([
        [2, other],
        [5, broken],
      ]),
    );
    const pages = ['#2', '#5', ''].map((hash) => page(hash));
    const openings = await Promise.all(
      pages.map(async ({ location, history }) =>
        openKept(location, history, store),
      ),
    );
    for (const opening of openings) assert.equal(opening.kept, undefined);
    assert.deepEqual(
      pages.map(({ written }) => written),
      [['#6'], ['#6'], ['#6']],
    );
    assert.deepEqual(store.written, []);
    assert.deepEqual(store.records.get(2), other);
    assert.deepEqual(store.records.get(5), broken);
  });

  it('touches no hash and keeps nothing with no store', async () => {
    const { location, history, written } = page('#2');
    const opening = await openKept(location, history);
    assert.equal(opening.kept, undefined);
    assert.equal(opening.keeper, undefined);
    assert.equal(opening.streams, opening.seed);
    assert.deepEqual(written, []);
  });
});

describe('openStore', () => {
  it('answers no store where the runtime has no IndexedDB', async () => {
    assert.equal(await openStore(), undefined);
  });
});
