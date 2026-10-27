import {
  type Path,
  type Stay,
  wingBeat,
} from '@/mushrooms/entities/insect/index.node-safe';

export const kind = 'butterfly' as const;

/** A leg with its stay, flown from one point to another. */
export type Flown = Path & Stay;

export const PATH: Flown = {
  start: { x: -40, y: 120 },
  end: { x: 300, y: 260 },
  departs: 1000,
  arrives: 3000,
  leaves: 8000,
  to: { kind: 'cap', id: 'cap' },
  launch: 0,
  speed: 0,
  drink: 0,
};

export const PHASES = [0, 0.7, 2, 3.5, 5.9];

export const times = (from: number, to: number, step: number) =>
  Array.from(
    { length: Math.floor((to - from) / step) + 1 },
    (_, index) => from + index * step,
  );

/** How far the wings swing between `from` and `to`. */
export function swing(from: number, to: number, path = PATH): number {
  const beats = times(from, to, 5).map((now) =>
    wingBeat(path, now, { phase: 0, kind }),
  );
  return Math.max(...beats) - Math.min(...beats);
}
