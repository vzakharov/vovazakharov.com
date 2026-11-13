import { pick } from '@/kernel/shared/lib/collections';

import {
  DEEPEST_FLOOR,
  descend,
  type Pose,
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
import { gazeOf, glimpse, spanOf } from './look';
import {
  type Acting,
  type Cue,
  type Holed,
  NO_CUES,
  noWalk,
  type Player,
  standingAt,
} from './player';
import { scaleAt, SHRINK_TIME, SMALL } from './shrink';
import { EYE_HEIGHT, type Input, RUN_SPEED, step } from './step';
import { canTake, isInSight, reachFor, taking } from './take';

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
    ...player,
    pose: moved,
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

function played(
  player: Player,
  input: Input,
  dt: number,
  walls: Walls,
  here: Holed | null,
): Player {
  const { pose, act } = player;
  if (act?.act === 'taking') return taking({ ...player, act }, input, dt);
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
  if (act === null && input.use && here && canTake(pose, here.shelf)) {
    return taking(reachFor(player, here), input, dt);
  }
  return walk(player, input, dt, walls, here);
}

/**
 * `player` with its pill back on its shelf once it has swallowed it and the
 * shelf, `here`'s, is out of its sight: the world keeps a pill for whoever
 * comes next, and it never appears before an eye that is looking.
 */
function restocked(player: Player, here: Holed | null): Player {
  const { pose, act, pill } = player;
  if (pill === null || act?.act === 'taking') return player;
  return here !== null && isInSight(pose, here.shelf)
    ? player
    : { ...player, pill: null };
}

/**
 * `player` after `dt` seconds of `input` among `walls`, `here` being its
 * room's hole and shelf (null where it has none, or none known yet).
 *
 * A whole body using a pill it can take reaches for it, and what follows is
 * `taking`'s; the pill swallowed, it shrinks where it stands, to `SMALL` over
 * `SHRINK_TIME`, its feet rooted and its gaze the look's while that lasts.
 * Its shelf has a pill again as soon as it looks away from it.
 * Shrunk, it walks its floor at its own size; walking onto any hole it hops
 * in, falls `DROP` and lands a whole body of the floor below, its knees
 * giving for `LANDING_TIME`. A whole body walks over a hole. A standing body
 * that asks to go to a floor the cube has arrives on it that same frame, as
 * `arrivedOn` has it, keeping its gaze.
 */
export const play = (
  player: Player,
  input: Input,
  dt: number,
  walls: Walls,
  here: Holed | null,
): Player => restocked(played(player, input, dt, walls, here), here);
