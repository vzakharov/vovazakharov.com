import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  currentTrack,
  initialPlayerState,
  playerReducer,
  type PlayerState,
  shouldRestart,
  shuffleOrder,
} from './player-state';

const COUNT = 10;

function playing(
  track: number,
  state = initialPlayerState(COUNT),
): PlayerState {
  return playerReducer(state, { type: 'select', track });
}

describe('shuffleOrder', () => {
  it('is a permutation of every position', () => {
    const order = shuffleOrder(COUNT, undefined, 1234);

    assert.deepEqual(
      order.toSorted((a, b) => a - b),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    );
  });

  it('is reproducible from its seed, and differs between seeds', () => {
    assert.deepEqual(
      shuffleOrder(COUNT, undefined, 7),
      shuffleOrder(COUNT, undefined, 7),
    );
    assert.notDeepEqual(
      shuffleOrder(COUNT, undefined, 7),
      shuffleOrder(COUNT, undefined, 8),
    );
  });

  it('puts the track that is already playing first', () => {
    for (const seed of [1, 2, 3, 42, 9999]) {
      assert.equal(shuffleOrder(COUNT, 6, seed)[0], 6);
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

describe('shouldRestart', () => {
  it('restarts only once the track is past the threshold', () => {
    assert.equal(shouldRestart(0), false);
    assert.equal(shouldRestart(2.9), false);
    assert.equal(shouldRestart(3), true);
  });
});
