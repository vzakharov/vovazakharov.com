import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import type { Box } from '@/cube/shared/outside';
import type { Outside, Vec3 } from '@/cube/entities/world';

import type { Cue } from './player';
import { EYE_OVER_SAND, type Land } from './roam';
import {
  type Beat,
  joined,
  type Marked,
  type Shot,
  shotAt,
  type Track,
  trackOf,
} from './track';

/**
 * Where the scenes are set, in metres east, up and south: the island; the
 * spot the body's head lies on as it wakes, up the beach on dry sand, and
 * the way its feet point, out to sea; the cube's box; the ladder from its
 * foot on the sand to its top at the doorway's sill, with the heights of its
 * rungs from the lowest and the ground it stands in a body's way on while it
 * stands; the eye of a body just inside the doorway, and the pill's shelf it
 * looks at from there. `land`'s solids are what stands for good: the cube.
 */
export type Stage = {
  land: Land;
  wake: { at: readonly [x: number, z: number]; seaward: number };
  cube: Box;
  ladder: { foot: Vec3; top: Vec3; rungs: readonly number[]; solid: Box };
  arrival: Vec3;
  shelf: Vec3;
};

/** Where an eye is, as a shot's own channels. */
type Spot = Record<'x' | 'y' | 'z', number>;

/** A scene's cues, each at its moment. */
type Marks = ReadonlyArray<Marked<Cue>>;

const TAU = 2 * Math.PI;

/** `angle` by whole turns, as near `to` as it gets. */
const nearest = (angle: number, to: number): number =>
  angle - TAU * Math.round((angle - to) / TAU);

/** The way from `from` to `to` on the ground: its yaw, and how far. */
const wayTo = (
  [fromX, fromZ]: readonly [number, number],
  [toX, toZ]: readonly [number, number],
): { yaw: number; far: number } => ({
  yaw: Math.atan2(toZ - fromZ, toX - fromX),
  far: Math.hypot(toX - fromX, toZ - fromZ),
});

/** An open, level eye with the lens's own exposure. */
const OPEN = { lids: 1, exposure: 1 };

/** A free body's camera: where a scene that takes over starts from. */
export const shotOf = ({
  eye: [x, y, z],
  yaw,
  elevation,
  roll,
}: Outside): Shot => ({ x, y, z, yaw, elevation, roll, ...OPEN });

/** Where a scene's camera puts the eye out of doors. */
export const outsideOf = ({
  x,
  y,
  z,
  yaw,
  elevation,
  roll,
}: Shot): Outside => ({ eye: [x, y, z], yaw, elevation, roll });

/** How bright the first light is to eyes that were shut, as a multiple. */
const DAZZLE = 1.5;

/** How far down the beach from where its head lay a body sits up, and stands. */
const SITS = 0.68;
const STANDS = 1;

/**
 * Waking: dark; the lids part on a world lying on its side, close, and part
 * again; the groan; up on an elbow, sitting with the beach running down to
 * the sea, standing with nothing but sea ahead; then the turn over the
 * shoulder until the cube stands in frame, and a beat on it. Its footfalls
 * name no ground: what the sand is like under them is the sea's to say.
 */
export function waking({ land, wake, cube }: Stage): Track<Cue> {
  const { at, seaward } = wake;
  const [cos, sin] = [Math.cos(seaward), Math.sin(seaward)];
  /** The eye `out` metres seaward of where the head lay and `over` the sand there. */
  const eyeAt = (out: number, over: number): Spot => {
    const [x, z] = [at[0] + out * cos, at[1] + out * sin];
    return { x, y: land.height(x, z) + over, z };
  };
  const stood: readonly [number, number] = [
    at[0] + STANDS * cos,
    at[1] + STANDS * sin,
  ];
  const middle: readonly [number, number] = [
    (cube.min[0] + cube.max[0]) / 2,
    (cube.min[2] + cube.max[2]) / 2,
  ];
  const toCube = wayTo(stood, middle);
  const round = nearest(toCube.yaw, seaward);
  const side = Math.sign(round - seaward) || 1;
  const cubeHigh = Math.atan2(
    cube.min[1] + 2.5 - (land.height(...stood) + EYE_OVER_SAND),
    toCube.far,
  );
  /** Flat on its side, looking down the beach. */
  const lying = {
    ...eyeAt(0, 0.13),
    yaw: seaward + 0.3 * side,
    elevation: 0.03,
    roll: 1.1 * side,
  };
  const sitting = { ...eyeAt(SITS, 0.8), yaw: seaward, elevation: -0.08 };
  const beats: Beat[] = [
    { mark: 0, ...lying, lids: 0, exposure: DAZZLE },
    { mark: 0.6, lids: 0 },
    // A first look, too bright to keep.
    { mark: 1.3, lids: 0.35 },
    { mark: 1.8, lids: 0, ease: 'in' },
    { mark: 2.4, lids: 0, exposure: DAZZLE },
    { mark: 3.4, lids: 1 },
    { mark: 4.2, ...lying, exposure: 1 },
    // Up on an elbow.
    {
      mark: 5.6,
      ...eyeAt(0.18, 0.44),
      yaw: seaward + 0.15 * side,
      elevation: -0.1,
      roll: 0.35 * side,
    },
    // Sitting: the beach, the surf and the horizon.
    { mark: 7.2, ...sitting, roll: 0 },
    { mark: 8, ...sitting },
    // Onto the feet: forward over the knees, then up.
    { mark: 8.9, ...eyeAt(STANDS + 0.1, 1.02), elevation: -0.3, ease: 'in' },
    {
      mark: 10.1,
      ...eyeAt(STANDS, EYE_OVER_SAND),
      elevation: -0.03,
      ease: 'out',
    },
    // Nothing but sea.
    { mark: 10.9, yaw: seaward, elevation: -0.03, roll: 0 },
    // Over the shoulder: the head leads, the body follows.
    { mark: 12.2, roll: 0.04 * side },
    { mark: 14.1, yaw: round, elevation: cubeHigh, roll: 0 },
    { mark: 15.3 },
  ];
  const cues: Marks = [
    [1.6, { cue: 'say', moment: 'waking' }],
    [9.2, { cue: 'step', strength: 0.35 }],
    [9.9, { cue: 'step', strength: 0.4 }],
    [12.1, { cue: 'step', strength: 0.3 }],
    [13.2, { cue: 'step', strength: 0.3 }],
  ];
  return trackOf(beats, cues);
}

/** Seconds a rung takes, and how far the eye sways to the side on each. */
const RUNG_TIME = 0.56;
const SWAY = 0.035;
/** The eye behind the ladder's line and over the feet, hands on the rails. */
const OFF_LADDER = 0.4;
const EYE_ON_LADDER = 1.5;
/** How near the ladder's foot the body stands to start, and to be in reach. */
const FOOT_STANCE = 0.5;
export const LADDER_REACH = 1.6;

/**
 * The climb from a stance at the ladder's foot: a rung at a time, a foot and
 * then a hand, the eye swaying from side to side; over the sill, through the
 * doorway into the dimmer room, to stand at the stage's `arrival` looking
 * at the pill's `shelf`.
 */
function ascent({ land, ladder, arrival, shelf }: Stage): Track<Cue> {
  const { foot, top, rungs } = ladder;
  const { yaw } = wayTo([foot[0], foot[2]], [top[0], top[2]]);
  const [cos, sin] = [Math.cos(yaw), Math.sin(yaw)];
  /** The ladder's own line at height `y`. */
  const onLadder = (y: number): readonly [number, number] => {
    const share = (y - foot[1]) / (top[1] - foot[1]);
    return [
      foot[0] + (top[0] - foot[0]) * share,
      foot[2] + (top[2] - foot[2]) * share,
    ];
  };
  const stance: readonly [number, number] = [
    foot[0] - FOOT_STANCE * cos,
    foot[2] - FOOT_STANCE * sin,
  ];
  const begins = 0.5;
  const climbed = rungs.map((rung, index): Beat => {
    const [x, z] = onLadder(rung);
    const side = index % 2 === 0 ? 1 : -1;
    return {
      mark: begins + RUNG_TIME * (index + 1),
      x: x - OFF_LADDER * cos - side * SWAY * sin,
      y: rung + EYE_ON_LADDER,
      z: z - OFF_LADDER * sin + side * SWAY * cos,
      roll: 0.025 * side,
    };
  });
  const over = begins + RUNG_TIME * (rungs.length + 1);
  const [inX, inY, inZ] = arrival;
  const toShelf = wayTo([inX, inZ], [shelf[0], shelf[2]]);
  const beats: Beat[] = [
    {
      mark: 0,
      x: stance[0],
      y: land.height(...stance) + EYE_OVER_SAND,
      z: stance[1],
      yaw,
      elevation: 0,
      roll: 0,
      ...OPEN,
    },
    { mark: begins, elevation: 0.5, exposure: 1 },
    ...climbed,
    { mark: over - RUNG_TIME * 2, elevation: 0.35 },
    // A hand on the jamb, a foot on the sill.
    {
      mark: over,
      x: top[0] - 0.1 * cos,
      y: top[1] + EYE_OVER_SAND - 0.12,
      z: top[2] - 0.1 * sin,
      elevation: 0,
      roll: 0,
      exposure: 1,
    },
    {
      mark: over + 1.5,
      x: inX,
      y: inY,
      z: inZ,
      yaw: nearest(toShelf.yaw, yaw),
      elevation: Math.atan2(shelf[1] - inY, toShelf.far),
    },
    { mark: over + 2.3 },
  ];
  const cues: Marks = [
    ...rungs.flatMap((_, index): Array<Marked<Cue>> => {
      const at = begins + RUNG_TIME * index;
      return [
        [at + RUNG_TIME * 0.35, { cue: 'rung', limb: 'hand' }],
        [at + RUNG_TIME * 0.85, { cue: 'rung', limb: 'foot' }],
      ];
    }),
    [over - 0.1, { cue: 'step', strength: 0.5 }],
    [over + 0.9, { cue: 'step', strength: 0.4 }],
  ];
  return trackOf(beats, cues);
}

/** Seconds a body takes to settle into a scene's opening stance. */
const SETTLE = 0.8;

/** `from` easing into `track`'s opening camera, and then `track`. */
const entered = (from: Shot, track: Track<Cue>): Track<Cue> => {
  const opening = shotAt(track, 0);
  const yaw = nearest(from.yaw, opening.yaw);
  return joined(
    trackOf([
      { mark: 0, ...from, yaw },
      { mark: SETTLE, ...opening },
    ]),
    track,
  );
};

/** The climb into the cube, from where `from` stands by the ladder's foot. */
export const climb = (from: Shot, stage: Stage): Track<Cue> =>
  entered(from, ascent(stage));

/** Seconds from the wall to the sill's edge, and the fall's pull, in m/s². */
const TO_EDGE = 0.2;
const GRAVITY_METRES = 9.8;
/**
 * How far out of the cube's face a whole body's eye is as it starts to fall,
 * and where it comes down.
 */
const CLEAR_OF_FACE = 0.15;
const LANDS_OUT = 0.5;
/** The share of its height a landing takes off the eye, and for how long. */
const DIP = 0.3;
const DIP_TIME = 0.55;

/**
 * The step off the sill, from where a body of `scale` stands `from` on its
 * edge: out over it, a fall to the sand under the
 * doorway, the knees giving on it; the eye keeps its gaze all the way and the
 * lens opens to the daylight.
 */
export function stepOff(
  from: Shot,
  scale: number,
  { land, cube }: Stage,
): Track<Cue> {
  const out = cube.max[0] + LANDS_OUT * scale;
  const tall = EYE_OVER_SAND * scale;
  const rest = land.height(out, from.z) + tall;
  const { y } = from;
  const falls = Math.sqrt((2 * Math.max(0, y - rest)) / GRAVITY_METRES);
  const lands = TO_EDGE + falls;
  const beats: Beat[] = [
    { mark: 0, ...from, roll: 0 },
    // Clear of the face before the eye sinks under the sill.
    { mark: TO_EDGE, x: cube.max[0] + CLEAR_OF_FACE * scale, y },
    { mark: lands, x: out, exposure: 1, ease: 'linear' },
    // From rest under a steady pull: the distance fallen goes as time squared.
    { mark: lands, y: rest, ease: 'in' },
    { mark: lands + 0.12, y: rest - DIP * tall, ease: 'out' },
    { mark: lands + DIP_TIME, y: rest },
  ];
  return trackOf(beats, [
    [lands, { cue: 'landing', speed: (GRAVITY_METRES * falls) / ROOM_METRES }],
  ]);
}
