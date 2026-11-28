import type { Seeded } from '@/kernel/shared/typings';

import type { Slugged } from '@/blog/shared/content';

import type { Playable } from '@/music/shared/catalogue';

/**
 * The queue is the catalogue positions playback walks — the whole catalogue,
 * or one album in track order — and play order a permutation of it rather than
 * a random pick per skip, which is what makes a shuffled queue stable in both
 * directions: whatever `next` reached, `previous` returns to.
 */
export type PlayerState = PlayOrder &
  QueuePositions &
  Playing & {
    /** How many tracks the player knows, which is the position the next one takes. */
    trackCount: number;
    shuffled: boolean;
  };

export type Playing = { playing: boolean };

type QueuePositions = {
  /** The queue's positions in their own order, which unshuffling returns to. */
  queue: number[];
};

/** Where in the play order playback sits, -1 before anything has been chosen. */
type Cursored = { cursor: number };

/**
 * Catalogue positions in the order they play — a player's `queue` itself until
 * shuffled — and where in it playback sits.
 */
export type PlayOrder = Cursored & { order: number[] };

/** What a shuffle is drawn from, its `segues` from `seguePositions`. */
type Shuffling = Seeded & { segues?: ReadonlySet<number> };

/** The catalogue positions whose track runs into the next one. */
export function seguePositions(tracks: readonly Playable[]): Set<number> {
  return new Set(
    tracks.flatMap(({ segue }, position) => (segue ? [position] : [])),
  );
}

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
  | ({ type: 'shuffle' } & Shuffling)
  /** A fresh shuffle of the whole queue, played from its top. */
  | ({ type: 'shuffleAll' } & Shuffling)
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
  { queue, cursor }: QueuePositions & Cursored,
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
 * The queue cut into runs that play as one: a position that segues takes the
 * next one in the queue with it, which is its release's next track because a
 * queue holds each album in track order.
 */
function segueRuns(
  queue: readonly number[],
  segues: ReadonlySet<number>,
): number[][] {
  const runs: number[][] = [];

  for (const [at, position] of queue.entries()) {
    const previous = runs.at(-1);
    const joined = at > 0 && segues.has(queue[at - 1] ?? -1);

    if (joined && previous !== undefined) previous.push(position);
    else runs.push([position]);
  }

  return runs;
}

/**
 * A permutation of the queue's positions, a song that segues never parted from
 * the one it runs into, with `first`'s run moved to the front so turning
 * shuffle on does not interrupt what is playing.
 */
export function shuffleOrder(
  queue: readonly number[],
  first: number | undefined,
  seed: number,
  segues: ReadonlySet<number> = new Set(),
): number[] {
  const pool = segueRuns(queue, segues);
  const random = randomFrom(seed);
  const order: number[][] = [];

  // Drawn from a shrinking pool rather than swapped in place, so no run is ever
  // read back out of an array the type system cannot prove is occupied.
  while (pool.length > 0) {
    order.push(...pool.splice(Math.floor(random() * pool.length), 1));
  }

  const leading = order.filter(
    (run) => first !== undefined && run.includes(first),
  );

  return [...leading, ...order.filter((run) => !leading.includes(run))].flat();
}

function select(state: PlayerState, track: number): PlayerState {
  const { order, trackCount } = state;
  const at = order.indexOf(track);

  if (at !== -1) return { ...state, cursor: at, playing: true };
  if (track < 0 || track >= trackCount) return state;

  // A song from outside an album's queue: the album's turn is over. Shuffle
  // comes back on, if it was, through the stored switch the player obeys.
  return { ...initialPlayerState(trackCount), cursor: track, playing: true };
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

/**
 * Where a step lands in an order of `length`, wrapping at either end. From
 * nothing, forward starts at the top and back at the end — which is what a
 * wrapping cursor gives for free.
 */
function stepped(cursor: number, by: 1 | -1, length: number): number {
  return (cursor + by + length) % length;
}

function step(state: PlayerState, by: 1 | -1): PlayerState {
  const { order, cursor } = state;

  if (order.length === 0) return state;

  return { ...state, cursor: stepped(cursor, by, order.length), playing: true };
}

/**
 * The catalogue position a step forward would play — what the player loads
 * ahead of it. Nothing before anything plays, nor where the queue holds one
 * track, which would be the one already loaded.
 */
export function upcomingTrack({
  order,
  cursor,
}: PlayOrder): number | undefined {
  if (cursor < 0 || order.length < 2) return undefined;

  return order[stepped(cursor, 1, order.length)];
}

function reshuffle(
  state: PlayerState,
  { seed, segues }: Shuffling,
): PlayerState {
  const track = currentTrack(state);
  const shuffled = !state.shuffled;
  const order = shuffled
    ? shuffleOrder(state.queue, track, seed, segues)
    : state.queue;

  return {
    ...state,
    order,
    cursor: track === undefined ? -1 : order.indexOf(track),
    shuffled,
  };
}

/** Puts the whole catalogue back as the queue, whatever album held it. */
function shuffleAll(
  state: PlayerState,
  { seed, segues }: Shuffling,
): PlayerState {
  const { trackCount } = state;

  if (trackCount === 0) return state;

  const catalogue = initialPlayerState(trackCount);

  return {
    ...catalogue,
    order: shuffleOrder(catalogue.queue, undefined, seed, segues),
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
  if (action.type === 'shuffle') return reshuffle(state, action);
  if (action.type === 'shuffleAll') return shuffleAll(state, action);

  const { playing } = action;

  return { ...state, playing };
}
