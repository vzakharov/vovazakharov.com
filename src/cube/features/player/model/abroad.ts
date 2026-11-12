import type { Cue } from './play';
import { isAfloat, roam, type Roamer, roamingAt } from './roam';
import {
  climb,
  descent,
  farFrom,
  LADDER_REACH,
  LOOK_FROM,
  lookUnder,
  shotOf,
  type Stage,
  waking,
} from './scenes';
import type { Input } from './step';
import { cuesBetween, type Shot, shotAt, type Track } from './track';

/** A scene being played, `playedFor` seconds in, and where it leaves the body. */
type Playing = {
  track: Track<Cue>;
  playedFor: number;
  into: 'island' | 'cube';
};

/** What a body out of doors carries from scene to scene. */
type Mind = { asleep: boolean; lookedUnder: boolean };

/**
 * A body out of doors and what the eye shows of it this frame. `scene` is
 * the one that holds its controls, null while it roams free; `asleep` until
 * the first sign of the player, the waking scene waiting on its first
 * moment; `lookedUnder` once the look under the cube has been set off;
 * `entered` in the one frame a scene has put the body inside the cube, where
 * `shot` is where it stands.
 */
export type Abroad = Mind & {
  roamer: Roamer;
  scene: Playing | null;
  shot: Shot;
  cues: readonly Cue[];
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
    { track: waking(stage), playedFor: 0, into: 'island' },
    { asleep: true, lookedUnder: false },
  );
}

/**
 * A body leaving the cube from `from`, by the doorway inside: on its way
 * down the ladder. It has seen what holds the cube up from above.
 */
export const leaving = (from: Shot, stage: Stage, seconds: number): Abroad =>
  playing(
    roamingAt(
      stage.land,
      [stage.ladder.foot[0], stage.ladder.foot[2]],
      from,
      seconds,
    ),
    { track: descent(from, stage), playedFor: 0, into: 'island' },
    { asleep: false, lookedUnder: true },
  );

/** How near the arrival spot an eye inside reaches the doorway, in metres. */
const DOOR_REACH = 1.3;

/** Whether an eye inside at `shot` stands by the doorway, looking out of it. */
export const byDoorway = ({ x, z, yaw }: Shot, { arrival }: Stage): boolean =>
  Math.hypot(x - arrival[0], z - arrival[2]) <= DOOR_REACH &&
  Math.cos(yaw) > 0.5;

/** Whether `abroad` stands free on the sand within reach of the ladder's foot. */
export function canClimb(
  { scene, roamer }: Abroad,
  { land, ladder }: Stage,
  seconds: number,
): boolean {
  const [x, , z] = roamer.eye;
  const [footX, , footZ] = ladder.foot;
  return (
    scene === null &&
    !isAfloat(land, roamer.eye, seconds) &&
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
 * body roams; the first time it comes near the cube on its feet it looks
 * under it, and asking for the ladder within reach of its foot climbs it.
 */
export function abroad(
  state: Abroad,
  input: Input,
  dt: number,
  seconds: number,
  stage: Stage,
  woken: boolean,
): Abroad {
  const { scene, roamer, lookedUnder, asleep } = state;
  if (asleep && !woken) return { ...state, cues: NO_CUES };
  const rest = { asleep: false, lookedUnder };
  if (scene !== null) {
    const { track, playedFor, into } = scene;
    const t = playedFor + dt;
    const shot = shotAt(track, t);
    const cues = cuesBetween(track, playedFor, t);
    const done = t >= track.span;
    const { x, y, z, yaw, elevation } = shot;
    return {
      roamer: done
        ? { eye: [x, y, z], yaw, elevation, strode: 0, stroke: 0, cues }
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
      { track: climb(shotOf(roamer), stage), playedFor: 0, into: 'cube' },
      rest,
    );
  }
  const moved = roam(roamer, input, dt, seconds, stage.land);
  const { eye, cues } = moved;
  const [x, , z] = eye;
  if (
    !lookedUnder &&
    farFrom(stage.cube, [x, z]) <= LOOK_FROM &&
    !isAfloat(stage.land, eye, seconds)
  ) {
    return {
      ...playing(
        moved,
        {
          track: lookUnder(shotOf(moved), stage),
          playedFor: 0,
          into: 'island',
        },
        { asleep: false, lookedUnder: true },
      ),
      cues,
    };
  }
  return { ...free, roamer: moved, shot: shotOf(moved), cues };
}
