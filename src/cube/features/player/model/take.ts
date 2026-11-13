import { nearestTurn, shortTurn } from '@/cube/shared/lib/turn';
import {
  dot,
  type Gazing,
  minus,
  pillOn,
  type Pose,
  type Shelf,
  unit,
} from '@/cube/entities/world';

import { hump, rise } from './ease';
import {
  type Acting,
  type Carrying,
  type Cue,
  type Holed,
  NO_CUES,
  type Player,
  type Station,
  type Taking,
} from './player';
import type { Input } from './step';
import { viewOf } from './view';

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

/**
 * Whether a body at `pose`, in `shelf`'s room, can take its pill: whole,
 * within reach and looking its way, the elevation aside.
 */
export function canTake(pose: Pose, shelf: Shelf): boolean {
  const { yaw, away } = bearing(pose, shelf);
  return (
    pose.scale >= 1 &&
    away <= PILL_REACH &&
    Math.abs(shortTurn(yaw - pose.yaw)) <= TAKE_GAZE
  );
}

/**
 * How far off the gaze, in radians, a shelf must be to be out of the eye's
 * sight, wherever in the frame it would fall: past the frame's corner.
 */
const OUT_OF_SIGHT = 1.25;

/** Whether an eye at `pose` can have `shelf`'s pill anywhere in its frame. */
export function isInSight(pose: Pose, shelf: Shelf): boolean {
  const { eye, ahead } = viewOf(pose);
  const to = unit(minus(pillOn(shelf).centre, eye));
  return dot(ahead, to) > Math.cos(OUT_OF_SIGHT);
}

/** The floor whose pill is looked at before it is swallowed. */
const INSPECTED_FLOOR = 1;

/** Seconds the hand takes to reach the shelf and close on the pill. */
export const REACH_TIME = 0.5;
/** Seconds the hand takes to bring the pill before the eyes, to look at and in passing. */
const RAISE_TIME = { asked: 0.7, passing: 0.45 };
/** Seconds the pill takes from before the eyes to the mouth. */
const TO_MOUTH = 0.5;
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

/** Seconds a taking body's hand takes to bring the pill before its eyes. */
const raiseOf = ({ asks }: Taking): number =>
  asks ? RAISE_TIME.asked : RAISE_TIME.passing;

/**
 * A taking hand at an instant: `gone` of the way to the station it is headed
 * `to`, its thumb and forefinger `pinch` of the way shut, and whether the
 * pill is in it.
 */
export type Grasp = Carrying & {
  to: Station;
  gone: number;
  pinch: number;
  holds: boolean;
};

/** How far a pill is turned, `held` seconds after it came before the eyes. */
const twistAt = (held: number): number =>
  TWIST * Math.sin((2 * Math.PI * Math.max(held, 0)) / TWIST_PERIOD);

/** What the hand of a body `taking` is doing. */
export function graspOf(act: Taking & { actFor: number }): Grasp {
  const { stage, actFor: t, from, wristTurn } = act;
  if (stage === 'reaching') {
    return {
      from: 'down',
      to: 'shelf',
      gone: rise(t, 0, REACH_TIME * 0.8),
      pinch: rise(t, REACH_TIME * 0.6, REACH_TIME),
      wristTurn: 0,
      holds: false,
    };
  }
  if (stage === 'inspecting') {
    return {
      from: 'shelf',
      to: 'eyes',
      gone: rise(t, 0, raiseOf(act)),
      pinch: 1,
      wristTurn: twistAt(t - raiseOf(act)),
      holds: true,
    };
  }
  const leaves = stage === 'swallowing' ? TO_MOUTH : PUT_BACK;
  const to = stage === 'swallowing' ? 'mouth' : 'shelf';
  if (t < leaves) {
    return {
      from,
      to,
      gone: rise(t, 0, leaves),
      pinch: 1,
      wristTurn: wristTurn * (1 - rise(t, 0, leaves * 0.6)),
      holds: true,
    };
  }
  return {
    from: to,
    to: 'down',
    gone: rise(t, leaves + 0.05, leaves + COME_AWAY),
    pinch: 1 - rise(t, leaves, leaves + 0.15),
    wristTurn: 0,
    holds: false,
  };
}

const mixed = (a: Gazing, b: Gazing, share: number): Gazing => ({
  yaw: a.yaw + (b.yaw - a.yaw) * share,
  elevation: a.elevation + (b.elevation - a.elevation) * share,
});

/** Where a body `taking` looks: at the pill, wherever it is, then back. */
export function gazeOfTaking(act: Taking & { actFor: number }): Gazing {
  const { stage, actFor: t, aim, yaw, elevation } = act;
  const resting = { yaw, elevation };
  const eyes = { ...aim, elevation: EYES_ELEVATION };
  if (stage === 'reaching') return mixed(resting, aim, rise(t, 0, 0.4));
  if (stage === 'inspecting') {
    return mixed(aim, eyes, rise(t, 0.05, raiseOf(act)));
  }
  if (stage === 'swallowing') {
    const back = mixed(eyes, resting, rise(t, 0, TO_MOUTH));
    const tilt = hump(t, [
      TO_MOUTH - 0.2,
      TO_MOUTH + 0.05,
      TO_MOUTH + 0.25,
      TO_MOUTH + GULP_TIME,
    ]);
    return { ...back, elevation: back.elevation + HEAD_BACK * tilt };
  }
  return t < PUT_BACK
    ? mixed(eyes, aim, rise(t, 0, PUT_BACK * 0.8))
    : mixed(aim, resting, rise(t, PUT_BACK + 0.05, PUT_BACK + COME_AWAY));
}

/** Whether `player` holds its pill before its eyes, waiting to be told what to do with it. */
export const isAsking = ({ act }: Player): boolean =>
  act?.act === 'taking' &&
  act.asks &&
  act.stage === 'inspecting' &&
  act.actFor >= RAISE_TIME.asked;

/** The `player` reaching for the pill of `here`, its room, from a standstill. */
export function reachFor(player: Player, here: Holed): Acting<'taking'> {
  const { pose } = player;
  const { n, yaw, elevation, eyeAbove } = pose;
  const [, pillAbove] = pillOn(here.shelf).centre;
  const to = bearing(pose, here.shelf);
  return {
    ...player,
    act: {
      act: 'taking',
      stage: 'reaching',
      actFor: 0,
      asks: n === INSPECTED_FLOOR,
      ...here,
      yaw,
      elevation,
      aim: {
        yaw: nearestTurn(yaw, to.yaw),
        elevation: Math.atan2(pillAbove - eyeAbove, to.away),
      },
      from: 'down',
      wristTurn: 0,
    },
    cues: NO_CUES,
  };
}

/** `act` in its next `stage`, the hand coming `from` there. */
const staged = (
  act: Acting<'taking'>['act'],
  stage: Taking['stage'],
  from: Station,
): Acting<'taking'>['act'] => {
  const { wristTurn } = graspOf(act);
  return { ...act, stage, from, actFor: 0, wristTurn };
};

/**
 * A body taking its pill, `dt` seconds on, its feet rooted and its gaze the
 * act's. The hand closes on the pill at `REACH_TIME` and brings it before the
 * eyes; on floor 1 it holds it there until `input` answers, anywhere else it
 * goes on to the mouth. A swallowed pill starts the shrink; one put down
 * leaves the body standing as it stood.
 */
export function taking(
  player: Acting<'taking'>,
  input: Input,
  dt: number,
): Player {
  const { pose, act } = player;
  const { n, x, y } = pose;
  const { stage, asks, actFor: before, shrinkLook, yaw, elevation } = act;
  const t = before + dt;
  const resting = { yaw, elevation };
  let next: Acting<'taking'>['act'] = { ...act, actFor: t };
  let { pill } = player;
  let cues: readonly Cue[] = NO_CUES;
  if (stage === 'reaching' && t >= REACH_TIME) {
    next = staged(act, 'inspecting', 'shelf');
    pill = { room: { n, x, y } };
    cues = [{ cue: 'pill' }];
  } else if (stage === 'inspecting' && t >= raiseOf(act)) {
    const answer = asks ? input.answer : 'yes';
    if (answer !== null) {
      next = staged(
        { ...act, actFor: t },
        answer === 'yes' ? 'swallowing' : 'returning',
        'eyes',
      );
    }
  } else if (stage === 'swallowing') {
    if (before < TO_MOUTH && t >= TO_MOUTH) cues = [{ cue: 'swallow' }];
    if (t >= TO_MOUTH + GULP_TIME) {
      return {
        ...player,
        pose: { ...pose, ...resting },
        act: { act: 'shrinking', actFor: 0, shrinkLook, ...resting },
        cues: [{ cue: 'shrink' }],
      };
    }
  } else if (stage === 'returning') {
    if (before < PUT_BACK && t >= PUT_BACK) {
      pill = null;
      cues = [{ cue: 'pill' }];
    }
    if (t >= PUT_BACK + COME_AWAY) {
      return {
        ...player,
        pose: { ...pose, ...resting },
        act: null,
        pill,
        cues,
      };
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
