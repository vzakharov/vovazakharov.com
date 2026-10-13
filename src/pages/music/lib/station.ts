import { shuffleOrder } from './player-state';

/**
 * Where the radio is at one instant: which cycle of the catalogue, that
 * cycle's play order, which slot of it is on air, since when, and for how long.
 */
export type Station = {
  cycle: number;
  /** Catalogue positions in the cycle's play order, one per slot. */
  order: number[];
  cursor: number;
  /** When the slot on air began, in milliseconds since the epoch. */
  startMs: number;
  /** When it ends, which is when the next slot begins. */
  endMs: number;
};

const MS = 1000;

/**
 * One cycle's play order: the catalogue shuffled with the cycle's own index as
 * the seed, so any device that asks gets the same answer. A cycle that would
 * open on the song the cycle before it closed on swaps its first two slots —
 * which keeps a song from playing twice running at any catalogue of three
 * songs or more, the swap never reaching a cycle's last slot.
 */
export function cycleOrder(count: number, cycle: number): number[] {
  const positions = Array.from({ length: count }, (_, position) => position);
  const shuffled = (seed: number) => shuffleOrder(positions, undefined, seed);
  const order = shuffled(cycle);
  const [first, second, ...rest] = order;

  return first !== undefined &&
    second !== undefined &&
    first === shuffled(cycle - 1).at(-1)
    ? [second, first, ...rest]
    : order;
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
): Station | undefined {
  const cycleMs = durations.reduce((sum, seconds) => sum + seconds * MS, 0);

  if (cycleMs <= 0) return undefined;

  const cycle = Math.floor(nowMs / cycleMs);
  const order = cycleOrder(durations.length, cycle);
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
): Station | undefined {
  return stationAt(durations, Math.max(nowMs, station.endMs));
}

/** Seconds into the slot at `nowMs`, which is where the song plays from. */
export function stationOffset({ startMs }: Station, nowMs: number): number {
  return Math.max(0, (nowMs - startMs) / MS);
}

/** The catalogue position on air. */
export function stationTrack({ order, cursor }: Station): number | undefined {
  return order[cursor];
}
