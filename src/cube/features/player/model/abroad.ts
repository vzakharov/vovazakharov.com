import { pick } from '@/kernel/shared/lib/collections';

import type { Laddered } from '@/cube/shared/outside';
import type { Quad } from '@/cube/entities/world';

import { handsOnLadder } from './climbing';
import { type Cue, type Cued, NO_CUES } from './player';
import {
  EYE_OVER_SAND,
  footingAt,
  isAfloat,
  type Land,
  roam,
  type Roamer,
  roamingAt,
} from './roam';
import {
  climb,
  GONE_SHOWS,
  LADDER_REACH,
  lookingDown,
  outsideOf,
  shotOf,
  type Stage,
  stepOff,
  waking,
} from './scenes';
import { seesWhole } from './sight';
import type { Input } from './step';
import { cuesBetween, type Shot, shotAt, type Track } from './track';

/**
 * A scene being played, `playedFor` seconds in, and where it leaves the body:
 * on the island, inside the cube by the ladder, or back inside from its sill.
 */
type Playing = {
  track: Track<Cue>;
  playedFor: number;
  into: 'island' | 'cube' | 'sill';
};

/** What a body out of doors carries from scene to scene. */
type Mind = Required<Laddered> & { asleep: boolean; sawCube: boolean };

/**
 * A body out of doors and what the eye shows of it this frame. `scene` is
 * the one that holds its controls, null while it roams free; `asleep` until
 * the first sign of the player, the waking scene waiting on its first
 * moment; `ladderGone` once it has been inside the cube, the ladder standing
 * for a body that has not; `sawCube` once the cube has been wholly in its
 * view, the body wondering at it the frame it first is; `entered` in the one
 * frame a scene has put the body inside the cube, where `shot` is where it
 * stands.
 */
export type Abroad = Mind &
  Cued & {
    roamer: Roamer;
    scene: Playing | null;
    shot: Shot;
    entered: boolean;
  };

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
      playedFor: 0,
      into: 'island',
    },
    { asleep: true, ladderGone: false, sawCube: false },
  );
}

/** A body of `scale` on `land` under `from`'s eye, looking its way. */
const roamerAt = (
  from: Shot,
  scale: number,
  land: Land,
  seconds: number,
): Roamer =>
  roamingAt(
    land,
    [from.x, from.z],
    pick(from, 'yaw', 'elevation'),
    seconds,
    scale,
  );

/**
 * A body of `scale` on its feet at `from`, free, the ladder standing or gone;
 * a body that has seen the ladder go has seen the cube.
 */
export const roamingFree = (
  from: Shot,
  scale: number,
  { land }: Stage,
  seconds: number,
  ladderGone: boolean,
): Abroad => {
  const roamer = roamerAt(from, scale, land, seconds);
  return {
    roamer,
    scene: null,
    asleep: false,
    ladderGone,
    sawCube: ladderGone,
    shot: shotOf(roamer),
    cues: NO_CUES,
    entered: false,
  };
};

/** A body awake on `stage`'s shore where the waking leaves it, free. */
export function awakeOn(stage: Stage, seconds: number): Abroad {
  const track = waking(stage);
  return roamingFree(shotAt(track, track.runs), 1, stage, seconds, false);
}

/** What a body that has been inside the cube carries out of it. */
const BEEN_INSIDE: Mind = { asleep: false, ladderGone: true, sawCube: true };

/**
 * A body of `scale` leaving the cube from `from`, on the sill's edge: off it
 * and down to the sand, where no ladder stands.
 */
export const steppingOut = (
  from: Shot,
  scale: number,
  stage: Stage,
  seconds: number,
): Abroad =>
  playing(
    roamerAt(from, scale, stage.land, seconds),
    { track: stepOff(from, scale, stage), playedFor: 0, into: 'island' },
    BEEN_INSIDE,
  );

/**
 * A body of `scale` at the sill's edge at `from`, looking down for the ladder
 * and put back inside the doorway.
 */
export const refusedAt = (
  from: Shot,
  scale: number,
  stage: Stage,
  seconds: number,
): Abroad =>
  playing(
    roamerAt(from, scale, stage.land, seconds),
    { track: lookingDown(from, scale, stage), playedFor: 0, into: 'sill' },
    BEEN_INSIDE,
  );

/** Whether `a` is far enough into looking for the ladder to find it gone. */
export const findsLadderGone = ({ scene }: Abroad): boolean =>
  scene?.into === 'sill' && scene.playedFor >= GONE_SHOWS;

/** The sound of a body that sees what it did not expect. */
const WONDER: Cue = { cue: 'say', moment: 'wonder' };

/** How far over its standing height an eye may be and its feet still be on the sand. */
const OFF_THE_SAND = 0.3;

/**
 * A scene's `cue` as the frame it falls in sounds it: a footfall the scene
 * gave no ground, made by a body of `scale` standing on `land` with its eye
 * at `shot`, lands on the sand as the sea has left it `seconds` into the
 * hour.
 */
function footed(
  cue: Cue,
  { x, y, z }: Shot,
  scale: number,
  land: Land,
  seconds: number,
): Cue {
  if (cue.cue !== 'step' || cue.ground !== undefined) return cue;
  const over = y - land.height(x, z);
  return over > (EYE_OVER_SAND + OFF_THE_SAND) * scale
    ? cue
    : { ...cue, ground: footingAt(land, x, z, seconds) };
}

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
 * body roams, wonders the first frame the cube is wholly in its view, and
 * asking for the ladder within reach of its foot climbs it.
 */
export function abroad(
  state: Abroad,
  input: Input,
  dt: number,
  seconds: number,
  stage: Stage,
  woken: boolean,
): Abroad {
  const { scene, roamer, ladderGone, asleep, sawCube } = state;
  if (asleep && !woken) return { ...state, cues: NO_CUES };
  const rest: Mind = { asleep: false, ladderGone, sawCube };
  if (scene !== null) {
    const { track, playedFor, into } = scene;
    const t = playedFor + dt;
    const shot = shotAt(track, t);
    const cues = cuesBetween(track, playedFor, t).map((cue) =>
      footed(cue, shot, roamer.scale, stage.land, seconds),
    );
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
      entered: done && into !== 'island',
    };
  }
  const free = { ...state, ...rest, entered: false };
  if (input.use && canClimb(free, stage, seconds)) {
    return playing(
      roamer,
      {
        track: climb(shotOf(roamer), stage),
        playedFor: 0,
        into: 'cube',
      },
      rest,
    );
  }
  const moved = roam(roamer, input, dt, seconds, landOf(stage, ladderGone));
  const wonders = !sawCube && seesWhole(moved, stage.cube);
  return {
    ...free,
    roamer: moved,
    shot: shotOf(moved),
    sawCube: sawCube || wonders,
    cues: wonders ? [...moved.cues, WONDER] : moved.cues,
  };
}

/** `abroad`'s hands on the ladder while it climbs, in floor 1's room's frame. */
export const handsAbroad = (
  { scene, shot: { x, y, z }, roamer: { scale } }: Abroad,
  { ladder, cube }: Stage,
): Quad[] =>
  scene?.into === 'cube' && x > cube.max[0]
    ? handsOnLadder([x, y, z], ladder, scale)
    : [];
