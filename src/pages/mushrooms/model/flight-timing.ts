/**
 * How long a leg takes: its flight, timed by its kind's habits and how far
 * apart its perches stand, and the stay after it.
 */

import { pick } from '@/shared/lib/collections';

import type { Leg, Perch, Place, Places, Sight, Timed } from './flight';
import type { Dash, Habits, Hops } from './flight-habits';
import { CLUMP_DISTANCE } from './ground';
import { perchName } from './perch-room';
import { between, type Random } from './random';

/** What of `Sight` times a leg: where the perches stand, and where the scene drew each flier. */
export type Placed = Pick<Sight, 'places' | 'drawn'>;

/** What of a leg says where an insect flying it is. */
type Flown = Pick<Leg, 'from' | 'to' | 'departs' | 'arrives'>;

/**
 * When a leg's flight takes off and lands, in ms on the scene's clock, how
 * it dashes, if it does, and how it hops about the spot in the air it comes
 * to, if it does.
 */
export type Span = {
  departs: number;
  arrives: number;
  dash?: Dash;
  hops?: Hops;
};

/**
 * The logarithmic mean of two distances: a touch over the mean of `q` along
 * a straight way between them with `1 / q` mixed evenly, as a leg's frame
 * mixes it — within 2% over the depths perches stand at, short of the
 * length a leg's bow adds.
 */
function logMean(a: number, b: number): number {
  return Math.abs(b - a) < 1e-9 * a ? a : (b - a) / Math.log(b / a);
}

/**
 * How far apart two places are as an insect flying between them is drawn,
 * in butterfly sizes where it is: the length across the layout, the more
 * the farther from the eye the way runs (`Place`).
 */
export function apartOf(here: Place, there: Place): number {
  const across = Math.hypot(there.x - here.x, there.y - here.y);
  return (across * logMean(here.fromEye, there.fromEye)) / CLUMP_DISTANCE;
}

/**
 * How far apart `places` puts two perches as an insect flying from `a` to
 * `b` is drawn (`apartOf`); `undefined` where it places either nowhere. A leg
 * to away is drawn to just past the screen's side as deep as it sets off,
 * so it is measured with its away spot level with `a`.
 */
export function apartIn(
  places: Places | undefined,
  a: Perch,
  b: Perch,
): number | undefined {
  const [here, there] = [places?.[perchName(a)], places?.[perchName(b)]];
  if (!here || !there) return undefined;
  const level = b.kind === 'away' ? pick(here, 'fromEye') : {};
  return apartOf(here, { ...there, ...level });
}

/**
 * `places` with the perch `leg` flies to standing where an insect flying it
 * is at `now`: the time flown's share of the way from its `from`, across
 * straight and `1 / fromEye` mixed straight, as its frame flies it. A leg
 * set off then, from that perch, is drawn from where the insect was
 * (`legSetOff`), so it is timed from there too, not from the perch it never
 * reached. As given at or past arrival, for a leg in from away, whose way in
 * the sight's away spot does not stand at, and where either end has no place.
 */
export function placesFlying(
  places: Places | undefined,
  leg: Flown,
  now: number,
): Places | undefined {
  const { from, to, departs, arrives } = leg;
  const [here, there] = [places?.[perchName(from)], places?.[perchName(to)]];
  if (!places || !here || !there || from.kind === 'away' || now >= arrives) {
    return places;
  }
  const flown = Math.max(0, (now - departs) / (arrives - departs));
  const along = (a: number, b: number) => a + (b - a) * flown;
  const at: Place = {
    x: along(here.x, there.x),
    y: along(here.y, there.y),
    fromEye: 1 / along(1 / here.fromEye, 1 / there.fromEye),
  };
  return { ...places, [perchName(to)]: at };
}

/**
 * `places` as a leg the insect called `id` sets off on at `now`, from the
 * perch of `leg`, is timed from: cut off before `leg` arrives, that perch
 * stands where the scene drew the insect (`drawn`), which steers every
 * flight, so neither share of the way nor of the time finds the point;
 * where the sight places it nowhere, where `placesFlying` reckons it.
 */
export function placesSetOff(
  { places, drawn }: Placed,
  leg: Flown,
  now: number,
  id?: string,
): Places | undefined {
  const at = id === undefined ? undefined : drawn?.[id];
  if (!places || !at || now >= leg.arrives) {
    return placesFlying(places, leg, now);
  }
  return { ...places, [perchName(leg.to)]: at };
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
 * length at its kind's `cruising` speed, however long, but never quicker than
 * `flown`, its draw of the kind's `flying` time; `flown` where `places` puts
 * either perch nowhere. A kind that dashes darts the same share of every
 * flight it has a length for, so a longer way is never flown faster.
 */
function paced(
  { cruising, dashing }: Habits,
  { from, to }: Pick<Leg, 'from' | 'to'>,
  { places }: Placed,
  flown: number,
): Pick<Span, 'dash'> & { flight: number } {
  const apart = apartIn(places, from, to);
  if (apart === undefined) return { flight: flown };
  const flight = Math.max(flown, (1000 * apart) / cruising);
  return { flight, ...(dashing && { dash: dashing }) };
}

/**
 * The leg along `route` departing `now`, its flight `paced`, its stay drawn
 * off `random`, and to a spot in the air its kind's `hopping` there.
 */
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
  const hops = to.kind === 'air' ? habits.hopping : undefined;
  return {
    from,
    to,
    departs: now,
    arrives,
    ...(dash && { dash }),
    ...(hops && { hops }),
    leaves: arrives + stayAt(random, habits, to),
  };
}
