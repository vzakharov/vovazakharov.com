import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  billingText,
  currentTrack,
  initialPlayerState,
  isQueued,
  placeTracks,
  playerReducer,
  type PlayerState,
  shouldRestart,
  shuffleOrder,
} from './player-state';

const COUNT = 10;
const EVERY = initialPlayerState(COUNT).queue;
/** An album's tracks: catalogue positions out of catalogue order. */
const ALBUM = [7, 2, 5];

function playing(
  track: number,
  state = initialPlayerState(COUNT),
): PlayerState {
  return playerReducer(state, { type: 'select', track });
}

function queued(positions = ALBUM, state = initialPlayerState(COUNT)) {
  return playerReducer(state, { type: 'queue', positions });
}

describe('shuffleOrder', () => {
  it('is a permutation of the queue', () => {
    const order = shuffleOrder(EVERY, undefined, 1234);

    assert.deepEqual(
      order.toSorted((a, b) => a - b),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    );
    assert.deepEqual(
      shuffleOrder(ALBUM, undefined, 1234).toSorted((a, b) => a - b),
      [2, 5, 7],
    );
  });

  it('is reproducible from its seed, and differs between seeds', () => {
    assert.deepEqual(
      shuffleOrder(EVERY, undefined, 7),
      shuffleOrder(EVERY, undefined, 7),
    );
    assert.notDeepEqual(
      shuffleOrder(EVERY, undefined, 7),
      shuffleOrder(EVERY, undefined, 8),
    );
  });

  it('puts the track that is already playing first', () => {
    for (const seed of [1, 2, 3, 42, 9999]) {
      assert.equal(shuffleOrder(EVERY, 6, seed)[0], 6);
    }
  });
});

describe('the queue', () => {
  it('wraps forward and back', () => {
    const last = playing(COUNT - 1);

    assert.equal(currentTrack(playerReducer(last, { type: 'step', by: 1 })), 0);
    assert.equal(
      currentTrack(playerReducer(playing(0), { type: 'step', by: -1 })),
      COUNT - 1,
    );
  });

  it('starts at the top of the queue when nothing is playing', () => {
    const fresh = initialPlayerState(COUNT);

    assert.equal(currentTrack(fresh), undefined);
    assert.equal(
      currentTrack(playerReducer(fresh, { type: 'step', by: 1 })),
      0,
    );
  });

  it('is stable backwards once shuffled', () => {
    const shuffled = playerReducer(playing(3), { type: 'shuffle', seed: 2026 });
    const forward = playerReducer(shuffled, { type: 'step', by: 1 });
    const andBack = playerReducer(forward, { type: 'step', by: -1 });

    assert.notEqual(currentTrack(forward), currentTrack(shuffled));
    assert.equal(currentTrack(andBack), currentTrack(shuffled));
  });

  it('keeps playing the same track through both shuffle toggles', () => {
    const shuffled = playerReducer(playing(4), { type: 'shuffle', seed: 11 });
    const restored = playerReducer(shuffled, { type: 'shuffle', seed: 12 });

    assert.equal(currentTrack(shuffled), 4);
    assert.equal(currentTrack(restored), 4);
    assert.equal(restored.shuffled, false);
    assert.deepEqual(restored.order, initialPlayerState(COUNT).order);
  });

  it('ignores a toggle before anything has been chosen', () => {
    const fresh = initialPlayerState(COUNT);

    assert.equal(playerReducer(fresh, { type: 'toggle' }).playing, false);
    assert.equal(playerReducer(playing(2), { type: 'toggle' }).playing, false);
  });
});

describe('a track appended to the queue', () => {
  it('takes the next position and plays', () => {
    const appended = playerReducer(playing(2), { type: 'append' });

    assert.equal(currentTrack(appended), COUNT);
    assert.equal(appended.playing, true);
    assert.equal(appended.order.length, COUNT + 1);
  });

  it('wraps forward to the top of the queue', () => {
    const appended = playerReducer(initialPlayerState(COUNT), {
      type: 'append',
    });

    assert.equal(
      currentTrack(playerReducer(appended, { type: 'step', by: 1 })),
      0,
    );
  });

  it('stays in a shuffled queue, and in the unshuffled one after it', () => {
    const shuffled = playerReducer(playing(2), { type: 'shuffle', seed: 3 });
    const appended = playerReducer(shuffled, { type: 'append' });
    const restored = playerReducer(appended, { type: 'shuffle', seed: 3 });

    assert.equal(currentTrack(appended), COUNT);
    assert.equal(currentTrack(restored), COUNT);
    assert.deepEqual(restored.order, initialPlayerState(COUNT + 1).order);
  });

  it('joins an album queue at a position past every known one', () => {
    const appended = playerReducer(queued(), { type: 'append' });

    assert.equal(currentTrack(appended), COUNT);
    assert.equal(appended.trackCount, COUNT + 1);
    assert.deepEqual(appended.queue, [...ALBUM, COUNT]);
  });
});

describe('an album played in order', () => {
  it('plays its first track, unshuffled, and walks it in track order', () => {
    const album = queued(
      ALBUM,
      playerReducer(playing(4), { type: 'shuffle', seed: 9 }),
    );

    assert.equal(currentTrack(album), 7);
    assert.equal(album.playing, true);
    assert.equal(album.shuffled, false);
    assert.deepEqual(album.order, ALBUM);

    const second = playerReducer(album, { type: 'step', by: 1 });

    assert.equal(currentTrack(second), 2);
  });

  it('wraps at either end of the album, not the catalogue', () => {
    const album = queued();
    const last = playerReducer(album, { type: 'step', by: -1 });

    assert.equal(currentTrack(last), 5);
    assert.equal(currentTrack(playerReducer(last, { type: 'step', by: 1 })), 7);
  });

  it('shuffles within the album, and unshuffles back to track order', () => {
    const shuffled = playerReducer(queued(), { type: 'shuffle', seed: 4 });
    const restored = playerReducer(shuffled, { type: 'shuffle', seed: 4 });

    assert.equal(currentTrack(shuffled), 7);
    assert.deepEqual(
      shuffled.order.toSorted((a, b) => a - b),
      [2, 5, 7],
    );
    assert.deepEqual(restored.order, ALBUM);
    assert.equal(currentTrack(restored), 7);
  });

  it('selects a track of its own without leaving the album', () => {
    const selected = playing(5, queued());

    assert.equal(currentTrack(selected), 5);
    assert.deepEqual(selected.queue, ALBUM);
  });

  it('gives way to the whole catalogue, unshuffled, for a song outside it', () => {
    const shuffled = playerReducer(queued(), { type: 'shuffle', seed: 4 });
    const outside = playing(3, shuffled);

    assert.equal(currentTrack(outside), 3);
    assert.equal(outside.shuffled, false);
    assert.deepEqual(outside.queue, EVERY);
    assert.deepEqual(outside.order, EVERY);
    assert.equal(
      currentTrack(playerReducer(outside, { type: 'step', by: 1 })),
      4,
    );
  });

  it('grows the known tracks by the positions it brings', () => {
    const album = queued([3, COUNT, COUNT + 1]);

    assert.equal(album.trackCount, COUNT + 2);
    assert.equal(
      currentTrack(playerReducer(album, { type: 'append' })),
      COUNT + 2,
    );
  });

  it('ignores an empty album', () => {
    const before = playing(2);

    assert.equal(queued([], before), before);
  });

  it('is what shuffling everything replaces with the whole catalogue', () => {
    const all = playerReducer(queued(), { type: 'shuffleAll', seed: 5 });

    assert.deepEqual(all.queue, EVERY);
    assert.deepEqual(all.order, shuffleOrder(EVERY, undefined, 5));
  });
});

describe('isQueued', () => {
  it('holds only once the same positions, in the same order, are playing', () => {
    assert.equal(isQueued(initialPlayerState(3), [0, 1, 2]), false);
    assert.equal(isQueued(queued(), ALBUM), true);
    assert.equal(isQueued(queued(), [2, 5, 7]), false);
    assert.equal(isQueued(queued(), [7, 2]), false);
    assert.equal(isQueued(playing(3, queued()), ALBUM), false);
  });
});

describe('placeTracks', () => {
  const known = [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }];

  it('finds known tracks by slug, and numbers the rest on from the known', () => {
    const { positions, missing } = placeTracks(known, [
      { slug: 'c' },
      { slug: 'x' },
      { slug: 'a' },
      { slug: 'y' },
      { slug: 'x' },
    ]);

    assert.deepEqual(positions, [2, 3, 0, 4, 3]);
    assert.deepEqual(missing, [{ slug: 'x' }, { slug: 'y' }]);
  });
});

describe('shuffling everything', () => {
  it('plays the top of a fresh shuffle, whatever was playing', () => {
    const all = playerReducer(playing(4), { type: 'shuffleAll', seed: 5 });

    assert.deepEqual(all.order, shuffleOrder(EVERY, undefined, 5));
    assert.equal(all.cursor, 0);
    assert.equal(all.playing, true);
    assert.equal(all.shuffled, true);
  });

  it('stays shuffled when pressed again', () => {
    const once = playerReducer(initialPlayerState(COUNT), {
      type: 'shuffleAll',
      seed: 5,
    });

    assert.equal(
      playerReducer(once, { type: 'shuffleAll', seed: 6 }).shuffled,
      true,
    );
  });
});

describe('billingText', () => {
  it('reads each linked name as its label', () => {
    assert.equal(
      billingText([
        { label: 'GENERATED', href: '/music/artists/generated' },
        ' feat. ',
        { label: 'Йухи', href: '/music/artists/yoohie/ru' },
      ]),
      'GENERATED feat. Йухи',
    );
  });
});

describe('shouldRestart', () => {
  it('restarts only once the track is past the threshold', () => {
    assert.equal(shouldRestart(0), false);
    assert.equal(shouldRestart(2.9), false);
    assert.equal(shouldRestart(3), true);
  });
});
