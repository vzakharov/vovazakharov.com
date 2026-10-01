/**
 * A dashing kind's fastest frame at its own size, read off the game's own
 * flight curve (`flightPoint`, timed as `flight-timing.ts` times a leg with
 * a length: that length at the kind's `cruising` speed, dashing as its
 * habits say). The flutter is left out: its lift is in the insect's own
 * size, which the scene sets, and over one frame it moves a fly under a
 * tenth of its dash.
 */

import { FLIGHT_HABITS } from '../../src/pages/mushrooms/model/flight-habits.ts';
import type { InsectKind } from '../../src/pages/mushrooms/model/insect-genes.ts';
import { flightPoint } from '../../src/pages/mushrooms/model/insect-paths.ts';
import { FPS } from './veer-watch.ts';

/** How finely, in ms, a leg is sampled for its fastest frame. */
const SAMPLE = 1;
/**
 * How long, in s, the leg sampled flies: long enough that its dash spans
 * many frames, as the longest a kind flies does, where a short leg's dash
 * is over within a frame or two and its fastest frame averages it down.
 */
const LONG = 30;

/**
 * The most one frame moves a `kind` on a straight leg, in butterfly sizes,
 * whether it set off from still or mid-flight and bowed either way; `undefined` for a kind that
 * never dashes. Without its flutter a leg's shape is the same at every
 * length, so the fastest of any leg is the fastest of the longest.
 */
export function dashPeak(kind: InsectKind): number | undefined {
  const { cruising, dashing } = FLIGHT_HABITS[kind];
  if (dashing === undefined) return undefined;
  const length = cruising * LONG;
  const arrives = (1000 * length) / cruising;
  const frame = 1000 / FPS;
  let peak = 0;
  // A phase either side bows the leg either way, with its zigzag or against it.
  const starts = [0, 1].flatMap((launched) =>
    [Math.PI / 2, -Math.PI / 2].map((side) => [launched, side] as const),
  );
  for (const [speed, phase] of starts) {
    const motion = { kind, phase, flutter: 0 };
    const path = {
      departs: 0,
      arrives,
      dash: dashing,
      launch: 1,
      speed,
      drink: 0,
      start: { x: 0, y: 0 },
      end: { x: length, y: 0 },
    };
    for (let now = 0; now + frame <= arrives; now += SAMPLE) {
      const [a, b] = [
        flightPoint(path, now, motion),
        flightPoint(path, now + frame, motion),
      ];
      peak = Math.max(peak, Math.hypot(b.x - a.x, b.y - a.y));
    }
  }
  return peak;
}
