/**
 * A house's door as `MouseRuns` shows it: how far its mouse's head is out
 * and the door open at a moment, out of its own peeks, the dusk's call, a
 * knock and the runs that leave or reach it.
 */

import {
  mouseOut,
  outingOf,
  peekAfterTap,
  type Tapped,
} from '../../model/motion';
import type { RunEnds } from '../../model/mouse-run';
import { runAt, type RunCourse } from '../../model/mouse-run-clock';
import type { Seeded } from '../../model/random';
import type { ShownDoor } from './draw-house';

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

/** A house's door as the runs keep it: its mushroom's seed, its last outing, the one a run took, its last knock and the dusk's last peek at it. */
export type DoorKept = Seeded & {
  outing: number | undefined;
  ran: number | undefined;
  knockedAt: number;
  calledAt: number;
};

/** A run as its doors see it: its two houses, when its clock began, what it is fixed at, and whether its start was fixed on the ground. */
export type DoorRun = RunEnds & {
  beganAt: number;
  course: RunCourse;
  fixed: boolean;
};

/** A door's keeping, where the runs have one for it, and whether a mouse is home in it. */
type DoorHome = { kept: DoorKept | undefined; home: boolean };

/**
 * How `id`'s door shows at `t`: its mouse's head out of a run's peek, or
 * else its own peeks and the dusk's while it holds a mouse (`home`) — not
 * the outing a run took — and open as far as the most any of those or a run
 * or a knock opens it; `lookOf` says which way a run's mouse looks out.
 */
export function doorShownAt<Run extends DoorRun>(
  id: string,
  t: number,
  mouse: Tapped,
  { kept, home }: DoorHome,
  runs: readonly Run[],
  lookOf: (run: Run) => number | undefined,
): DoorShown {
  const ran = kept?.ran !== undefined && outingOf(t, mouse.phase) === kept.ran;
  const peeking = home
    ? ran
      ? peekAfterTap(t - mouse.tappedAt)
      : mouseOut(t, mouse)
    : 0;
  const called = home ? peekAfterTap(t - (kept?.calledAt ?? -Infinity)) : 0;
  let out = Math.max(peeking, called);
  let open = peekAfterTap(t - (kept?.knockedAt ?? -Infinity));
  let look: number | undefined;
  for (const run of runs) {
    const elapsed = t - run.beganAt;
    if (elapsed < 0 || (run.from !== id && run.to !== id)) continue;
    const moment = runAt(elapsed, run.course);
    if (run.from === id && !run.fixed) {
      open = Math.max(open, moment.fromOpen);
      if (moment.headOut > out) {
        out = moment.headOut;
        look = lookOf(run);
      }
    }
    if (run.to === id) open = Math.max(open, moment.toOpen);
  }
  return { out, open, look };
}
