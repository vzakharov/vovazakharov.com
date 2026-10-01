/**
 * How long a leg takes: its flight, timed by its kind's habits and how far
 * apart its perches stand, and the stay after it.
 */

import type { Leg, Perch, Places, Sight, Timed } from './flight';
import type { Dash, Habits } from './flight-habits';
import { perchName } from './perch-room';
import { between, type Random } from './random';

/** What of `Sight` times a leg: where the perches stand. */
export type Placed = Pick<Sight, 'places'>;

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
 * How long a flight from `from` to `to` takes, in ms, and how it dashes: its
 * length at its kind's `cruise`, however long, but never quicker than
 * `flown`, its draw of the kind's `flying` time; `flown` where `places` puts
 * either perch nowhere. A kind that dashes darts the same share of every
 * flight it has a length for, so a longer way is never flown faster.
 */
function paced(
  { cruise, dashing }: Habits,
  { from, to }: Pick<Leg, 'from' | 'to'>,
  { places }: Placed,
  flown: number,
): Pick<Span, 'dash'> & { flight: number } {
  const apart = apartIn(places, from, to);
  if (apart === undefined) return { flight: flown };
  const flight = Math.max(flown, (1000 * apart) / cruise);
  return { flight, ...(dashing && { dash: dashing }) };
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
  const { flight, dash } = paced(habits, route, placed, flown);
  const arrives = now + flight;
  return {
    from,
    to,
    departs: now,
    arrives,
    ...(dash && { dash }),
    leaves: arrives + stayAt(random, habits, to),
  };
}
