import type { Clock } from '@/cube/shared/lib/clock';
import type { Setting } from '@/cube/entities/world';

import { figure, mannequin } from './figures';
import { corner, door, unfolding } from './fixtures';
import { type HappeningKind, type Pace, PACES } from './kinds';
import { balloon, chairs } from './lingering';
import { ball, cat, paper } from './passing';
import { playing } from './schedule';
import { type Act, type Happening, NOTHING } from './staging';
import { hand, shadow } from './traces';
import { footsteps, knock, phone } from './unseen';

export const ACTS: Readonly<Record<HappeningKind, Act>> = {
  ball,
  paper,
  cat,
  phone,
  knock,
  footsteps,
  door,
  figure,
  shadow,
  hand,
  unfolding,
  corner,
  balloon,
  chairs,
  mannequin,
};

const PACE_NAMES = Object.keys(PACES).filter(
  (name): name is Pace => name in PACES,
);

const HOUR = 3600;

/** `clock`'s instant as seconds since the epoch. */
export const secondsAt = ({ hour, seconds }: Clock): number =>
  hour * HOUR + seconds;

/**
 * What goes on by itself in `setting`'s room on floor `n` at `clock`: the
 * quads of that instant in the room's frame and the sounds it is making. A
 * function of the room and the instant alone — never of who is there or
 * where they look — so everyone in a place at a moment gets one answer;
 * nearly always it is `NOTHING` itself.
 */
export function happening(
  setting: Setting,
  n: number,
  clock: Clock,
): Happening {
  const now = secondsAt(clock);
  const played = PACE_NAMES.flatMap((pace) => {
    const plan = playing(setting, n, pace, now);
    if (plan === null) return [];
    const { kind, sinceEpoch, lastsFor, chance } = plan;
    return [
      ACTS[kind]({
        setting,
        n,
        sinceEpoch,
        lastsFor,
        age: now - sinceEpoch,
        chance,
      }),
    ].filter((act) => act !== NOTHING);
  });
  const [only, ...others] = played;
  if (only === undefined) return NOTHING;
  if (others.length === 0) return only;
  return {
    quads: played.flatMap(({ quads }) => quads),
    sounds: played.flatMap(({ sounds }) => sounds),
  };
}
