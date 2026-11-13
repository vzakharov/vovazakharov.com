import { pick } from '@/kernel/shared/lib/collections';

import type { Laddered } from '@/cube/shared/outside';

import type { Cue, Cued } from './play';
import {
  type Bearing,
  isAfloat,
  type Land,
  roam,
  type Roamer,
  roamingAt,
  type Seated,
  swingOf,
} from './roam';
import {
  climb,
  LADDER_REACH,
  outsideOf,
  shotOf,
  type Stage,
  stepOff,
  waking,
} from './scenes';
import type { Input } from './step';
import { cuesBetween, type Shot, shotAt, type Track } from './track';

/** A scene being played, `playedFor` seconds in, and where it leaves the body. */
type Playing = Seated & {
  track: Track<Cue>;
  playedFor: number;
  into: 'island' | 'cube';
};

/** What a body out of doors carries from scene to scene. */
type Mind = Required<Laddered> & { asleep: boolean };

/**
 * A body out of doors and what the eye shows of it this frame. `scene` is
 * the one that holds its controls, null while it roams free; `asleep` until
 * the first sign of the player, the waking scene waiting on its first
 * moment; `ladderGone` once it has been inside the cube, the ladder standing
 * for a body that has not; `entered` in the one frame a scene has put the
 * body inside the cube, where `shot` is where it stands.
 */
export type Abroad = Mind &
  Cued & {
    roamer: Roamer;
    scene: Playing | null;
    shot: Shot;
    entered: boolean;
  };

const NO_CUES: readonly Cue[] = [];

/** `scene` taking over a body last seen as `roamer`. */
const playing = (roamer: Roamer, scene: Playing, rest: Mind): Abroad => ({
  roamer,
  scene,
  ...rest,
  shot: shotAt(scene.track, scene.playedFor),
  cues: NO_CUES,
  entered: false,
});

/** A body asleep on `stage`'s shore, the waking scene ahead of it. */
export function asleepOn(stage: Stage, seconds: number): Abroad {
  const { land, wake } = stage;
  const roamer = roamingAt(
    land,
    wake.at,
    { yaw: wake.seaward, elevation: 0 },
    seconds,
  );
  return playing(
    roamer,
    {
      track: waking(stage),
      seat: { ...pick(wake, 'at'), lies: wake.seaward },
      playedFor: 0,
      into: 'island',
    },
    { asleep: true, ladderGone: false },
  );
}

/**
 * A body of `scale` leaving the cube from `from`, pressed to the doorway
 * inside: off the sill and down to the sand, where no ladder stands.
 */
export const steppingOut = (
  from: Shot,
  scale: number,
  stage: Stage,
  seconds: number,
): Abroad =>
  playing(
    roamingAt(
      stage.land,
      [from.x, from.z],
      pick(from, 'yaw', 'elevation'),
      seconds,
      scale,
    ),
    {
      track: stepOff(from, scale, stage),
      seat: null,
      playedFor: 0,
      into: 'island',
    },
    { asleep: false, ladderGone: true },
  );

/** `stage`'s land as a body meets it, the ladder in its way until it is gone. */
const landOf = ({ land, ladder }: Stage, ladderGone: boolean): Land =>
  ladderGone ? land : { ...land, solids: [...land.solids, ladder.solid] };

/**
 * Whether `abroad` stands free on the sand within reach of the foot of a
 * ladder that still stands.
 */
export function canClimb(
  { scene, roamer, ladderGone }: Abroad,
  { land, ladder }: Stage,
  seconds: number,
): boolean {
  const [x, , z] = roamer.eye;
  const [footX, , footZ] = ladder.foot;
  return (
    scene === null &&
    !ladderGone &&
    !isAfloat(land, roamer.eye, seconds, roamer.scale) &&
    Math.hypot(x - footX, z - footZ) <= LADDER_REACH
  );
}

/**
 * `abroad` after `dt` seconds of `input` on `stage`, `seconds` into the
 * hour, `woken` once the player has given a sign.
 *
 * A scene holds the controls while it plays and its cues fall in the frames
 * they are marked in; one that ends on the island hands the body back where
 * the camera left it, one that ends in the cube reports `entered`. Free, the
 * body roams, and asking for the ladder within reach of its foot climbs it.
 */
export function abroad(
  state: Abroad,
  input: Input,
  dt: number,
  seconds: number,
  stage: Stage,
  woken: boolean,
): Abroad {
  const { scene, roamer, ladderGone, asleep } = state;
  if (asleep && !woken) return { ...state, cues: NO_CUES };
  const rest = { asleep: false, ladderGone };
  if (scene !== null) {
    const { track, playedFor, into } = scene;
    const t = playedFor + dt;
    const shot = shotAt(track, t);
    const cues = cuesBetween(track, playedFor, t);
    const done = t >= track.runs;
    return {
      roamer: done
        ? {
            ...roamer,
            ...outsideOf(shot),
            strode: 0,
            paces: 0,
            stroke: 0,
            cues,
          }
        : roamer,
      scene: done ? null : { ...scene, playedFor: t },
      ...rest,
      shot,
      cues,
      entered: done && into === 'cube',
    };
  }
  const free = { ...state, ...rest, entered: false };
  if (input.pull && canClimb(free, stage, seconds)) {
    return playing(
      roamer,
      {
        track: climb(shotOf(roamer), stage),
        seat: null,
        playedFor: 0,
        into: 'cube',
      },
      rest,
    );
  }
  const moved = roam(roamer, input, dt, seconds, landOf(stage, ladderGone));
  const { cues } = moved;
  return { ...free, roamer: moved, shot: shotOf(moved), cues };
}

/** How `abroad` holds its body under its eye, null while its lids are shut. */
export function bearingOf(
  { shot, scene, roamer }: Abroad,
  { land }: Stage,
  seconds: number,
): Bearing | null {
  if (shot.lids <= 0) return null;
  const free = scene === null;
  const { scale, eye } = roamer;
  return {
    ...outsideOf(shot),
    scale,
    seat: scene?.seat ?? null,
    swing: free ? swingOf(roamer) : 0,
    afloat: free && isAfloat(land, eye, seconds, scale),
  };
}
