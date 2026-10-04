/**
 * The time of day as a pure function of the meadow's last turn and the
 * clock, in ms on the insects' clock (`Timed.now`): the one place the meadow
 * keeps whether it is day or dusk, so every dusk rule reads `duskness` or
 * `dusky` and nothing ends a fade.
 */

import { type Ramped, smooth, type Started } from './motion';

/** The two ways the light can be going. */
export const TOWARDS = ['dusk', 'day'] as const;

/**
 * Which way the light is going, when it was turned and how dusky the meadow
 * was at that moment (`from`), so a turn reversed midway goes back from there.
 */
export type Dusk = Started & Ramped & { toward: (typeof TOWARDS)[number] };

/** How long a full turn from day to dusk, or back, takes. */
export const DUSK_MS = 4000;

/** The meadow in full daylight, as every visit opens unless the page is dark. */
export const FULL_DAY: Dusk = { toward: 'day', startedAt: 0, from: 0 };

/** The meadow at full dusk from the first frame, as a dark page opens it. */
export const FULL_DUSK: Dusk = { toward: 'dusk', startedAt: 0, from: 1 };

/**
 * How dusky the meadow is at `now`, from 0 at full day to 1 at full dusk:
 * eased from where the last turn found it toward where it is going, over
 * `DUSK_MS` for a full turn and its share of that for a part of one.
 */
export function duskness(
  { toward, startedAt, from }: Dusk,
  now: number,
): number {
  const to = toward === 'dusk' ? 1 : 0;
  const span = Math.abs(to - from) * DUSK_MS;
  if (span === 0) return to;
  return from + (to - from) * smooth((now - startedAt) / span);
}

/** Whether the meadow is past half way to dusk at `now`: what the creatures' dusk rules read. */
export function dusky(dusk: Dusk, now: number): boolean {
  return duskness(dusk, now) > 0.5;
}

/** `dusk` turned the other way at `now`, from wherever it stands then. */
export function turned(dusk: Dusk, now: number): Dusk {
  return {
    toward: dusk.toward === 'dusk' ? 'day' : 'dusk',
    startedAt: now,
    from: duskness(dusk, now),
  };
}
