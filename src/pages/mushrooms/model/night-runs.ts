/**
 * The mice's own runs at dusk, as a pure rule of the meadow's tick: every
 * `NIGHT_GAP` (seeded) a mouse home in a house drawn now runs to another
 * door drawn now, by `mouse-run.ts`'s target, or peeks with none. The scene hands the
 * tick its doors and counts (`Burrows`) and plays each new `NightRuns.last`
 * as a run or a peek; by day the rule rests and the timer starts afresh at
 * the next dusk.
 */

import { type Dusk, dusky } from './dusk';
import type { Stamped } from './motion';
import {
  type Mice,
  miceAt,
  type RunDoor,
  type RunEnds,
  runTarget,
} from './mouse-run';
import { between, pick, saltedStream, type Seeded } from './random';

/** How long, in ms, the meadow waits at dusk between one mouse's outing and the next. */
export const NIGHT_GAP = [6000, 12_000] as const;

/** What the tick sees of the houses: their doors, the mice home in each, and the visit's seed the timing grows from. */
export type Burrows = Seeded & { doors: readonly RunDoor[]; mice: Mice };

/** One outing the dusk sent: from which house, to which (`undefined` for a peek), and when. */
export type NightRun = Stamped &
  Pick<RunEnds, 'from'> & { to: string | undefined };

/**
 * The dusk's outings so far: when the next is due (`undefined` by day), how
 * many it has sent, and the latest, which the scene plays once.
 */
export type NightRuns = {
  due: number | undefined;
  made: number;
  last: NightRun | undefined;
};

export const NO_NIGHT_RUNS: NightRuns = {
  due: undefined,
  made: 0,
  last: undefined,
};

const NIGHT_SALT = 0x2c_91_5e_d3;

/** The wait before outing `made`, off `seed`. */
const gapOf = (seed: number, made: number): number =>
  between(saltedStream(seed, NIGHT_SALT, made), ...NIGHT_GAP);

/**
 * Who goes out on outing `made`: of the houses drawn now with a mouse home,
 * one with another door in sight runs to the one `runTarget` picks, else one
 * without peeks, each picked by the seed; `undefined` with no mouse in sight.
 */
function outingFrom(
  { seed, doors, mice }: Burrows,
  made: number,
): Omit<NightRun, 'at'> | undefined {
  const home = doors.filter((door) => door.seen && miceAt(mice, door.id) > 0);
  const runs = home.flatMap((door) => {
    const to = runTarget(mice, door, doors);
    return to === undefined ? [] : [{ from: door.id, to }];
  });
  const random = saltedStream(seed, NIGHT_SALT + 1, made);
  const [first, ...rest] = runs;
  if (first) return pick(random, [first, ...rest]);
  const [lone, ...others] = home;
  return lone && { from: pick(random, [lone, ...others]).id, to: undefined };
}

/**
 * `night` as of `now`: by day, at rest with nothing due; at dusk, the next
 * outing due a seeded gap after dusk falls or after the last, and sent as
 * it comes due — the same object while nothing changes.
 */
export function nightRan(
  night: NightRuns,
  dusk: Dusk,
  now: number,
  burrows: Burrows | undefined,
): NightRuns {
  if (!dusky(dusk, now)) {
    return night.due === undefined ? night : { ...night, due: undefined };
  }
  if (burrows === undefined) return night;
  const { seed } = burrows;
  if (night.due === undefined) {
    return { ...night, due: now + gapOf(seed, night.made) };
  }
  if (now < night.due) return night;
  const outing = outingFrom(burrows, night.made);
  const made = night.made + 1;
  return {
    due: now + gapOf(seed, made),
    made,
    last: outing ? { ...outing, at: now } : night.last,
  };
}
