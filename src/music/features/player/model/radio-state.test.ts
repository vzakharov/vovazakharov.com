import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { currentTrack } from './player-state';
import {
  initialRadioPlayerState,
  radioPlayerReducer,
  type RadioPlayerState,
} from './radio-state';

const COUNT = 10;
const EVERY = initialRadioPlayerState(COUNT).queue;
const ALBUM = [7, 2, 5];

function playing(track: number): RadioPlayerState {
  return radioPlayerReducer(initialRadioPlayerState(COUNT), {
    type: 'select',
    track,
  });
}

function queued(): RadioPlayerState {
  return radioPlayerReducer(initialRadioPlayerState(COUNT), {
    type: 'queue',
    positions: ALBUM,
  });
}

describe('the radio', () => {
  const ORDER = [3, 8, 0, 5, 1, 9, 2, 7, 4, 6];

  function tuned(state = initialRadioPlayerState(COUNT)): RadioPlayerState {
    return radioPlayerReducer(state, { type: 'tune', order: ORDER, cursor: 4 });
  }

  it('plays the whole catalogue in the cycle’s order from the slot on air', () => {
    const state = tuned(queued());

    assert.deepEqual(state.queue, EVERY);
    assert.deepEqual(state.order, ORDER);
    assert.equal(currentTrack(state), 1);
    assert.equal(state.playing, true);
    assert.equal(state.shuffled, true);
    assert.equal(state.radio, true);
  });

  it('ignores a slot the order does not have', () => {
    const before = initialRadioPlayerState(COUNT);

    assert.equal(
      radioPlayerReducer(before, { type: 'tune', order: ORDER, cursor: 99 }),
      before,
    );
  });

  it('is released by every action but tuning, playback carrying on', () => {
    const actions = [
      { type: 'select', track: 5 },
      { type: 'append' },
      { type: 'queue', positions: ALBUM },
      { type: 'toggle' },
      { type: 'step', by: 1 },
      { type: 'step', by: -1 },
      { type: 'shuffle', seed: 3 },
      { type: 'shuffleAll', seed: 3 },
      { type: 'release' },
      { type: 'playback', playing: false },
    ] as const;

    for (const action of actions) {
      assert.equal(
        radioPlayerReducer(tuned(), action).radio,
        false,
        action.type,
      );
    }

    const released = radioPlayerReducer(tuned(), { type: 'release' });

    assert.equal(currentTrack(released), 1);
    assert.equal(released.playing, true);
  });

  it('stays on while the element reports it playing', () => {
    assert.equal(
      radioPlayerReducer(tuned(), { type: 'playback', playing: true }).radio,
      true,
    );
  });

  it('does not come on from the element’s report alone', () => {
    assert.equal(
      radioPlayerReducer(playing(2), { type: 'playback', playing: true }).radio,
      false,
    );
  });
});
