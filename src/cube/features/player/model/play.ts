import { pick } from '@/kernel/shared/lib/collections';

import type { Ground, Limb } from '@/cube/shared/lib/acoustics';
import {
  DEEPEST_FLOOR,
  descend,
  type InRoom,
  type Lever,
  type Pose,
  type Posed,
  type Pulled,
  type Quarter,
  type Walls,
} from '@/cube/entities/world';

import {
  dipAt,
  feetAt,
  hopAt,
  intoShaft,
  LAND_AT,
  LAND_SPEED,
  LANDING_TIME,
  onHole,
} from './fall';
import {
  gazeOf,
  glimpse,
  type Looking,
  type ShrinkMoment,
  spanOf,
} from './look';
import { LEVER_REACH, scaleAt, SHRINK_TIME, SMALL, swungAt } from './shrink';
import { EYE_HEIGHT, type Input, RUN_SPEED, step } from './step';

/** A holed room's hole and lever, and the look its lever sets off. */
export type Holed = Looking & { quarter: Quarter; lever: Lever };

/**
 * One thing that happened to the body in a frame, for whoever makes its
 * sounds and speaks for it. A `step` is a footfall, its `strength` from 0 to 1
 * a run's, on the floor's own footing unless it names the island's `ground`;
 * a `landing`'s `speed` is in the room sides a second of the floor landed on;
 * a `rung` is a `limb` coming down on the ladder; a `splash` is the body
 * entering or moving through water, its `strength` from 0 (a hand trailed) to
 * 1 (falling in); `say` is a moment the body has something to say about.
 */
export type Cue =
  | { cue: 'step'; strength: number; ground?: Ground }
  | { cue: 'lever' }
  | { cue: 'pill' }
  | { cue: 'swallow' }
  | { cue: 'rung'; limb: Limb }
  | { cue: 'splash'; strength: number }
  | { cue: 'shrink' }
  | { cue: 'jump' }
  | { cue: 'landing'; speed: number }
  | { cue: 'say'; moment: ShrinkMoment | 'landing' | 'waking' };

/**
 * What the body is in the middle of, for `actFor` seconds: `shrinking` where
 * it stood when it pulled, its gaze resting at `yaw` and `elevation` under
 * whatever the look does with it; `falling` from `from` into the shaft at
 * `to`; or `landing`, its knees giving, on the floor below.
 */
type Act = { actFor: number } & (
  | (Looking & { act: 'shrinking'; yaw: number; elevation: number })
  | { act: 'falling'; from: InRoom; to: InRoom }
  | { act: 'landing' }
);

/**
 * The body and what it is up to. `act` is null while it stands or walks,
 * whole or shrunk, which its pose's scale tells apart; `lever` is the one
 * that shrank it, until it lands, and `sincePull` the seconds since; `strode`
 * is how far it has walked since its last footfall, in its own room sides;
 * `cues` is what happened in the frame that made this player.
 */
export type Player = Posed & {
  act: Act | null;
  lever: Pulled | null;
  sincePull: number;
  strode: number;
  cues: readonly Cue[];
};

const NO_CUES: readonly Cue[] = [];

/** A body standing at `pose` with nothing going on. */
export const standingAt = (pose: Pose): Player => ({
  pose,
  act: null,
  lever: null,
  sincePull: 0,
  strode: 0,
  cues: NO_CUES,
});

/** Whether `player` stands or walks, rather than shrinks, falls or lands. */
export const isStanding = ({ act }: Player): boolean => act === null;

/**
 * The lever `player` pulled and how far its handle has swung; null from the
 * floor below on, as before any pull.
 */
export const pulledOf = ({ lever }: Player): Pulled | null => lever;

/** `player`'s lever `dt` seconds on: swinging down, then held there. */
function swinging({ lever, sincePull }: Player, dt: number) {
  const t = sincePull + dt;
  return { lever: lever && { ...lever, swung: swungAt(t) }, sincePull: t };
}

/**
 * A whole body arriving on floor `n` by no hole: in the middle of its
 * north-west room, looking east.
 */
export const arrivedOn = (n: number): Pose => ({
  n,
  x: 0n,
  y: 0n,
  u: 0.5,
  v: 0.5,
  eyeAbove: EYE_HEIGHT,
  scale: 1,
  yaw: 0,
  elevation: 0,
});

/** How far a body walks between footfalls, in its own room sides: 75 cm. */
const STRIDE = 0.15;

/** `pose` standing on the floor below, straight under where it stood, as a body of that floor. */
const below = (pose: Pose): Pose => ({
  ...descend(pose),
  scale: 1,
  eyeAbove: EYE_HEIGHT,
});

const noWalk = (input: Input): Input => ({ ...input, walk: 0, strafe: 0 });

type Acting<A extends Act['act']> = Player & { act: Act & { act: A } };

function shrink(
  player: Acting<'shrinking'>,
  input: Input,
  dt: number,
  walls: Walls,
): Player {
  const { pose, act } = player;
  const { shrinkLook: look, actFor, yaw, elevation } = act;
  const t = actFor + dt;
  const span = spanOf(look);
  // The frame the look lets go on starts from the resting gaze, so no trace
  // of the look is left in it.
  const from = actFor < span ? { ...pose, yaw, elevation } : pose;
  const free = step(from, noWalk(input), dt, walls);
  const gaze =
    t < span
      ? gazeOf(glimpse(look, t), yaw, elevation)
      : pick(free, 'yaw', 'elevation');
  const { sayAt, moment } = look;
  const scale = scaleAt(t);
  const done = t >= Math.max(SHRINK_TIME, span);
  return {
    ...player,
    pose: {
      ...pose,
      ...gaze,
      scale,
      eyeAbove: EYE_HEIGHT * scale,
    },
    act: done ? null : { ...act, actFor: t },
    ...swinging(player, dt),
    cues: actFor < sayAt && t >= sayAt ? [{ cue: 'say', moment }] : NO_CUES,
  };
}

function fall(
  player: Acting<'falling'>,
  input: Input,
  dt: number,
  walls: Walls,
): Player {
  const { pose, act } = player;
  const t = act.actFor + dt;
  const turned = step(pose, noWalk(input), dt, walls);
  if (t >= LAND_AT) {
    return {
      ...standingAt(below({ ...turned, ...act.to })),
      act: { act: 'landing', actFor: 0 },
      cues: [
        { cue: 'landing', speed: LAND_SPEED / SMALL },
        { cue: 'say', moment: 'landing' },
      ],
    };
  }
  return {
    ...player,
    pose: {
      ...turned,
      ...hopAt(act.from, act.to, t),
      eyeAbove: feetAt(t) + EYE_HEIGHT * pose.scale,
    },
    act: { ...act, actFor: t },
    cues: NO_CUES,
  };
}

/** How far `to` is from `from`, in `from`'s room sides, across rooms. */
const walked = (from: Pose, to: Pose): number =>
  Math.hypot(
    Number(to.x - from.x) + to.u - from.u,
    Number(to.y - from.y) + to.v - from.v,
  );

/** A body on its feet `dt` seconds on: walking, its footfalls, a hop into a hole. */
function walk(
  player: Player,
  input: Input,
  dt: number,
  walls: Walls,
  here: Holed | null,
): Player {
  const { pose, act } = player;
  const stepped = step(pose, input, dt, walls);
  const t = (act?.actFor ?? 0) + dt;
  const landing = act !== null && t < LANDING_TIME;
  const moved: Pose = landing
    ? { ...stepped, eyeAbove: EYE_HEIGHT * (1 - dipAt(t)) }
    : stepped;
  const went = walked(pose, moved) / pose.scale;
  const strode = player.strode + went;
  const footfall = strode >= STRIDE && dt > 0;
  const steps: readonly Cue[] = footfall
    ? [{ cue: 'step', strength: Math.min(1, went / dt / RUN_SPEED) }]
    : NO_CUES;
  const walking = {
    pose: moved,
    ...swinging(player, dt),
    strode: footfall ? strode % STRIDE : strode,
  };
  if (landing) {
    return { ...walking, act: { act: 'landing', actFor: t }, cues: steps };
  }
  if (moved.scale < 1 && here !== null && onHole(moved, here.quarter)) {
    const from = pick(moved, 'u', 'v');
    return {
      ...walking,
      act: {
        act: 'falling',
        actFor: 0,
        from,
        to: intoShaft(from, here.quarter),
      },
      cues: [...steps, { cue: 'jump' }],
    };
  }
  return { ...walking, act: null, cues: steps };
}

/** Whether a whole body at `pose` reaches `lever`. */
const canPull = (pose: Pose, { at }: Lever): boolean =>
  pose.scale >= 1 && Math.hypot(pose.u - at.u, pose.v - at.v) <= LEVER_REACH;

/**
 * `player` after `dt` seconds of `input` among `walls`, `here` being its
 * room's hole and lever (null where it has none, or none known yet).
 *
 * A whole body pulling a lever in reach shrinks where it stands, to `SMALL`
 * over `SHRINK_TIME`, its feet rooted and its gaze the look's while that
 * lasts. Shrunk, it walks its floor at its own size; walking onto any hole it
 * hops in, falls `DROP` and lands a whole body of the floor below, its knees
 * giving for `LANDING_TIME`. A whole body walks over a hole. A standing body
 * that asks to go to a floor the cube has arrives on it that same frame, as
 * `arrivedOn` has it, keeping its gaze.
 */
export function play(
  player: Player,
  input: Input,
  dt: number,
  walls: Walls,
  here: Holed | null,
): Player {
  const { pose, act } = player;
  if (act?.act === 'shrinking') {
    return shrink({ ...player, act }, input, dt, walls);
  }
  if (act?.act === 'falling') return fall({ ...player, act }, input, dt, walls);
  if (
    act === null &&
    input.goTo !== null &&
    input.goTo >= 1 &&
    input.goTo <= DEEPEST_FLOOR
  ) {
    return standingAt({
      ...arrivedOn(input.goTo),
      ...pick(pose, 'yaw', 'elevation'),
    });
  }
  if (act === null && input.pull && here && canPull(pose, here.lever)) {
    const { n, x, y, yaw, elevation } = pose;
    const { shrinkLook } = here;
    const pulled = shrink(
      {
        ...player,
        act: { act: 'shrinking', actFor: 0, shrinkLook, yaw, elevation },
        lever: { room: { n, x, y }, swung: 0 },
        sincePull: 0,
      },
      input,
      dt,
      walls,
    );
    return {
      ...pulled,
      cues: [{ cue: 'lever' }, { cue: 'shrink' }, ...pulled.cues],
    };
  }
  return walk(player, input, dt, walls, here);
}
