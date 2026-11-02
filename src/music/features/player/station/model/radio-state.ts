import {
  initialPlayerState,
  type PlayerAction,
  playerReducer,
  type PlayerState,
} from './player-state';

/** Whether the player is playing the radio live. */
export type OnRadio = {
  /**
   * Any action but `tune`, and any pause, releases it: playback carries on from
   * there as an ordinary shuffled queue.
   */
  radio: boolean;
};

export type RadioPlayerState = PlayerState & OnRadio;

export type RadioPlayerAction =
  | PlayerAction
  /**
   * The whole catalogue as the queue in the radio's order for this cycle,
   * played from the slot on air.
   */
  | { type: 'tune'; order: number[]; cursor: number }
  /** Off the radio, everything else as it is — a seek's way of releasing it. */
  | { type: 'release' };

export function initialRadioPlayerState(count: number): RadioPlayerState {
  return { ...initialPlayerState(count), radio: false };
}

/**
 * The queue is the catalogue positions the cycle holds, once each and in their
 * own order, so unshuffling after a release returns to the catalogue's.
 */
function tune(
  state: RadioPlayerState,
  order: number[],
  cursor: number,
): RadioPlayerState {
  if (order[cursor] === undefined) return state;

  return {
    ...state,
    queue: [...new Set(order)].toSorted((a, b) => a - b),
    order,
    cursor,
    shuffled: true,
    playing: true,
    radio: true,
  };
}

/**
 * The player's reducer with the radio laid over it. Releasing the radio happens
 * here, once, rather than at every control that can: every action but `tune`
 * releases it, so a new one does by default. Of the element's reports only a
 * pause does — playback that resumes after one is no longer live.
 */
export function radioPlayerReducer(
  state: RadioPlayerState,
  action: RadioPlayerAction,
): RadioPlayerState {
  if (action.type === 'tune') {
    return tune(state, action.order, action.cursor);
  }

  const next = action.type === 'release' ? state : playerReducer(state, action);
  const live = action.type === 'playback' && action.playing && state.radio;

  return next === state && state.radio === live
    ? state
    : { ...next, radio: live };
}
