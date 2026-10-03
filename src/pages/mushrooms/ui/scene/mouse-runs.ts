/**
 * The mice's runs between houses on screen: how many mice each house holds,
 * the runs under way, and each house's outings as they come round, every
 * rule asked of `model/mouse-run.ts`. A run's mouse is drawn in a graphics
 * of its own, stood where its point on the plane is, so it sorts among the
 * mushrooms by its foot's row; its peek and its going in stay in the houses'
 * doorways, which read how far each door stands open from here.
 */

import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';
import type { WithId } from '@/shared/typings';

import { panOf } from '../../model/flight-frame';
import { CLUMP_DISTANCE } from '../../model/ground';
import {
  mouseOut,
  outingOf,
  outingStart,
  peekAfterTap,
  type Tapped,
} from '../../model/motion';
import {
  answerTap,
  entered,
  type Flee,
  FLEE_EVERY,
  left,
  type Mice,
  miceAt,
  retarget,
  type RunDoor,
  runsOuting,
  runTarget,
  scattered,
} from '../../model/mouse-run';
import {
  pathBetween,
  runAt,
  type RunCourse,
  runnerAt,
  type RunOpening,
} from '../../model/mouse-run-clock';
import { facingAlong, pathLength, sideOf } from '../../model/mouse-run-course';
import type { Seeded } from '../../model/random';
import type { BedPlace } from './bed-place';
import type { ShownDoor } from './draw-house';
import {
  containsCircle,
  type WithCircleHit,
  type WithGraphics,
} from './hit-areas';
import type { Shown } from './mushroom-shown';
import {
  doorEnd,
  drawRunner,
  type PaintedEnd,
  type ShownRunner,
} from './runner-shown';
import type { MeadowSound } from './sound';
import type { View } from './view';

/**
 * How far a door's mouse's head is out and the door open (0 to 1), as its
 * peeks and the runs at it have them, and, while a run's mouse looks toward
 * its target from the doorway, which way it looks.
 */
export type DoorShown = Pick<ShownDoor, 'out' | 'open'> &
  Partial<Pick<ShownDoor, 'look'>>;

/** A house's door as the runs answer it: a tap on it, and how it shows at a moment. */
export type MouseDoor = {
  tap: (mouse: Tapped) => void;
  at: (t: number, mouse: Tapped) => DoorShown;
};

/**
 * A run under way, from `from`'s door to `to`'s: when its clock began and
 * what it is fixed at; its ends as last stood with their houses' paint,
 * each kept once its door sinks and the start `fixed` where a re-target
 * began on the ground, so the runner is drawn whatever its houses do; its
 * runner, the circle it takes a tap in, when it was last tapped, and its
 * patter's last tick.
 */
export type MouseRun = Pick<Flee, 'to'> &
  Pick<Tapped, 'tappedAt'> &
  WithCircleHit &
  WithGraphics & {
    from: string;
    beganAt: number;
    course: RunCourse;
    start: PaintedEnd | undefined;
    end: PaintedEnd | undefined;
    fixed: boolean;
    pattered: number;
  };

/** A house's door as the runs keep it: its mushroom's seed, its last outing, the one a run took and its last knock. */
type Kept = Seeded & {
  outing: number | undefined;
  ran: number | undefined;
  knockedAt: number;
};

/** How often a runner's patter ticks while it runs, in seconds: a quick, light patter at any pace. */
const PATTER_EVERY = 0.08;

/** Whether a house's door is drawn now, for a run to start at it: on screen and short of the brow. */
const seenAt = ({ drawn, behind }: BedPlace): boolean => drawn && !behind;

export class MouseRuns {
  private counts: Mice = new Map();
  private readonly under: MouseRun[] = [];
  private readonly kept = new Map<string, Kept>();
  /** The doors that have brought their mouse, so a door brings one only once. */
  private readonly known = new Set<string>();
  private view: View | undefined;

  private readonly scene: Phaser.Scene;
  private readonly voice: MeadowSound;
  private readonly now: () => number;
  private readonly shown: () => ReadonlyMap<string, Shown>;

  constructor(
    scene: Phaser.Scene,
    voice: MeadowSound,
    now: () => number,
    shown: () => ReadonlyMap<string, Shown>,
  ) {
    this.scene = scene;
    this.voice = voice;
    this.now = now;
    this.shown = shown;
  }

  /** How many mice each house holds now. */
  mice(): Mice {
    return this.counts;
  }

  /** The runs under way. */
  runs(): ReadonlyArray<Readonly<MouseRun>> {
    return this.under;
  }

  /** The door of the house of `id`, grown from `seed`, as its view asks the runs. */
  doorOf({ id, seed }: WithId & Seeded): MouseDoor {
    this.kept.set(id, {
      seed,
      outing: undefined,
      ran: undefined,
      knockedAt: -Infinity,
    });
    return {
      tap: (mouse) => {
        this.tap(id, mouse);
      },
      at: (t, mouse) => this.doorAt(id, t, mouse),
    };
  }

  /**
   * Counts in each new door's mouse, turns each house's outing that comes
   * round into a run where the rules say so, and moves, lands and draws
   * every run as of `t`, as `view` sees the meadow.
   */
  update(t: number, view: View | undefined): void {
    this.view = view;
    const doors = this.doors();
    for (const door of doors) {
      if (this.known.has(door.id)) continue;
      this.known.add(door.id);
      this.counts = entered(this.counts, door.id);
    }
    for (const door of doors) this.watchOuting(door, doors, t);
    for (const run of this.under) this.move(run, t);
  }

  /**
   * Sends the mice of `id`'s house, sinking from `clock`, out to the doors
   * still standing, and turns the runs bound for it toward another door; a
   * run with none left sinks with it.
   */
  sink(id: string, clock: number): void {
    if (!this.known.delete(id)) return;
    const doors = this.doors();
    const sinking = this.doors(id).find((door) => door.id === id);
    if (!sinking) return;
    const { mice, fleeing } = scattered(this.counts, sinking, doors);
    this.counts = mice;
    for (const { to, wait } of fleeing) {
      this.start(id, to, clock + wait, 'leave', false);
    }
    for (const run of this.under.filter((each) => each.to === id)) {
      this.drop(run);
      const at = this.runnerPoint(run, clock);
      const to = retarget(
        this.counts,
        at?.point ?? sinking.foot,
        run.from,
        doors,
      );
      if (to === undefined) continue;
      // With no view to place it by, its mouse is counted in there at once.
      if (at) {
        const start = {
          ...pick(at, 'across'),
          front: at.point,
          sillHeight: 0,
          ...pick(at.house, 'size', 'lighting'),
        };
        this.start(run.from, to, clock, 'run', false, start);
      } else {
        this.counts = entered(this.counts, to);
      }
    }
  }

  /** Every standing doored house as the runs see it, and the one of `also` though it sinks. */
  private doors(also?: string): RunDoor[] {
    return [...this.shown()].flatMap(([id, shown]) =>
      (shown.goneAt === Infinity || id === also) && shown.house.doored
        ? [{ id, ...pick(shown, 'foot'), seen: seenAt(shown.stands) }]
        : [],
    );
  }

  private watchOuting(door: RunDoor, doors: readonly RunDoor[], t: number) {
    const kept = this.kept.get(door.id);
    const shown = this.shown().get(door.id);
    if (!kept || !shown) return;
    const { phase } = shown.house.mouse;
    const outing = outingOf(t, phase);
    const was = kept.outing;
    kept.outing = outing;
    if (was === undefined || outing === was) return;
    if (!runsOuting(kept, outing, miceAt(this.counts, door.id))) return;
    const to = runTarget(this.counts, door, doors);
    if (to === undefined) return;
    kept.ran = outing;
    this.start(door.id, to, outingStart(outing, phase), 'peek', false);
  }

  /** A tap on `id`'s door: a run out or a call home, else a peek or a knock on an empty doorway. */
  private tap(id: string, mouse: Tapped): void {
    const now = this.now();
    const doors = this.doors();
    const tapped = doors.find((door) => door.id === id);
    const answer = tapped
      ? answerTap(this.counts, tapped, doors)
      : { answer: 'peek' as const };
    if (answer.answer === 'knock') {
      const kept = this.kept.get(id);
      if (kept) kept.knockedAt = now;
      this.voice.knock();
      return;
    }
    this.voice.squeak();
    if (answer.answer === 'run') this.start(id, answer.to, now, 'peek', false);
    else if (answer.answer === 'call') {
      this.start(answer.from, id, now, 'peek', true);
    } else mouse.tappedAt = now;
  }

  /**
   * How `id`'s door shows at `t`: its mouse's head out of a run's peek, or
   * else its own peeks while it holds a mouse — not the outing a run took —
   * and open as far as the most any of those or a run or a knock opens it.
   */
  private doorAt(id: string, t: number, mouse: Tapped): DoorShown {
    const kept = this.kept.get(id);
    const home = miceAt(this.counts, id) > 0;
    const ran =
      kept?.ran !== undefined && outingOf(t, mouse.phase) === kept.ran;
    const peeking = home
      ? ran
        ? peekAfterTap(t - mouse.tappedAt)
        : mouseOut(t, mouse)
      : 0;
    let out = peeking;
    let open = peekAfterTap(t - (kept?.knockedAt ?? -Infinity));
    let look: number | undefined;
    for (const run of this.under) {
      const elapsed = t - run.beganAt;
      if (elapsed < 0 || (run.from !== id && run.to !== id)) continue;
      const moment = runAt(elapsed, run.course);
      if (run.from === id && !run.fixed) {
        open = Math.max(open, moment.fromOpen);
        if (moment.headOut > out) {
          out = moment.headOut;
          look = this.lookOf(run);
        }
      }
      if (run.to === id) open = Math.max(open, moment.toOpen);
    }
    return { out, open, look };
  }

  /** Which way a run's mouse looks from its doorway, along its course toward its target, on screen. */
  private lookOf(run: MouseRun): number | undefined {
    if (!this.view || !run.start || !run.end) return undefined;
    const { eye } = this.view;
    return facingAlong(
      pathBetween(run.start, run.end, eye, run.course.bowSign),
      0,
      eye,
    );
  }

  /**
   * Starts a run from `from` to `to` at `beganAt`, or `FLEE_EVERY` after
   * the last run from `from` began if that is later, opening with
   * `opening`: one from a door at rest takes its mouse off `from`'s count
   * now; one from a sinking house or the ground has none to take.
   */
  private start(
    from: string,
    to: string,
    beganAt: number,
    opening: RunOpening,
    calling: boolean,
    fixedStart?: PaintedEnd,
  ): void {
    const start = fixedStart ?? this.endAt(from);
    const after = this.under
      .filter((run) => run.from === from)
      .map((run) => run.beganAt + FLEE_EVERY);
    const begins = Math.max(beganAt, ...after);
    const end = this.endAt(to);
    if (opening === 'peek') this.counts = left(this.counts, from);
    const eye = this.view?.eye;
    const bowSign =
      start && end && eye ? sideOf(start.front, end.front, eye) : 1;
    const runLength =
      start && end && eye
        ? pathLength(pathBetween(start, end, eye, bowSign))
        : 0;
    const hit = new Phaser.Geom.Circle();
    const run: MouseRun = {
      from,
      to,
      beganAt: begins,
      course: { runLength, bowSign, opening, calling },
      start,
      end,
      fixed: fixedStart !== undefined,
      tappedAt: -Infinity,
      pattered: -1,
      hit,
      graphics: this.scene.add.graphics().setInteractive(hit, containsCircle),
    };
    // A runner is not the meadow: the front-most thing under a finger takes
    // its tap, so one on a runner reaches neither the ground's flowers nor a
    // mushroom behind it, and leaves the selection and any picker as they are.
    run.graphics.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      run.tappedAt = this.now();
      this.voice.squeak();
    });
    this.under.push(run);
  }

  /** The run's end at `id`'s door as the view stands it now; `undefined` with no view or no door. */
  private endAt(id: string): PaintedEnd | undefined {
    const shown = this.shown().get(id);
    return shown && this.view ? doorEnd(shown, this.view) : undefined;
  }

  /** Moves `run` to `t`: its ends stood afresh while their doors stand, its runner drawn, and its mouse counted in once it is over. */
  private move(run: MouseRun, t: number): void {
    const elapsed = t - run.beganAt;
    if (!run.fixed) run.start = this.standing(run.from) ?? run.start;
    run.end = this.standing(run.to) ?? run.end;
    const moment = runAt(Math.max(0, elapsed), run.course);
    if (moment.leg === 'over') {
      this.counts = entered(this.counts, run.to);
      this.drop(run);
      return;
    }
    const at =
      elapsed >= 0 && moment.runner ? this.runnerPoint(run, t) : undefined;
    const view = this.view;
    if (!at || !view) {
      run.graphics.setVisible(false);
      return;
    }
    const place = drawRunner(run, view, at, moment, t);
    const tick = Math.floor(elapsed / PATTER_EVERY);
    if (moment.leg === 'run' && place.drawn && tick !== run.pattered) {
      run.pattered = tick;
      const level = Math.min(1, CLUMP_DISTANCE / place.distance);
      this.voice.patter(panOf(view.eye, at.point), level);
    }
  }

  /** The run's end at `id`'s door while it stands. */
  private standing(id: string): PaintedEnd | undefined {
    return this.shown().get(id)?.goneAt === Infinity
      ? this.endAt(id)
      : undefined;
  }

  /** Where `run`'s runner stands at `t` along its course, the course, and the paint of the end it is nearer; `undefined` before its ends are known or with no view. */
  private runnerPoint(run: MouseRun, t: number): ShownRunner | undefined {
    if (!run.start || !run.end || !this.view) return;
    const moment = runAt(Math.max(0, t - run.beganAt), run.course);
    const path = pathBetween(
      run.start,
      run.end,
      this.view.eye,
      run.course.bowSign,
    );
    return {
      ...runnerAt(moment, run.start, run.end, path),
      path,
      house: moment.progress < 0.5 ? run.start : run.end,
    };
  }

  private drop(run: MouseRun): void {
    run.graphics.destroy();
    this.under.splice(this.under.indexOf(run), 1);
  }
}
