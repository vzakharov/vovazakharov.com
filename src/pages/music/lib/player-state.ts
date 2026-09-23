import type { Playable, Slugged } from '@/shared/content';
import type { Locale } from '@/shared/i18n';

/**
 * A song as the player needs it: resolved at build time from the collection and
 * handed to the client as props, so no part of the content pipeline is shipped.
 */
export type PlayerTrack = Slugged &
  Playable & {
    /** What the song is called in each language, and where each is served. */
    titles: Record<Locale, string>;
    routes: Record<Locale, string>;
    /** How it is billed — the artist and its features, the same in both languages. */
    billing: string;
  };

/** The whole catalogue, in the order the collection lists it. */
export type WithTracks = { tracks: PlayerTrack[] };

/**
 * Play order is a permutation of catalogue positions rather than a random pick
 * per skip, which is what makes a shuffled queue stable in both directions:
 * whatever `next` reached, `previous` returns to.
 */
export type PlayerState = {
  /** Catalogue positions in play order — the identity order until shuffled. */
  order: number[];
  /** Where in `order` playback sits, or -1 before anything has been chosen. */
  cursor: number;
  shuffled: boolean;
  playing: boolean;
};

export type PlayerAction =
  /** Play this catalogue position, wherever it sits in the current order. */
  | { type: 'select'; track: number }
  | { type: 'toggle' }
  /** One track forward or back, wrapping at either end. */
  | { type: 'step'; by: 1 | -1 }
  /** Turns shuffle on with this seed, or off; the current track stays playing. */
  | { type: 'shuffle'; seed: number }
  /** The element reporting what it is actually doing. */
  | { type: 'playback'; playing: boolean };

/**
 * How long a track has to have been playing before `previous` means _back_
 * rather than _restart_ — the behaviour every other music player has, and the
 * reason a queue is not just a list with two buttons on it.
 */
const RESTART_AFTER_SECONDS = 3;

export function shouldRestart(elapsed: number): boolean {
  return elapsed >= RESTART_AFTER_SECONDS;
}

function naturalOrder(count: number): number[] {
  return Array.from({ length: count }, (_, position) => position);
}

export function initialPlayerState(count: number): PlayerState {
  return {
    order: naturalOrder(count),
    cursor: -1,
    shuffled: false,
    playing: false,
  };
}

/** The catalogue position playing now, or `undefined` before anything is chosen. */
export function currentTrack(state: PlayerState): number | undefined {
  return state.cursor < 0 ? undefined : state.order[state.cursor];
}

/** Seeded so a permutation is reproducible from the number that produced it. */
function randomFrom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d_2b_79_f5) >>> 0;

    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed);

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 2 ** 32;
  };
}

/**
 * A permutation of every catalogue position, with `first` moved to the front so
 * turning shuffle on does not interrupt what is playing.
 */
export function shuffleOrder(
  count: number,
  first: number | undefined,
  seed: number,
): number[] {
  const pool = naturalOrder(count);
  const random = randomFrom(seed);
  const order: number[] = [];

  // Drawn from a shrinking pool rather than swapped in place, so no position is
  // ever read back out of an array the type system cannot prove is occupied.
  while (pool.length > 0) {
    order.push(...pool.splice(Math.floor(random() * pool.length), 1));
  }

  return first === undefined
    ? order
    : [first, ...order.filter((position) => position !== first)];
}

function select(state: PlayerState, track: number): PlayerState {
  const at = state.order.indexOf(track);

  return at === -1 ? state : { ...state, cursor: at, playing: true };
}

function toggle(state: PlayerState): PlayerState {
  const { cursor, playing } = state;

  return cursor < 0 ? state : { ...state, playing: !playing };
}

function step(state: PlayerState, by: 1 | -1): PlayerState {
  const { order, cursor } = state;

  if (order.length === 0) return state;

  // From nothing, forward starts at the top of the queue and back at its end —
  // which is what a wrapping cursor gives for free.
  return {
    ...state,
    cursor: (cursor + by + order.length) % order.length,
    playing: true,
  };
}

function reshuffle(state: PlayerState, seed: number): PlayerState {
  const track = currentTrack(state);
  const shuffled = !state.shuffled;
  const order = shuffled
    ? shuffleOrder(state.order.length, track, seed)
    : naturalOrder(state.order.length);

  return {
    ...state,
    order,
    cursor: track === undefined ? -1 : order.indexOf(track),
    shuffled,
  };
}

/**
 * Dispatched by early return rather than a switch, so the last branch narrows
 * to the one remaining action: a new member of `PlayerAction` stops compiling
 * here instead of falling into a default nobody wrote on purpose.
 */
export function playerReducer(
  state: PlayerState,
  action: PlayerAction,
): PlayerState {
  if (action.type === 'select') return select(state, action.track);
  if (action.type === 'toggle') return toggle(state);
  if (action.type === 'step') return step(state, action.by);
  if (action.type === 'shuffle') return reshuffle(state, action.seed);

  const { playing } = action;

  return { ...state, playing };
}
