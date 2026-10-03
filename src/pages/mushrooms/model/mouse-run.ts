/**
 * The rules of a mouse's run from its door to another house's, as pure
 * functions: which doors are in reach and which one a mouse picks, how many
 * mice each house holds as runs move them, and when an outing becomes a run;
 * the run's own clock is `mouse-run-clock.ts`. The scene holds the counts
 * and the runs under way and asks these; nothing here reads it. Plane
 * lengths are in the clump's size.
 */

import type { WithId } from '@/shared/typings';

import { distanceBetween, type Point } from './geometry';
import type { RunMoment } from './mouse-run-clock';
import type { Footed } from './placement';
import { saltedStream, type Seeded } from './random';

/**
 * How far apart two doors' feet may stand on the plane for a mouse to run
 * between them: the opening clump's feet are a tenth of it apart, and a run
 * this long takes about four seconds and keeps to one screen.
 */
export const RUN_REACH = 2.5;
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

/** A run's two houses, by their mushrooms' ids: the one it leaves and the one it goes in at. */
export type RunEnds = Pick<Flee, 'to'> & { from: string };

/** A run under way as a tap on a door sees it: its two houses and the leg it is in now. */
export type RunInLeg = RunEnds & Pick<RunMoment, 'leg'>;

/**
 * Which of `runs` has its mouse in `id`'s doorway: peeking out of it to
 * run, or going in at it until its door has shut; -1 with none.
 */
export const inDoorway = (runs: readonly RunInLeg[], id: string): number =>
  runs.findIndex(
    ({ from, to, leg }) =>
      (from === id && leg === 'peek') ||
      (to === id && (leg === 'enter' || leg === 'close')),
  );

/** What a door does when tapped: which run it starts, which of its peeks it makes, or which run's mouse in its doorway squeaks. */
export type DoorAnswer =
  | { answer: 'run'; to: string }
  | { answer: 'call'; from: string }
  | { answer: 'peek' }
  | { answer: 'knock' }
  | { answer: 'squeak'; run: number };

/**
 * What a tap on `tapped`'s door does: a run's mouse in its doorway
 * (`inDoorway`) squeaks, whatever the counts say, since a run counts its
 * mouse out as it peeks and in only once its door has shut; else its mouse
 * runs to a door in reach, or peeks with none; an empty house calls one home
 * from the fullest in reach, or opens on its empty doorway with none and
 * shuts with a knock.
 */
export function answerTap(
  mice: Mice,
  tapped: RunDoor,
  doors: readonly RunDoor[],
  runs: readonly RunInLeg[],
): DoorAnswer {
  const run = inDoorway(runs, tapped.id);
  if (run >= 0) return { answer: 'squeak', run };
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

/**
 * How long after one mouse runs out of a door the next may follow it, a
 * sinking house's mice included: over a runner's length at `RUN_PACE`, so
 * two mice from one house run one behind the other, not one on the other.
 */
export const FLEE_EVERY = 0.8;

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

/** Where a re-targeted mouse goes, and whether it runs there or is counted in at once. */
export type Retarget = Pick<Flee, 'to'> & { runs: boolean };

/**
 * Where a run whose target sank goes from `at`, its runner's point, `doors`
 * being every door still standing: running, by `emptiestNear` from there,
 * else back to `start` while it stands; else counted in at once at the
 * nearest door on the field, as `scattered` counts a mouse with no door in
 * reach, rather than running off screen; `undefined` with no door standing.
 */
export function retarget(
  mice: Mice,
  at: Point,
  start: string,
  doors: readonly RunDoor[],
): Retarget | undefined {
  const near =
    emptiestNear(mice, at, doors) ??
    (doors.some((door) => door.id === start) ? start : undefined);
  if (near !== undefined) return { to: near, runs: true };
  const to = nearestOf(at, doors);
  return to === undefined ? undefined : { to, runs: false };
}
