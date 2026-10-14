import { type PlayOrder, shuffleOrder } from './player-state';

/**
 * Where the radio is at one instant: which cycle of the catalogue, that
 * cycle's play order, which slot of it is on air, since when, and for how long.
 */
export type Station = PlayOrder & {
  cycle: number;
  /** When the slot on air began, in milliseconds since the epoch. */
  startMs: number;
  /** When it ends, which is when the next slot begins. */
  endMs: number;
};

const MS = 1000;

/**
 * One cycle's play order: the catalogue shuffled with the cycle's own index as
 * the seed, so any device that asks gets the same answer, a song that segues
 * never parted from the one it runs into. A cycle that would open on the song
 * the cycle before it closed on swaps its first two runs — which keeps a song
 * from playing twice running at any catalogue of three runs or more, the swap
 * never reaching a cycle's last slot.
 */
export function cycleOrder(
  count: number,
  cycle: number,
  segues: ReadonlySet<number> = new Set(),
): number[] {
  const positions = Array.from({ length: count }, (_, position) => position);
  const shuffled = (seed: number) =>
    shuffleOrder(positions, undefined, seed, segues);
  const order = shuffled(cycle);
  const [first, ...rest] = order;

  // A run that closed the cycle before ends on that song, so one that opens on
  // it is that song alone.
  if (first === undefined || first !== shuffled(cycle - 1).at(-1)) {
    return order;
  }

  const second = runLength(rest, 0, segues);

  return [...rest.slice(0, second), first, ...rest.slice(second)];
}

/** How many slots from `from` play as one: each segue takes the next position along. */
function runLength(
  order: readonly number[],
  from: number,
  segues: ReadonlySet<number>,
): number {
  let length = 1;

  for (const [at, position] of order.slice(from + 1).entries()) {
    const previous = order[from + at] ?? -1;

    if (!segues.has(previous) || position !== previous + 1) break;
    length++;
  }

  return length;
}

/**
 * The radio at `nowMs`: a timetable with no beginning, laid over Unix time as
 * back-to-back cycles of the catalogue, each as long as its songs together.
 * The lookup walks slots rather than songs, never assuming a song fills
 * exactly one. Nothing is on air for a catalogue with nothing to play.
 */
export function stationAt(
  durations: readonly number[],
  nowMs: number,
  segues: ReadonlySet<number> = new Set(),
): Station | undefined {
  const cycleMs = durations.reduce((sum, seconds) => sum + seconds * MS, 0);

  if (cycleMs <= 0) return undefined;

  const cycle = Math.floor(nowMs / cycleMs);
  const order = cycleOrder(durations.length, cycle, segues);
  let startMs = cycle * cycleMs;
  let cursor = 0;

  // The last slot ends where the cycle does, so the walk stops by then.
  for (; cursor < order.length - 1; cursor++) {
    const endMs = startMs + slotMs(durations, order, cursor);

    if (nowMs < endMs) break;

    startMs = endMs;
  }

  const endMs = startMs + slotMs(durations, order, cursor);

  return { cycle, order, cursor, startMs, endMs };
}

function slotMs(
  durations: readonly number[],
  order: readonly number[],
  cursor: number,
): number {
  const position = order[cursor];

  return position === undefined ? 0 : (durations[position] ?? 0) * MS;
}

/**
 * The slot after `station`'s, joined `nowMs` into it. A song's `seconds` is
 * whole, so its file runs up to a second short of its slot or past it: looked
 * up afresh at its `ended`, a short one would land back in itself and loop.
 */
export function nextStation(
  durations: readonly number[],
  station: Station,
  nowMs: number,
  segues: ReadonlySet<number> = new Set(),
): Station | undefined {
  return stationAt(durations, Math.max(nowMs, station.endMs), segues);
}

/** Seconds into the slot at `nowMs`, which is where the song plays from. */
export function stationOffset({ startMs }: Station, nowMs: number): number {
  return Math.max(0, (nowMs - startMs) / MS);
}

/** The catalogue position on air. */
export function stationTrack({ order, cursor }: Station): number | undefined {
  return order[cursor];
}
