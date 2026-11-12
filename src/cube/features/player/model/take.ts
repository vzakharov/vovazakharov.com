import { pillOn, type Pose, type Shelf } from '@/cube/entities/world';

import { hump, rise } from './ease';
import {
  type Acting,
  type Cue,
  type Gaze,
  type Holed,
  NO_CUES,
  type Player,
  type Station,
  type Taking,
} from './player';
import type { Input } from './step';

/**
 * How far from the body's middle its pill can be taken, in room sides: an
 * arm's length, 1 m on floor 1.
 */
export const PILL_REACH = 0.2;

/** How far off the gaze, in radians, a pill may lie and still be taken: 60°. */
const TAKE_GAZE = Math.PI / 3;

/** The yaw from `pose` to `shelf`'s pill, and how far off it is across the floor. */
function bearing(pose: Pose, shelf: Shelf) {
  const [u, , v] = pillOn(shelf).centre;
  const [du, dv] = [u - pose.u, v - pose.v];
  return { yaw: Math.atan2(dv, du), away: Math.hypot(du, dv) };
}

/** `angle` as the same turn in `(-π, π]`. */
const turnOf = (angle: number): number =>
  angle - 2 * Math.PI * Math.round(angle / (2 * Math.PI));

/**
 * Whether a body at `pose`, in `shelf`'s room, can take its pill: whole,
 * within reach and looking its way, the elevation aside.
 */
export function canTake(pose: Pose, shelf: Shelf): boolean {
  const { yaw, away } = bearing(pose, shelf);
  return (
    pose.scale >= 1 &&
    away <= PILL_REACH &&
    Math.abs(turnOf(yaw - pose.yaw)) <= TAKE_GAZE
  );
}

/** The floor whose pill is looked at before it is swallowed. */
const INSPECTED_FLOOR = 1;

/** Seconds the hand takes to reach the shelf and close on the pill. */
export const REACH_TIME = 0.5;
/** Seconds the hand takes to bring the pill before the eyes. */
export const RAISE_TIME = 0.7;
/** Seconds the pill takes to the mouth, from before the eyes and from the shelf. */
const TO_MOUTH = { eyes: 0.55, shelf: 0.75 };
/** Seconds after the swallow before the shrink sets in. */
const GULP_TIME = 0.6;
/** Seconds the pill takes back to its shelf, and the hand to come away. */
const PUT_BACK = 0.55;
const COME_AWAY = 0.45;

/** How far the wrist turns the pill each way, and how long a turn there and back takes. */
const TWIST = 0.75;
const TWIST_PERIOD = 2.6;

/** Where the eyes rest on a pill held before them, in radians under the horizon. */
const EYES_ELEVATION = -0.1;
/** How far the head goes back to swallow. */
const HEAD_BACK = 0.28;

/** When a `drinking` hand that came `from` there has the pill at the mouth. */
const swallowAt = (from: Station): number =>
  from === 'eyes' ? TO_MOUTH.eyes : TO_MOUTH.shelf;

/**
 * A taking hand at an instant: `share` of the way from one station to the
 * next, its thumb and forefinger `pinch` of the way shut, turned `twist`
 * radians about its own length, and whether the pill is in it.
 */
export type Grasp = {
  from: Station;
  to: Station;
  share: number;
  pinch: number;
  twist: number;
  holds: boolean;
};

/** How far the pill before the eyes is turned, `t` seconds into `inspecting`. */
const twistAt = (t: number): number =>
  TWIST * Math.sin((2 * Math.PI * Math.max(t - RAISE_TIME, 0)) / TWIST_PERIOD);

/** What the hand of a body `taking` is doing. */
export function graspOf({ stage, actFor: t, from, twist }: Taking & {
  actFor: number;
}): Grasp {
  if (stage === 'reaching') {
    return {
      from: 'down',
      to: 'shelf',
      share: rise(t, 0, REACH_TIME * 0.8),
      pinch: rise(t, REACH_TIME * 0.6, REACH_TIME),
      twist: 0,
      holds: false,
    };
  }
  if (stage === 'inspecting') {
    return {
      from: 'shelf',
      to: 'eyes',
      share: rise(t, 0, RAISE_TIME),
      pinch: 1,
      twist: twistAt(t),
      holds: true,
    };
  }
  const leaves = stage === 'drinking' ? swallowAt(from) : PUT_BACK;
  const to = stage === 'drinking' ? 'mouth' : 'shelf';
  if (t < leaves) {
    return {
      from,
      to,
      share: rise(t, 0, leaves),
      pinch: 1,
      twist: twist * (1 - rise(t, 0, leaves * 0.6)),
      holds: true,
    };
  }
  return {
    from: to,
    to: 'down',
    share: rise(t, leaves + 0.05, leaves + COME_AWAY),
    pinch: 1 - rise(t, leaves, leaves + 0.15),
    twist: 0,
    holds: false,
  };
}

const mixed = (a: Gaze, b: Gaze, share: number): Gaze => ({
  yaw: a.yaw + (b.yaw - a.yaw) * share,
  elevation: a.elevation + (b.elevation - a.elevation) * share,
});

/** Where a body `taking` looks: at the pill, wherever it is, then back. */
export function gazeOfTaking(act: Taking & { actFor: number }): Gaze {
  const { stage, actFor: t, aim, from, yaw, elevation } = act;
  const resting = { yaw, elevation };
  const eyes = { yaw: aim.yaw, elevation: EYES_ELEVATION };
  if (stage === 'reaching') return mixed(resting, aim, rise(t, 0, 0.4));
  if (stage === 'inspecting') return mixed(aim, eyes, rise(t, 0.05, RAISE_TIME));
  if (stage === 'drinking') {
    const at = swallowAt(from);
    const back = mixed(from === 'eyes' ? eyes : aim, resting, rise(t, 0, at));
    const tilt = hump(t, [at - 0.2, at + 0.05, at + 0.25, at + GULP_TIME]);
    return { ...back, elevation: back.elevation + HEAD_BACK * tilt };
  }
  return t < PUT_BACK
    ? mixed(eyes, aim, rise(t, 0, PUT_BACK * 0.8))
    : mixed(aim, resting, rise(t, PUT_BACK + 0.05, PUT_BACK + COME_AWAY));
}

/** Whether `player` holds its pill before its eyes, waiting to be told what to do with it. */
export const isAsking = ({ act }: Player): boolean =>
  act?.act === 'taking' &&
  act.stage === 'inspecting' &&
  act.actFor >= RAISE_TIME;

/** The `player` reaching for the pill of `here`, its room, from a standstill. */
export function reachFor(
  player: Player,
  { shelf, shrinkLook }: Holed,
): Acting<'taking'> {
  const { pose } = player;
  const { yaw, elevation } = pose;
  const { centre } = pillOn(shelf);
  const to = bearing(pose, shelf);
  return {
    ...player,
    act: {
      act: 'taking',
      stage: 'reaching',
      actFor: 0,
      shelf,
      shrinkLook,
      yaw,
      elevation,
      aim: {
        yaw: yaw + turnOf(to.yaw - yaw),
        elevation: Math.atan2(centre[1] - pose.eyeAbove, to.away),
      },
      from: 'down',
      twist: 0,
    },
    cues: NO_CUES,
  };
}

/** `act` in its next `stage`, the hand coming `from` there. */
const staged = (
  act: Acting<'taking'>['act'],
  stage: Taking['stage'],
  from: Station,
): Acting<'taking'>['act'] => ({
  ...act,
  stage,
  from,
  actFor: 0,
  twist: graspOf(act).twist,
});

/**
 * A body taking its pill, `dt` seconds on, its feet rooted and its gaze the
 * act's. The hand closes on the pill at `REACH_TIME`; on floor 1 it then holds
 * it before the eyes until `input` answers, anywhere else it goes straight to
 * the mouth. A swallowed pill starts the shrink; one put down leaves the body
 * standing as it stood.
 */
export function taking(
  player: Acting<'taking'>,
  input: Input,
  dt: number,
): Player {
  const { pose, act } = player;
  const { n, x, y } = pose;
  const t = act.actFor + dt;
  const { stage, from, shrinkLook, yaw, elevation } = act;
  const resting = { yaw, elevation };
  let next: Acting<'taking'>['act'] = { ...act, actFor: t };
  let { pill } = player;
  let cues: readonly Cue[] = NO_CUES;
  if (stage === 'reaching' && t >= REACH_TIME) {
    next =
      n === INSPECTED_FLOOR
        ? staged(act, 'inspecting', 'shelf')
        : staged(act, 'drinking', 'shelf');
    pill = { room: { n, x, y } };
    cues = [{ cue: 'pill' }];
  } else if (stage === 'inspecting' && t >= RAISE_TIME && input.answer) {
    next = staged(
      { ...act, actFor: t },
      input.answer === 'yes' ? 'drinking' : 'returning',
      'eyes',
    );
  } else if (stage === 'drinking') {
    const at = swallowAt(from);
    if (act.actFor < at && t >= at) cues = [{ cue: 'swallow' }];
    if (t >= at + GULP_TIME) {
      return {
        ...player,
        pose: { ...pose, ...resting },
        act: { act: 'shrinking', actFor: 0, shrinkLook, ...resting },
        cues: [{ cue: 'shrink' }],
      };
    }
  } else if (stage === 'returning') {
    if (act.actFor < PUT_BACK && t >= PUT_BACK) {
      pill = null;
      cues = [{ cue: 'pill' }];
    }
    if (t >= PUT_BACK + COME_AWAY) {
      return { ...player, pose: { ...pose, ...resting }, act: null, pill, cues };
    }
  }
  return {
    ...player,
    pose: { ...pose, ...gazeOfTaking(next) },
    act: next,
    pill,
    cues,
  };
}
