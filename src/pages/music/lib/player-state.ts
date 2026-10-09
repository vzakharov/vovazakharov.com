import type { Slugged } from '@/shared/content';
import type { Locale } from '@/shared/i18n';
import type { Playable } from '@/shared/music-catalogue';
import type { LabeledLink, Titled } from '@/shared/typings';

/** A song's title as one locale shows it, and whether it is set in italics as a romanization. */
export type SongName = Titled & { transliterated: boolean };

/** A song's billing, each artist linked to its page and the joins between them as text. */
export type Billing = Array<LabeledLink | string>;

/** The billing as one line of text, for where a link cannot go. */
export function billingText(billing: Billing): string {
  return billing
    .map((part) => (typeof part === 'string' ? part : part.label))
    .join('');
}

/**
 * A song as the player needs it: resolved at build time from the collection and
 * handed to the client as props, so no part of the content pipeline is shipped.
 */
export type PlayerTrack = Slugged &
  Playable & {
    /** What the song is called in each language, how it is billed, and where each is served. */
    titles: Record<Locale, SongName>;
    billing: Record<Locale, Billing>;
    routes: Record<Locale, string>;
  };

/** Tracks by catalogue position — the listed songs in collection order, then any appended. */
export type WithTracks = { tracks: PlayerTrack[] };

/**
 * The queue is the catalogue positions playback walks — the whole catalogue,
 * or one album in track order — and play order a permutation of it rather than
 * a random pick per skip, which is what makes a shuffled queue stable in both
 * directions: whatever `next` reached, `previous` returns to.
 */
export type PlayerState = {
  /** How many tracks the player knows, which is the position the next one takes. */
  trackCount: number;
  /** The queue's positions in their own order, which unshuffling returns to. */
  queue: number[];
  /** The queue's positions in play order — `queue` itself until shuffled. */
  order: number[];
  /** Where in `order` playback sits, or -1 before anything has been chosen. */
  cursor: number;
  shuffled: boolean;
  playing: boolean;
};

export type PlayerAction =
  /**
   * Play this catalogue position, wherever it sits in the current order; one
   * outside the queue puts the whole catalogue back, unshuffled.
   */
  | { type: 'select'; track: number }
  /**
   * Play a track the catalogue did not hold — a hidden song, from its own page
   * — which takes the next catalogue position and joins the end of the queue.
   */
  | { type: 'append' }
  /**
   * Make these positions the queue, in this order, and play it from its top
   * unshuffled. A position past the known ones is a track that joins with it.
   */
  | { type: 'queue'; positions: number[] }
  | { type: 'toggle' }
  /** One track forward or back, wrapping at either end. */
  | { type: 'step'; by: 1 | -1 }
  /** Turns shuffle on with this seed, or off; the current track stays playing. */
  | { type: 'shuffle'; seed: number }
  /** A fresh shuffle of the whole queue, played from its top. */
  | { type: 'shuffleAll'; seed: number }
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
  const queue = naturalOrder(count);

  return {
    trackCount: count,
    queue,
    order: queue,
    cursor: -1,
    shuffled: false,
    playing: false,
  };
}

/** The catalogue position playing now, or `undefined` before anything is chosen. */
export function currentTrack(state: PlayerState): number | undefined {
  return state.cursor < 0 ? undefined : state.order[state.cursor];
}

/**
 * Whether playback is under way in exactly this queue — what an album's own
 * button asks to decide between starting the album and pausing it.
 */
export function isQueued(
  { queue, cursor }: Pick<PlayerState, 'queue' | 'cursor'>,
  positions: readonly number[],
): boolean {
  return (
    cursor >= 0 &&
    queue.length === positions.length &&
    queue.every((position, at) => position === positions[at])
  );
}

/**
 * Each wanted track's catalogue position, matched by slug. A track the player
 * does not know yet takes the next free position and is listed in `missing`,
 * in the order the positions were handed out.
 */
export function placeTracks<Track extends Slugged>(
  known: readonly Track[],
  wanted: readonly Track[],
): { positions: number[]; missing: Track[] } {
  const missing: Track[] = [];
  const positions = wanted.map((track) => {
    const at = [...known, ...missing].findIndex(
      ({ slug }) => slug === track.slug,
    );

    if (at !== -1) return at;

    missing.push(track);

    return known.length + missing.length - 1;
  });

  return { positions, missing };
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
 * A permutation of the queue's positions, with `first` moved to the front so
 * turning shuffle on does not interrupt what is playing.
 */
export function shuffleOrder(
  queue: readonly number[],
  first: number | undefined,
  seed: number,
): number[] {
  const pool = [...queue];
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
  const { order, trackCount } = state;
  const at = order.indexOf(track);

  if (at !== -1) return { ...state, cursor: at, playing: true };
  if (track < 0 || track >= trackCount) return state;

  // A song from outside an album's queue: the album's turn is over. Shuffle
  // comes back on, if it was, through the stored switch the player obeys.
  const queue = naturalOrder(trackCount);

  return {
    trackCount,
    queue,
    order: queue,
    cursor: track,
    shuffled: false,
    playing: true,
  };
}

function append(state: PlayerState): PlayerState {
  const { trackCount, queue, order } = state;

  return {
    ...state,
    trackCount: trackCount + 1,
    queue: [...queue, trackCount],
    order: [...order, trackCount],
    cursor: order.length,
    playing: true,
  };
}

function enqueue(state: PlayerState, positions: number[]): PlayerState {
  if (positions.length === 0) return state;

  return {
    trackCount: Math.max(
      state.trackCount,
      ...positions.map((position) => position + 1),
    ),
    queue: positions,
    order: positions,
    cursor: 0,
    shuffled: false,
    playing: true,
  };
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
  const order = shuffled ? shuffleOrder(state.queue, track, seed) : state.queue;

  return {
    ...state,
    order,
    cursor: track === undefined ? -1 : order.indexOf(track),
    shuffled,
  };
}

/** Puts the whole catalogue back as the queue, whatever album held it. */
function shuffleAll(state: PlayerState, seed: number): PlayerState {
  const { trackCount } = state;

  if (trackCount === 0) return state;

  const queue = naturalOrder(trackCount);

  return {
    trackCount,
    queue,
    order: shuffleOrder(queue, undefined, seed),
    cursor: 0,
    shuffled: true,
    playing: true,
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
  if (action.type === 'append') return append(state);
  if (action.type === 'queue') return enqueue(state, action.positions);
  if (action.type === 'toggle') return toggle(state);
  if (action.type === 'step') return step(state, action.by);
  if (action.type === 'shuffle') return reshuffle(state, action.seed);
  if (action.type === 'shuffleAll') return shuffleAll(state, action.seed);

  const { playing } = action;

  return { ...state, playing };
}
