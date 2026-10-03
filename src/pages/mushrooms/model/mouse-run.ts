/**
 * The rules of a mouse's run from its door to another house's, as pure
 * functions: which doors are in reach and which one a mouse picks, how many
 * mice each house holds as runs move them, when an outing becomes a run, and
 * where a run has its mouse as a function of its own clock. The scene holds
 * the counts and the runs under way and asks these; nothing here reads it.
 * Plane lengths are in the clump's size, times in seconds.
 */

import type { WithId } from '@/shared/typings';

import { distanceBetween, type Point, type Wide } from './geometry';
import { type DoorPlace, onStem } from './house';
import { PEEK_DUCK, PEEK_RISE, smooth } from './motion';
import type { Footed } from './placement';
import { saltedStream, type Seeded } from './random';

/**
 * How far apart two doors' feet may stand on the plane for a mouse to run
 * between them: the opening clump's feet are a tenth of it apart, and a run
 * this long takes about four seconds and keeps to one screen.
 */
export const RUN_REACH = 2.5;
/** How fast a mouse runs along the plane, at full pace. */
export const RUN_PACE = 0.6;
/** The share of a house's outings that become runs when a door is in reach and it holds one mouse. */
export const RUN_SHARE = 0.5;

/** How many mice each house holds, by its mushroom's id; a house missing holds none. */
export type Mice = ReadonlyMap<string, number>;

/** A house's door as the runs see it: where its foot stands on the plane, and whether it is drawn now. */
export type RunDoor = WithId & Pick<Footed, 'foot'> & { seen: boolean };

/** How many mice `id`'s house holds. */
export const miceAt = (mice: Mice, id: string): number => mice.get(id) ?? 0;

/** How many mice the houses hold between them. */
export const miceHome = (mice: Mice): number =>
  [...mice.values()].reduce((sum, count) => sum + count, 0);

/** `mice` with one more at `id`: a mouse gone in there, or the one a new door brings. */
export function entered(mice: Mice, id: string): Mice {
  return new Map(mice).set(id, miceAt(mice, id) + 1);
}

/** `mice` with one fewer at `id`, as a run takes its mouse out; a house with none has none to give. */
export function left(mice: Mice, id: string): Mice {
  const count = miceAt(mice, id);
  if (count === 0) throw new Error(`No mouse home at ${id} to leave it`);
  return new Map(mice).set(id, count - 1);
}

/** `mice` with one moved from `from` to `to`: a run's two ends taken at once. */
export const moved = (mice: Mice, from: string, to: string): Mice =>
  entered(left(mice, from), to);

/** Whether two feet stand near enough for a mouse to run between them. */
export const inReach = (a: Point, b: Point): boolean =>
  distanceBetween(a, b) <= RUN_REACH;

/** Of `doors` other than `except`, the ones drawn now within reach of `origin`. */
const seenAround = (
  origin: Point,
  doors: readonly RunDoor[],
  except?: string,
): RunDoor[] =>
  doors.filter(
    (door) => door.id !== except && door.seen && inReach(origin, door.foot),
  );

/**
 * The first of `doors` by `count`, lowest first, then by distance from
 * `origin`, then by id, so a choice never flickers between equals.
 */
function firstBy(
  doors: readonly RunDoor[],
  origin: Point,
  count: (door: RunDoor) => number,
): RunDoor | undefined {
  const ranked = doors.map((door) => ({
    door,
    count: count(door),
    away: distanceBetween(origin, door.foot),
  }));
  ranked.sort(
    (a, b) =>
      a.count - b.count ||
      a.away - b.away ||
      (a.door.id < b.door.id ? -1 : a.door.id > b.door.id ? 1 : 0),
  );
  return ranked[0]?.door;
}

/**
 * Where a mouse running from `origin` goes: of the doors drawn now within
 * `RUN_REACH` of it, other than `except`, the emptiest house, then the
 * nearest — so the house a mouse has left is the first refilled, and mice
 * spread rather than shuttle between two houses.
 */
export function emptiestNear(
  mice: Mice,
  origin: Point,
  doors: readonly RunDoor[],
  except?: string,
): string | undefined {
  return firstBy(seenAround(origin, doors, except), origin, (door) =>
    miceAt(mice, door.id),
  )?.id;
}

/** Where a mouse leaving `from` runs to, when `from` is drawn now and a door is in reach. */
export function runTarget(
  mice: Mice,
  from: RunDoor,
  doors: readonly RunDoor[],
): string | undefined {
  return from.seen ? emptiestNear(mice, from.foot, doors, from.id) : undefined;
}

/**
 * Which house sends a mouse home to the empty `to` called: the fullest
 * holding any, of those drawn now in reach of it, then the nearest.
 */
export function caller(
  mice: Mice,
  to: RunDoor,
  doors: readonly RunDoor[],
): string | undefined {
  if (!to.seen) return undefined;
  const homed = seenAround(to.foot, doors, to.id).filter(
    (door) => miceAt(mice, door.id) > 0,
  );
  return firstBy(homed, to.foot, (door) => -miceAt(mice, door.id))?.id;
}

const RUN_SALT = 0x6e_37_a1_c9;

/**
 * Whether a house's `outing` (`outingOf`) is a run, a door being in reach:
 * always when it holds two or more, else when its seed's draw for that
 * outing falls under `RUN_SHARE`; never from an empty house.
 */
export function runsOuting(
  { seed }: Seeded,
  outing: number,
  count: number,
): boolean {
  if (count === 0) return false;
  return count >= 2 || saltedStream(seed, RUN_SALT, outing)() < RUN_SHARE;
}

/** What a door does when tapped: which run it starts, or which of its peeks it makes. */
export type DoorAnswer =
  | { answer: 'run'; to: string }
  | { answer: 'call'; from: string }
  | { answer: 'peek' }
  | { answer: 'knock' };

/**
 * What a tap on `tapped`'s door does: its mouse runs to a door in reach, or
 * peeks with none; an empty house calls one home from the fullest in reach,
 * or opens on its empty doorway with none and shuts with a knock.
 */
export function answerTap(
  mice: Mice,
  tapped: RunDoor,
  doors: readonly RunDoor[],
): DoorAnswer {
  if (miceAt(mice, tapped.id) > 0) {
    const to = runTarget(mice, tapped, doors);
    return to === undefined ? { answer: 'peek' } : { answer: 'run', to };
  }
  const from = caller(mice, tapped, doors);
  return from === undefined ? { answer: 'knock' } : { answer: 'call', from };
}

/** The nearest of `doors` to `origin` other than `except`, drawn or not. */
const nearestOf = (origin: Point, doors: readonly RunDoor[], except?: string) =>
  firstBy(
    doors.filter((door) => door.id !== except),
    origin,
    () => 0,
  )?.id;

/** How long after a sinking begins each of its mice after the first runs out. */
export const FLEE_EVERY = 0.3;

/** A mouse running out of a sinking house: to which door, and how long after the sinking begins. */
export type Flee = { to: string; wait: number };

/**
 * Where a sinking house's mice go, `doors` being every door standing on the
 * field: each to the door `emptiestNear` picks, the ones already sent
 * counted there, one every `FLEE_EVERY`; with none in reach, to the nearest
 * door on the field — running when both doors are drawn, else counted in
 * there at once. With no other door standing they sink with the house. The
 * mice that stay or sink are gone from `mice`; the ones counted in at once
 * are in it; the ones running are in `fleeing`, for the scene's runs.
 */
export function scattered(
  mice: Mice,
  sinking: RunDoor,
  doors: readonly RunDoor[],
): { mice: Mice; fleeing: Flee[] } {
  const count = miceAt(mice, sinking.id);
  const rest = new Map(mice);
  rest.delete(sinking.id);
  let after: Mice = rest;
  let planned: Mice = rest;
  const fleeing: Flee[] = [];
  for (let index = 0; index < count; index++) {
    const near = sinking.seen
      ? emptiestNear(planned, sinking.foot, doors, sinking.id)
      : undefined;
    const to = near ?? nearestOf(sinking.foot, doors, sinking.id);
    if (to === undefined) break;
    planned = entered(planned, to);
    const runs =
      sinking.seen && doors.some((door) => door.id === to && door.seen);
    if (runs) fleeing.push({ to, wait: fleeing.length * FLEE_EVERY });
    else after = entered(after, to);
  }
  return { mice: after, fleeing };
}

/**
 * Where a run whose target sank goes from `at`, its runner's point, `doors`
 * being every door still standing: by `emptiestNear` from there, else back
 * to `start` while it stands, else the nearest door on the field;
 * `undefined` with no door standing.
 */
export function retarget(
  mice: Mice,
  at: Point,
  start: string,
  doors: readonly RunDoor[],
): string | undefined {
  return (
    emptiestNear(mice, at, doors) ??
    (doors.some((door) => door.id === start) ? start : undefined) ??
    nearestOf(at, doors)
  );
}

/** A run's legs, in order, and `over` once its door has shut behind it. */
export const RUN_LEGS = [
  'peek',
  'leave',
  'run',
  'enter',
  'close',
  'over',
] as const;
export type RunLeg = (typeof RUN_LEGS)[number];

/**
 * The leg a run begins in: `peek` from a door at rest, `leave` from a
 * sinking house in a hurry, `run` from the ground where a run re-targeted.
 */
export type RunOpening = Extract<RunLeg, 'peek' | 'leave' | 'run'>;

/**
 * What a run is fixed at when it starts: how far it runs on the plane, the
 * leg it opens with, and whether its target was called and holds its door
 * open from the start.
 */
export type RunCourse = {
  runLength: number;
  opening: RunOpening;
  calling: boolean;
};

/** How long the mouse looks toward its target from the doorway before it goes. */
const RUN_LOOK = 0.5;
/** How long a hop down from the sill takes, and back up into the target's. */
const HOP_DOWN = 0.25;
const HOP_UP = 0.25;
/** How long the target door takes to shut behind the mouse. */
const RUN_SHUT = 0.3;
/** The run's shortest span, and how long it takes to reach full pace and to slow from it. */
const RUN_LEAST = 0.4;
const RUN_EASE = 0.15;
/** How quickly a called door swings open to wait. */
const CALL_OPEN = 0.18;
/** How high a hop arcs over the line from sill to ground, in the runner's width. */
const HOP_ARC = 0.3;

/** Each leg's span in `course`, in `RUN_LEGS` order, `over` lasting for ever. */
function spans({ runLength, opening }: RunCourse): Record<RunLeg, number> {
  return {
    peek: opening === 'peek' ? PEEK_RISE + RUN_LOOK : 0,
    leave: opening === 'run' ? 0 : HOP_DOWN,
    run: Math.max(RUN_LEAST, runLength / RUN_PACE),
    enter: HOP_UP,
    close: RUN_SHUT,
    over: Infinity,
  };
}

/** How long `course` takes from its start until its target's door has shut: then the mouse is counted in. */
export function runDuration(course: RunCourse): number {
  const span = spans(course);
  return span.peek + span.leave + span.run + span.enter + span.close;
}

/** How far along `span` a run is `t` into it, from 0 to 1, easing up to pace and down from it over `RUN_EASE`. */
function eased(t: number, span: number): number {
  const ramp = Math.min(RUN_EASE, span / 2);
  const whole = span - ramp;
  const clamped = Math.min(span, Math.max(0, t));
  const covered =
    clamped < ramp
      ? (clamped * clamped) / (2 * ramp)
      : clamped <= span - ramp
        ? ramp / 2 + (clamped - ramp)
        : whole - (span - clamped) ** 2 / (2 * ramp);
  return covered / whole;
}

/**
 * Where a run is at a moment of its clock: its leg; its `progress` along
 * the way from its start's front to its target's (0 to 1); how far its
 * runner stands from the ground toward the `sill` of the door it is at (0 to
 * 1) and how far up a hop's arc (`bounce`, 0 to 1); how far its head is out
 * of its start's doorway (`headOut`, as `peek` is), and how far each door
 * stands open (0 shut, 1 open); whether its `runner` is out on the ground to
 * be drawn; and how far it has `travelled` on the plane, for its stride.
 */
export type RunMoment = {
  leg: RunLeg;
  progress: number;
  sill: number;
  bounce: number;
  headOut: number;
  fromOpen: number;
  toOpen: number;
  runner: boolean;
  travelled: number;
};

/**
 * Where `course` has its mouse `elapsed` seconds after it began: it peeks
 * out and looks toward its target, hops down to the ground, runs at
 * `RUN_PACE` from front to front, hops up into the target's doorway, and
 * the door shuts behind it. Each door opens and shuts smoothly round the
 * legs that use it; a called target's opens at once and waits.
 */
export function runAt(elapsed: number, course: RunCourse): RunMoment {
  const span = spans(course);
  let leg: RunLeg = 'over';
  let t = 0;
  let begun = 0;
  for (const name of RUN_LEGS) {
    if (elapsed < begun + span[name]) {
      leg = name;
      t = elapsed - begun;
      break;
    }
    begun += span[name];
  }
  const fromDoor = course.opening !== 'run';
  const progress =
    leg === 'run'
      ? eased(t, span.run)
      : RUN_LEGS.indexOf(leg) > RUN_LEGS.indexOf('run')
        ? 1
        : 0;
  const peeking = leg === 'peek' ? smooth(t / PEEK_RISE) : 0;
  const fromOpen = {
    peek: peeking,
    leave: course.opening === 'peek' ? 1 : smooth((2 * t) / HOP_DOWN),
    run: fromDoor ? 1 - smooth(t / PEEK_DUCK) : 0,
    enter: 0,
    close: 0,
    over: 0,
  }[leg];
  const opening = {
    peek: 0,
    leave: 0,
    run: smooth((t - span.run + PEEK_DUCK) / PEEK_DUCK),
    enter: 1,
    close: 1 - smooth(t / RUN_SHUT),
    over: 0,
  }[leg];
  const waiting =
    course.calling && leg !== 'close' && leg !== 'over'
      ? smooth(elapsed / CALL_OPEN)
      : 0;
  const sill = {
    peek: 1,
    leave: 1 - smooth(t / HOP_DOWN),
    run: 0,
    enter: smooth(t / HOP_UP),
    close: 1,
    over: 1,
  }[leg];
  const hop = leg === 'leave' ? t / HOP_DOWN : leg === 'enter' ? t / HOP_UP : 0;
  return {
    leg,
    progress,
    sill,
    bounce: Math.sin(Math.PI * hop),
    headOut: peeking,
    fromOpen,
    toOpen: Math.max(opening, waiting),
    runner: leg === 'leave' || leg === 'run' || leg === 'enter',
    travelled: progress * course.runLength,
  };
}

/**
 * One end of a run: the plane point in front of its door the runner leaves
 * or reaches, its door's width, and how high its sill stands off the ground,
 * both in the clump's size. A run re-targeted from the ground starts at its
 * runner's point with its width there and no sill.
 */
export type RunEnd = Wide & { front: Point; sillHeight: number };

/** The run's end at a door seated at `door` on a mushroom of `size` in the clump's, with its `front` on the plane. */
export function endOf(front: Point, door: DoorPlace, size: number): RunEnd {
  return {
    front,
    across: door.width * size,
    sillHeight: onStem(door)({ x: 0, y: 0 }).y * size,
  };
}

/** The runner's width `progress` of the way from `from` to `to`: its own door's, easing into the target's. */
export const widthAlong = (from: Wide, to: Wide, progress: number): number =>
  from.across + (to.across - from.across) * progress;

/**
 * Where a runner stands for `moment` between `from` and `to`, all on the
 * plane in the clump's size: its point on the ground, how high it is off
 * it, its width, and the unit way from start to target it faces.
 */
export type Runner = Wide & { point: Point; up: number; heading: Point };

export function runnerAt(
  { progress, sill, bounce }: RunMoment,
  from: RunEnd,
  to: RunEnd,
): Runner {
  const across = widthAlong(from, to, progress);
  const dx = to.front.x - from.front.x;
  const dy = to.front.y - from.front.y;
  const way = Math.hypot(dx, dy);
  const end = progress < 0.5 ? from : to;
  return {
    point: {
      x: from.front.x + dx * progress,
      y: from.front.y + dy * progress,
    },
    up: sill * end.sillHeight + bounce * HOP_ARC * across,
    across,
    heading: way === 0 ? { x: 1, y: 0 } : { x: dx / way, y: dy / way },
  };
}
