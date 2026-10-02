/**
 * How long a leg takes: its flight, timed by its kind's habits and how far
 * apart its perches stand, and the stay after it.
 */

import type { Leg, Perch, Place, Places, Sight, Timed } from './flight';
import { levelWith, pairFramed } from './flight-frame';
import type { Dash, Habits, Hops } from './flight-habits';
import { CLUMP_DISTANCE } from './ground';
import { perchName } from './perch-room';
import { between, type Random } from './random';

/** What of `Sight` times a leg. */
export type Placed = Pick<Sight, 'places' | 'drawn' | 'aways'>;

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
 * in butterfly sizes where it is: the length across the leg's frame, the
 * more the farther from the eye the way runs (`Place`). Posed, both are
 * framed together as the leg is drawn (`pairFramed`); else as placed.
 */
export function apartOf(here: Place, there: Place): number {
  const [a, b] = pairFramed(here, there)?.ends ?? [here, there];
  const across = Math.hypot(b.x - a.x, b.y - a.y);
  return (across * logMean(a.fromEye, b.fromEye)) / CLUMP_DISTANCE;
}

/**
 * How far apart `places` puts two perches as an insect flying from `a` to
 * `b` is drawn (`apartOf`); `undefined` where it places either nowhere. A leg
 * to away is drawn to just past the screen's side as deep as it sets off,
 * so it is measured with its away spot level with `a` (`levelWith`).
 */
export function apartIn(
  places: Places | undefined,
  a: Perch,
  b: Perch,
): number | undefined {
  const [here, there] = [places?.[perchName(a)], places?.[perchName(b)]];
  if (!here || !there) return undefined;
  return apartOf(here, b.kind === 'away' ? levelWith(here, there) : there);
}

/**
 * `places` with the perch `leg` flies to standing where an insect flying it
 * is at `now`, as its frame flies it. A leg set off then, from that perch, is
 * drawn from where the insect was (`legSetOff`), so it is timed from there
 * too, not from the perch it never reached. As given at or past arrival, for
 * a leg in from away, whose way in the sight's away spot does not stand at,
 * and where either end has no place.
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
  const paired = pairFramed(here, there);
  const [a, b] = paired?.ends ?? [here, there];
  const flown = Math.max(0, (now - departs) / (arrives - departs));
  const along = (start: number, end: number) => start + (end - start) * flown;
  const [x, y] = [along(a.x, b.x), along(a.y, b.y)];
  const forward = 1 / along(1 / a.fromEye, 1 / b.fromEye);
  const at: Place = paired
    ? paired.placed({ x, y, forward })
    : { x, y, fromEye: forward };
  return { ...places, [perchName(to)]: at };
}

/**
 * `places` as a leg the insect called `id` sets off on at `now`, from the
 * perch of `leg`, is timed from: its away spots its own (`aways`), where the
 * sight gives them. Cut off before `leg` arrives (`drawn` steers every
 * flight, so no share of the way or the time finds the point), or landed on a
 * perch the sight no longer places, that perch stands where the scene drew
 * the insect; placed nowhere by the sight, where `placesFlying` reckons it.
 */
export function placesSetOff(
  { places, drawn, aways }: Placed,
  leg: Flown,
  now: number,
  id?: string,
): Places | undefined {
  const own = id === undefined ? undefined : aways?.[id];
  const among = places && own ? { ...places, ...own } : places;
  const at = id === undefined ? undefined : drawn?.[id];
  const name = perchName(leg.to);
  if (!among || !at) return placesFlying(among, leg, now);
  if (now >= leg.arrives) {
    return name in among ? among : { ...among, [name]: at };
  }
  return { ...among, [name]: at };
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
