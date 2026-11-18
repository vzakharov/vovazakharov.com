import { PORTALS } from './portal-counts';

const { cycleMs, ticks, swing } = PORTALS.tempo;

/** How many ticks have passed `ms` into a cycle: whole at each tick's end. */
const phaseAt = (ms: number): number =>
  (ticks * ms) / cycleMs +
  (swing * Math.sin((2 * Math.PI * ms) / cycleMs)) / (2 * Math.PI);

/** Halvings that pin a boundary far below a millisecond. */
const BISECTIONS = 60;

/** The instant `ms` into a cycle at which `phaseAt` reaches `phase`. */
function solved(phase: number): number {
  let [low, high]: [number, number] = [0, cycleMs];
  for (let i = 0; i < BISECTIONS; i += 1) {
    const middle = (low + high) / 2;
    if (phaseAt(middle) < phase) low = middle;
    else high = middle;
  }
  return low;
}

/**
 * Where each tick of a cycle starts, as solved, and the cycle's end after
 * them. Engines may round `Math.sin` differently, so these are only ever read
 * rounded, and a test keeps each far from a rounding edge.
 */
export const SOLVED: readonly number[] = Array.from(
  { length: ticks + 1 },
  (_, k) => (k === 0 ? 0 : k === ticks ? cycleMs : solved(k)),
);

/** Where each tick of a cycle starts, in whole ms into it, and the cycle's end. */
const BOUNDS: readonly number[] = SOLVED.map((ms) => Math.round(ms));

const boundOf = (k: number): number => BOUNDS[k] ?? cycleMs;

const holdOf = (k: number): number => boundOf(k + 1) - boundOf(k);

/** A stretch `[lo, hi)` of a cycle's milliseconds. */
export type Window = { lo: number; hi: number };

/**
 * Each tick's share of a cycle's time, ranked: the ticks laid end to end
 * longest first, so the slowest owns the start of the cycle's time and the
 * flicker its end. A tick draws from the same stretch of a ranking of what it
 * may show, so the longest ticks show the likeliest.
 */
const WINDOWS: readonly Window[] = (() => {
  const ranked = Array.from({ length: ticks }, (_, k) => k).toSorted(
    (a, b) => holdOf(b) - holdOf(a) || a - b,
  );
  const windows: Window[] = [];
  let lo = 0;
  for (const k of ranked) {
    windows[k] = { lo, hi: lo + holdOf(k) };
    lo += holdOf(k);
  }
  return windows;
})();

/**
 * A tick of the shared clock: the cycle since the epoch and the tick within
 * it, when it starts and ends in ms since the epoch, and its window.
 */
export type Tick = {
  cycle: number;
  tick: number;
  startMs: number;
  endMs: number;
  window: Window;
};

function tickOf(cycle: number, tick: number): Tick {
  const start = cycle * cycleMs;
  return {
    cycle,
    tick,
    startMs: start + boundOf(tick),
    endMs: start + boundOf(tick + 1),
    window: WINDOWS[tick] ?? { lo: 0, hi: 0 },
  };
}

/** The tick `epochMs` falls in. */
export function tickAt(epochMs: number): Tick {
  const cycle = Math.floor(epochMs / cycleMs);
  const into = epochMs - cycle * cycleMs;
  let tick = 0;
  while (tick < ticks - 1 && boundOf(tick + 1) <= into) tick += 1;
  return tickOf(cycle, tick);
}

/** The tick `epochMs` falls in, and every one after it. */
export function* ticksFrom(epochMs: number): Generator<Tick, never> {
  let { cycle, tick } = tickAt(epochMs);
  for (;;) {
    yield tickOf(cycle, tick);
    tick += 1;
    if (tick === ticks) [cycle, tick] = [cycle + 1, 0];
  }
}
