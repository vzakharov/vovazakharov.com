import { pathHash, roll, type Rolled, rollWith } from '@/dice/shared/roll';

import type { Setting } from '@/cube/entities/world';

import { SIDES } from '../lib/side';
import { type HappeningKind, kindAt, lastsOf, type Pace, PACES } from './kinds';
import { DRAWS, type Run } from './staging';

const PACE_KEYS: Readonly<Record<Pace, number>> = { brief: 0, lingering: 1 };

const Rolls = roll.struct({
  /** Where in a beat the room's own beats start, as a share of the beat. */
  phase: roll.uniform(0, 1),
  /** Under the pace's chance, the beat holds an act. */
  live: roll.over(
    roll.key({ pace: roll.int, beat: roll.int }),
    roll.uniform(0, 1),
  ),
  /** The chances of a beat's act, by name, for each of its parts. */
  draw: roll.over(
    roll.key({ pace: roll.int, beat: roll.int, turn: roll.int }),
    roll.over(roll.key(DRAWS), roll.uniform(0, 1)),
  ),
});

/** The act a beat holds: which, and its run. */
export type Plan = Run & { kind: HappeningKind };

type Beat = { beat: number; plan: Plan | null };

/** A room's rolls and the last beat planned at each pace. */
type Kept = { rolled: Rolled<typeof Rolls>; beats: Record<Pace, Beat> };

/**
 * What is known of the rooms asked about lately. A plan is a function of the
 * room and the beat alone, so keeping it changes no answer: it only makes the
 * common one — nothing, in a beat already looked at — cost no roll at all,
 * and a new beat one.
 */
const kept = new Map<number, Kept>();
const KEPT_ROOMS = 4096;

const FLOORS = 128;

function keptFor({ grain, closed }: Setting, n: number): Kept {
  const walls = SIDES.reduce<number>(
    (bits, side) => bits * 2 + Number(closed[side]),
    0,
  );
  const key = (grain * FLOORS + n) * 2 ** SIDES.length + walls;
  const known = kept.get(key);
  if (known !== undefined) return known;
  if (kept.size >= KEPT_ROOMS) kept.clear();
  const fresh: Kept = {
    rolled: rollWith(Rolls, pathHash(String(grain))),
    beats: {
      brief: { beat: Number.NaN, plan: null },
      lingering: { beat: Number.NaN, plan: null },
    },
  };
  kept.set(key, fresh);
  return fresh;
}

/** The chances an act in `beat` of `pace` draws, in `setting`'s room. */
export function chancesOf(
  setting: Setting,
  n: number,
  pace: Pace,
  beat: number,
): Plan['chance'] {
  const { rolled } = keptFor(setting, n);
  return (draw, turn = 0) =>
    rolled.draw.at({ pace: PACE_KEYS[pace], beat, turn }).at(draw);
}

function planOf(
  { rolled }: Kept,
  setting: Setting,
  n: number,
  pace: Pace,
  beat: number,
): Plan | null {
  const { every, chance } = PACES[pace];
  if (rolled.live.at({ pace: PACE_KEYS[pace], beat }) >= chance) return null;
  const draws = chancesOf(setting, n, pace, beat);
  const kind = kindAt(pace, setting, n, draws('kind'));
  if (kind === null) return null;
  const lastsFor = lastsOf(kind, draws('lasts'));
  const opens = (beat - rolled.phase) * every;
  return {
    kind,
    lastsFor,
    sinceEpoch: opens + draws('start') * (every - lastsFor),
    chance: draws,
  };
}

/**
 * The act of `pace` going on in `setting`'s room on floor `n` at `now`,
 * seconds since the epoch; null — nearly always — where there is none.
 */
export function playing(
  setting: Setting,
  n: number,
  pace: Pace,
  now: number,
): Plan | null {
  const room = keptFor(setting, n);
  const beat = Math.floor(now / PACES[pace].every + room.rolled.phase);
  const last = room.beats[pace];
  if (last.beat !== beat) {
    last.beat = beat;
    last.plan = planOf(room, setting, n, pace, beat);
  }
  const { plan } = last;
  return plan !== null &&
    now >= plan.sinceEpoch &&
    now < plan.sinceEpoch + plan.lastsFor
    ? plan
    : null;
}
