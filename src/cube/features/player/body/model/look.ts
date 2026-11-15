import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import type { Room } from '@/cube/entities/world';

import { hump, rise } from './ease';

/** What the body has to say about a shrink: its first, or one more. */
export type ShrinkMoment = 'first-shrink' | 'shrink';

/**
 * What a shrinking body does with its eyes, the gaze being taken from the
 * visitor while it lasts: `hands` seconds looking down at its hands, which
 * `turn` over or not, then `glance` seconds glancing to each side, `side`
 * first. Either may be 0. `sayAt` is the second it speaks at.
 */
export type Look = {
  hands: number;
  glance: number;
  turn: boolean;
  /** 1 glances right first, -1 left. */
  side: 1 | -1;
  moment: ShrinkMoment;
  sayAt: number;
};

/** A thing that sets a look off, or is in the middle of one. */
export type Looking = { shrinkLook: Look };

/** Seconds into the shrink before the eyes go anywhere: the pill going down. */
const LEAD = 0.4;
/** Seconds the gaze takes to drop to the hands, and to come back up. */
const DROP_GAZE = 0.6;
/** Seconds the hands take to turn over. */
const TURN_OVER = 0.7;
/** Where the eyes rest on the hands, in radians under the horizon. */
const HANDS_ELEVATION = -1;
/** How far to each side a glance goes, in radians. */
const AROUND = 0.8;

/** Floor 1's look, the same for everyone: the hands, turned over, then glance. */
export const FIRST_LOOK: Look = {
  hands: 3.3,
  glance: 1.5,
  turn: true,
  side: -1,
  moment: 'first-shrink',
  sayAt: 2.2,
};

const Looks = roll.struct({
  room: roll.over(
    roll.key({ n: roll.int, x: roll.big, y: roll.big }),
    roll.struct({
      handsChance: roll.uniform(0, 1),
      hands: roll.uniform(1.6, 2.4),
      glanceChance: roll.uniform(0, 1),
      glance: roll.uniform(1.4, 2),
      turn: roll.pick(2),
      side: roll.pick(2),
    }),
  ),
});

/** The share of deeper rooms whose look takes in the hands, and that glance. */
const HANDS_CHANCE = 0.5;
const GLANCE_CHANCE = 0.5;

/**
 * The look each holed room's pill sets off under `seed`: floor 1's is
 * `FIRST_LOOK`; a deeper room rolls its own, shorter, and often no look at all.
 */
export function looks(seed: string): (room: Room) => Look {
  const rolled = rollWith(Looks, pathHash(seed));
  return ({ n, x, y }) => {
    if (n === 1) return FIRST_LOOK;
    const { handsChance, hands, glanceChance, glance, turn, side } =
      rolled.room.at({
        n,
        x,
        y,
      });
    return {
      hands: handsChance < HANDS_CHANCE ? hands : 0,
      glance: glanceChance < GLANCE_CHANCE ? glance : 0,
      turn: turn === 1,
      side: side === 1 ? 1 : -1,
      moment: 'shrink',
      sayAt: LEAD,
    };
  };
}

/** Seconds into the shrink for which `look` holds the gaze. */
export const spanOf = ({ hands, glance }: Look): number =>
  hands + glance > 0 ? LEAD + hands + glance : 0;

/**
 * A look `t` seconds into the shrink: `aside` radians off where the eyes were,
 * `toHands` of the way from their elevation to the hands, the hands `handsUp` of
 * the way into sight and `turned` of the way over. All four are 0 at 0 and
 * from `spanOf` on, bar `turned`, which nobody sees by then.
 */
export type Glimpse = {
  aside: number;
  toHands: number;
  handsUp: number;
  turned: number;
};

export function glimpse(
  { hands, glance, turn, side }: Look,
  t: number,
): Glimpse {
  const from = LEAD;
  const to = LEAD + hands;
  const looking = hands > 0;
  const turnAt = from + hands * 0.45;
  return {
    aside:
      glance > 0
        ? side * AROUND * Math.sin(2 * Math.PI * rise(t, to, to + glance))
        : 0,
    toHands: looking
      ? hump(t, [from, from + DROP_GAZE, to - DROP_GAZE, to])
      : 0,
    handsUp: looking
      ? hump(t, [from + 0.25, from + 0.85, to - 0.75, to - 0.15])
      : 0,
    turned: looking && turn ? rise(t, turnAt, turnAt + TURN_OVER) : 0,
  };
}

/** The gaze a glimpse leaves of one resting at `yaw` and `elevation`. */
export const gazeOf = (
  { aside, toHands }: Glimpse,
  yaw: number,
  elevation: number,
): { yaw: number; elevation: number } => ({
  yaw: yaw + aside,
  elevation: elevation + (HANDS_ELEVATION - elevation) * toHands,
});
