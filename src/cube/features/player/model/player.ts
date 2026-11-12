import type { Ground, Limb } from '@/cube/shared/lib/acoustics';
import type {
  InRoom,
  Pose,
  Posed,
  Quarter,
  Shelf,
  Taken,
} from '@/cube/entities/world';

import type { Looking, ShrinkMoment } from './look';
import type { Input } from './step';

/** A holed room's hole and shelf, and the look its pill sets off. */
export type Holed = Looking & { quarter: Quarter; shelf: Shelf };

/**
 * One thing that happened to the body in a frame, for whoever makes its
 * sounds and speaks for it. A `step` is a footfall, its `strength` from 0 to 1
 * a run's, on the floor's own footing unless it names the island's `ground`;
 * `pill` is the pill leaving its shelf or coming back to it; a `landing`'s
 * `speed` is in the room sides a second of the floor landed on; a `rung` is a
 * `limb` coming down on the ladder; a `splash` is the body entering or moving
 * through water, its `strength` from 0 (a hand trailed) to 1 (falling in);
 * `say` is a moment the body has something to say about.
 */
export type Cue =
  | { cue: 'step'; strength: number; ground?: Ground }
  | { cue: 'pill' }
  | { cue: 'swallow' }
  | { cue: 'rung'; limb: Limb }
  | { cue: 'splash'; strength: number }
  | { cue: 'shrink' }
  | { cue: 'jump' }
  | { cue: 'landing'; speed: number }
  | { cue: 'say'; moment: ShrinkMoment | 'landing' | 'waking' };

/** Where a gaze rests while something else has the eyes. */
export type Gaze = { yaw: number; elevation: number };

/** Where a taking hand is, or is on its way to or from. */
export type Station = 'down' | 'shelf' | 'eyes' | 'mouth';

/**
 * A body taking its room's pill: `reaching` for it on the `shelf`; on floor 1
 * `inspecting` it before the eyes until answered; `drinking` it, or
 * `returning` it to the shelf, the hand coming `from` the shelf or the eyes
 * with the `twist` it had there. `aim` is the gaze that looks at the pill on
 * its shelf.
 */
export type Taking = Looking &
  Gaze & {
    act: 'taking';
    stage: 'reaching' | 'inspecting' | 'drinking' | 'returning';
    shelf: Shelf;
    aim: Gaze;
    from: Station;
    twist: number;
  };

/**
 * What the body is in the middle of, for `actFor` seconds: `taking` its
 * room's pill; `shrinking` where it stood when it swallowed, its gaze resting
 * at `yaw` and `elevation` under whatever the look does with it; `falling`
 * from `from` into the shaft at `to`; or `landing`, its knees giving, on the
 * floor below.
 */
export type Act = { actFor: number } & (
  | Taking
  | (Looking & Gaze & { act: 'shrinking' })
  | { act: 'falling'; from: InRoom; to: InRoom }
  | { act: 'landing' }
);

/**
 * The body and what it is up to. `act` is null while it stands or walks,
 * whole or shrunk, which its pose's scale tells apart; `pill` is the one off
 * its shelf, in the hand or swallowed, until the body lands; `strode` is how
 * far it has walked since its last footfall, in its own room sides; `cues` is
 * what happened in the frame that made this player.
 */
export type Player = Posed & {
  act: Act | null;
  pill: Taken | null;
  strode: number;
  cues: readonly Cue[];
};

export type Acting<A extends Act['act']> = Player & {
  act: Act & { act: A };
};

export const NO_CUES: readonly Cue[] = [];

/** A body standing at `pose` with nothing going on. */
export const standingAt = (pose: Pose): Player => ({
  pose,
  act: null,
  pill: null,
  strode: 0,
  cues: NO_CUES,
});

/** Whether `player` stands or walks, rather than takes, shrinks, falls or lands. */
export const isStanding = ({ act }: Player): boolean => act === null;

/** The pill `player` has off its shelf; null from the floor below on. */
export const takenOf = ({ pill }: Player): Taken | null => pill;

export const noWalk = (input: Input): Input => ({
  ...input,
  walk: 0,
  strafe: 0,
});
