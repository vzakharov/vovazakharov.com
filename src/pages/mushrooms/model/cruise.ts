/**
 * A held drive along one axis, integrated frame by frame: the pace eases at
 * one steady rate toward the cruise the drive asks, and toward the end of the
 * room it brakes on the curve that brings it to rest exactly there. The axis's
 * own geometry — where its room ends, and how a move of so many units lands —
 * is the `Course`'s, so the crop's px and the eye's plane share this one copy
 * of the braking maths.
 */

/** Which way along an axis: -1 back, 1 on. */
export type Direction = -1 | 1;

/** The steady speed a held drive cruises at, in its axis's units per second. */
export type Cruised = { cruise: number };

/** How fast a drive moves along its axis now, in units per second. */
export type Paced = { pace: number };

/** Where on its axis a drive stands. */
type Placed<P> = { at: P };

/** Where a drive stands, and its pace. */
export type Cruising<P> = Placed<P> & Paced;

/** A move's landing, and whether something stopped it there, which spends the pace. */
type Stepped<P> = Placed<P> & { stopped: boolean };

/**
 * An axis a drive cruises along: its `cruise` in units per second, reached
 * from rest in `ease` seconds; which way the drive asks to go from `at`
 * (-1, 1, or 0 to stand, and any share between for a slower ask); how far it
 * can still go each way before it must rest, in units (`Infinity` for no
 * end); and where a move of `by` units from `at` lands.
 */
export type Course<P> = Cruised & {
  ease: number;
  toward: (at: P) => number;
  room: (at: P, way: Direction) => number;
  step: (at: P, by: number) => Stepped<P>;
};

/**
 * The longest stretch of time one `cruise` integrates, in seconds, so a frame
 * after the tab was away does not leap; and the longest sub-step it takes,
 * so the braking at an end comes out the same at any frame rate.
 */
const LONGEST_TICK = 0.1;
const SUBSTEP = 1 / 240;

/** The way a signed amount points, a zero counting as back. */
export function wayOf(amount: number): Direction {
  return amount > 0 ? 1 : -1;
}

/**
 * The drive `seconds` on, the most of `LONGEST_TICK`. Each sub-step is
 * integrated exactly, so away from an end a frame's length changes nothing,
 * and near one the sub-steps keep any two frame rates within a fraction of a
 * unit. A move the course stops spends the pace. No time at all returns `from`.
 */
export function cruise<P>(
  course: Course<P>,
  from: Cruising<P>,
  seconds: number,
): Cruising<P> {
  if (seconds <= 0) return from;
  const { cruise: fastest, ease, toward, room, step } = course;
  const rate = fastest / ease;
  const span = Math.min(seconds, LONGEST_TICK);
  const count = Math.ceil(span / SUBSTEP);
  const each = span / count;
  let { at, pace } = from;
  for (let index = 0; index < count; index++) {
    const asked = toward(at);
    const ahead = room(at, wayOf(asked));
    const wanted =
      asked * Math.min(fastest, Math.sqrt(2 * rate * Math.max(0, ahead)));
    // Toward an end faster than the steady rate can stop in the room left,
    // as a glide handed on can be, the drive brakes as hard as it must.
    const spare = room(at, wayOf(pace));
    const slowing =
      Math.sign(wanted) !== Math.sign(pace) ||
      Math.abs(wanted) < Math.abs(pace);
    const braking = pace !== 0 && slowing && spare > 0;
    const easing = braking ? Math.max(rate, pace ** 2 / (2 * spare)) : rate;
    const gap = wanted - pace;
    const reached = Math.abs(gap) / easing;
    let by: number;
    if (reached >= each) {
      const next = pace + Math.sign(gap) * easing * each;
      by = ((pace + next) / 2) * each;
      pace = next;
    } else {
      by = ((pace + wanted) / 2) * reached + wanted * (each - reached);
      pace = wanted;
    }
    const landed = step(at, by);
    at = landed.at;
    if (landed.stopped) pace = 0;
  }
  return { at, pace };
}
