/**
 * How long a leg takes: its flight, timed by its kind's habits and how far
 * apart its perches stand, and the stay after it.
 */

import type { Leg, Perch, Places, Sight, Timed } from './flight';
import type { Habits } from './flight-habits';
import { perchName } from './perch-room';
import { between, type Random } from './random';

/** What of `Sight` times a leg: where the perches stand, and how far the screen shows across. */
export type Placed = Pick<Sight, 'places' | 'across'>;

/**
 * How a flight farther than its kind flies at its own pace gets there: it
 * dashes `way` of the way in the first `time` of its flight, both shares, and
 * flies the rest at its pace.
 */
type Dash = { time: number; way: number };

/**
 * When a leg's flight takes off and lands, in ms on the scene's clock, and
 * how it dashes, if it does.
 */
export type Span = { departs: number; arrives: number; dash?: Dash };

/** How far apart `places` puts two perches, `undefined` where it places either nowhere. */
export function apartIn(
  places: Places | undefined,
  a: Perch,
  b: Perch,
): number | undefined {
  const [here, there] = [places?.[perchName(a)], places?.[perchName(b)]];
  return here && there
    ? Math.hypot(there.x - here.x, there.y - here.y)
    : undefined;
}

function stayAt(random: Random, habits: Habits, to: Perch): number {
  switch (to.kind) {
    case 'flower': {
      return between(random, ...habits.drinking);
    }
    case 'cap': {
      // `nextPerch` offers a cap only to a kind that rests on one.
      if (habits.resting === undefined) {
        throw new Error('A leg to a cap for a kind that never rests on one');
      }
      return between(random, ...habits.resting);
    }
    case 'air': {
      return between(random, ...habits.hovering);
    }
    case 'away': {
      return 0;
    }
    default: {
      return to satisfies never;
    }
  }
}

/**
 * How a flight from `from` to `to` is timed, in times its `flying` time: 1 up
 * to a `stride`, in proportion past it up to `slowest`, and `slowest` past
 * that, where a kind that dashes (`dashing`) flies its last strides at its
 * own pace and dashes the rest, no faster than across the screen (`across`;
 * uncapped where it is not given), and any other simply flies faster.
 */
function paced(
  { stride, slowest, dashing }: Habits,
  { from, to }: Pick<Leg, 'from' | 'to'>,
  { places, across = Infinity }: Placed,
): Pick<Span, 'dash'> & { stretch: number } {
  const apart = apartIn(places, from, to);
  if (apart === undefined) return { stretch: 1 };
  const strides = apart / stride;
  if (strides <= slowest || dashing === undefined) {
    return { stretch: Math.min(slowest, Math.max(1, strides)) };
  }
  // The last strides at its pace, in as many strides as `flying` times.
  const atPace = (1 - dashing) * slowest;
  const slower = Math.max(1, (strides - atPace) / (across / stride - atPace));
  const share = 1 - dashing + dashing * slower;
  return {
    stretch: slowest * share,
    dash: { time: (dashing * slower) / share, way: 1 - atPace / strides },
  };
}

/** The leg along `route` departing `now`, its flight `paced` and its stay drawn off `random`. */
export function legTo(
  random: Random,
  habits: Habits,
  route: Pick<Leg, 'from' | 'to'>,
  { now, ...placed }: Timed & Placed,
): Leg {
  const { from, to } = route;
  const flown = between(random, ...habits.flying);
  const { stretch, dash } = paced(habits, route, placed);
  const arrives = now + flown * stretch;
  return {
    from,
    to,
    departs: now,
    arrives,
    ...(dash && { dash }),
    leaves: arrives + stayAt(random, habits, to),
  };
}
