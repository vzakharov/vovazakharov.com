import type { Vec3 } from '@/cube/entities/world';

import type { Cue } from './play';
import { EYE_OVER_SAND, type Footprint, type Land } from './roam';
import type { Gaze } from './step';
import {
  type Beat,
  joined,
  type Marked,
  reversed,
  type Shot,
  shotAt,
  type Track,
  trackOf,
} from './track';

/**
 * Where the scenes are set, in metres east, up and south: the island; the
 * spot the body wakes on at the water's edge, and the way its feet point,
 * out to sea; the cube's footprint and the height of its underside; the
 * ladder from its foot on the sand to its top at the doorway's sill, with the
 * heights of its rungs from the lowest; the eye of a body just inside the
 * doorway, facing in; and the share of the outside lens's exposure that
 * shows the room as its own lens does.
 */
export type Stage = {
  land: Land;
  wake: { at: readonly [x: number, z: number]; seaward: number };
  cube: Footprint & { underside: number };
  ladder: { foot: Vec3; top: Vec3; rungs: readonly number[] };
  arrival: Vec3;
  indoors: number;
};

/** A scene's cues, each at its moment. */
type Marks = readonly Marked<Cue>[];

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
const OPEN = { roll: 0, lids: 1, exposure: 1 };

/** A free body's camera: where a scene that takes over starts from. */
export const shotOf = ({
  eye: [x, y, z],
  yaw,
  elevation,
}: Gaze & { eye: Vec3 }): Shot => ({ x, y, z, yaw, elevation, ...OPEN });

/**
 * Waking: dark; the lids part on a world lying on its side, close, and part
 * again; the groan; up on an elbow, sitting with the legs in the swash,
 * standing with nothing but sea ahead; then the turn over the shoulder until
 * the cube stands in frame, and a beat on it.
 */
export function waking({ land, wake, cube }: Stage): Track<Cue> {
  const { at, seaward } = wake;
  const [cos, sin] = [Math.cos(seaward), Math.sin(seaward)];
  /** The eye `out` metres seaward of the hips and `over` the sand there. */
  const eyeAt = (out: number, over: number): Pick<Shot, 'x' | 'y' | 'z'> => {
    const [x, z] = [at[0] + out * cos, at[1] + out * sin];
    return { x, y: land.height(x, z) + over, z };
  };
  const stood: readonly [number, number] = [at[0] + 0.2 * cos, at[1] + 0.2 * sin];
  const middle: readonly [number, number] = [
    (cube.west + cube.east) / 2,
    (cube.north + cube.south) / 2,
  ];
  const toCube = wayTo(stood, middle);
  const round = nearest(toCube.yaw, seaward);
  const side = Math.sign(round - seaward) || 1;
  const cubeHigh = Math.atan2(
    cube.underside + 2.5 - (land.height(...stood) + EYE_OVER_SAND),
    toCube.far,
  );
  const beats: Beat[] = [
    // Lying on its side, the head inland of the hips, looking down its legs.
    {
      at: 0,
      ...eyeAt(-0.8, 0.13),
      yaw: seaward + 0.45 * side,
      elevation: 0.04,
      roll: 1.3 * side,
      lids: 0,
      exposure: 2.6,
    },
    { at: 0.7, lids: 0 },
    { at: 1.7, lids: 0.4 },
    { at: 2.3, lids: 0, ease: 'in' },
    { at: 3.1, lids: 0 },
    { at: 4.3, lids: 0.85, exposure: 1.7 },
    { at: 4.6, ...eyeAt(-0.8, 0.13), roll: 1.3 * side, elevation: 0.04 },
    { at: 4.7, yaw: seaward + 0.45 * side },
    { at: 5.4, lids: 1 },
    // Up on an elbow.
    {
      at: 6.4,
      ...eyeAt(-0.62, 0.44),
      yaw: seaward + 0.2 * side,
      elevation: -0.22,
      roll: 0.4 * side,
      exposure: 1.2,
    },
    { at: 7 },
    // Sitting, the legs and the swash below.
    {
      at: 8.7,
      ...eyeAt(-0.12, 0.8),
      yaw: seaward,
      elevation: -0.42,
      roll: 0,
      exposure: 1,
    },
    { at: 9.6, ...eyeAt(-0.12, 0.8), elevation: -0.42 },
    // Onto the feet: forward over the knees, then up.
    { at: 10.7, ...eyeAt(0.3, 1.02), elevation: -0.6, ease: 'in' },
    { at: 12.3, ...eyeAt(0.2, EYE_OVER_SAND), elevation: -0.02, ease: 'out' },
    // Nothing but sea.
    { at: 13.8, yaw: seaward, elevation: -0.02, roll: 0 },
    // Over the shoulder: the head leads, the body follows.
    { at: 15.4, roll: 0.05 * side },
    { at: 17.6, yaw: round, elevation: cubeHigh * 0.55, roll: 0 },
    { at: 19.2 },
  ];
  const cues: Marks = [
    [2, { cue: 'say', moment: 'waking' }],
    [6.1, { cue: 'splash', strength: 0.12 }],
    [11.2, { cue: 'step', strength: 0.35, ground: 'shallows' }],
    [11.9, { cue: 'step', strength: 0.4, ground: 'wet-sand' }],
    [15.2, { cue: 'step', strength: 0.3, ground: 'wet-sand' }],
    [16.4, { cue: 'step', strength: 0.3, ground: 'wet-sand' }],
  ];
  return trackOf(beats, cues);
}

/** How near the cube the body comes before it looks under it. */
export const LOOK_FROM = 8;
/** How far from the cube it bends down, and the pace it walks there at. */
const BEND_AT = 3.4;
const STROLL = 1.5;
/** Metres between the footfalls of a scene's walk. */
const PACE = 0.75;

/** The point of `box` nearest `x`, `z`. */
const nearestOn = (
  { west, east, north, south }: Footprint,
  [x, z]: readonly [number, number],
): readonly [number, number] => [
  Math.min(east, Math.max(west, x)),
  Math.min(south, Math.max(north, z)),
];

/** How far `x`, `z` is from `box`: 0 on it. */
export const farFrom = (
  box: Footprint,
  at: readonly [number, number],
): number => wayTo(at, nearestOn(box, at)).far;

/**
 * A walk at a stroll from `from` to `to` over `land`, from `start` seconds:
 * a beat and a footfall each pace, and the moment it arrives.
 */
function strolling(
  land: Land,
  from: readonly [number, number],
  to: readonly [number, number],
  start: number,
): { beats: Beat[]; cues: Marks; arrives: number } {
  const { far } = wayTo(from, to);
  const paces = Math.ceil(far / PACE);
  const beats = Array.from({ length: paces }, (_, index): Beat => {
    const share = (index + 1) / paces;
    const x = from[0] + (to[0] - from[0]) * share;
    const z = from[1] + (to[1] - from[1]) * share;
    return {
      at: start + (far * share) / STROLL,
      x,
      y: land.height(x, z) + EYE_OVER_SAND,
      z,
      ease: 'linear',
    };
  });
  return {
    beats,
    cues: beats.map(({ at }) => [at, { cue: 'step', strength: 0.4, ground: 'sand' }]),
    arrives: start + far / STROLL,
  };
}

/**
 * The look under the cube, from where `from` stands: a few steps nearer if it
 * is far, the knees bend, the head tilts until the eye sees under the cube
 * and out the other side; a beat; back up.
 */
export function lookUnder(from: Shot, { land, cube }: Stage): Track<Cue> {
  const here: readonly [number, number] = [from.x, from.z];
  const edge = nearestOn(cube, here);
  const { yaw: bearing, far } = wayTo(here, edge);
  const short = Math.max(0, far - BEND_AT);
  const there: readonly [number, number] = [
    here[0] + short * Math.cos(bearing),
    here[1] + short * Math.sin(bearing),
  ];
  const yaw = nearest(bearing, from.yaw);
  const walk = strolling(land, here, there, 0.3);
  const down = Math.max(walk.arrives, 0.9);
  const lean = 0.35;
  const [x, z] = [
    there[0] + lean * Math.cos(bearing),
    there[1] + lean * Math.sin(bearing),
  ];
  const ground = land.height(...there);
  const low = Math.min(ground + 0.62, cube.underside - 0.4);
  // Through, to the far side's sand: under the middle, half way down the gap.
  const through = Math.atan2(
    cube.underside - 0.55 - low,
    BEND_AT - lean + (cube.east - cube.west) / 2,
  );
  const bent = { x, y: low, z, elevation: through, roll: 0.16 };
  const beats: Beat[] = [
    { at: 0, ...from },
    { at: 0.9, yaw, elevation: 0, roll: 0 },
    ...walk.beats,
    { at: down, x: there[0], y: ground + EYE_OVER_SAND, z: there[1], elevation: 0, roll: 0 },
    { at: down + 1.5, ...bent },
    { at: down + 3.4, ...bent },
    {
      at: down + 4.8,
      x: there[0],
      y: ground + EYE_OVER_SAND,
      z: there[1],
      elevation: 0.12,
      roll: 0,
    },
  ];
  return trackOf(beats, walk.cues);
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
 * doorway into the dimmer room, to stand at the stage's `arrival` facing in.
 */
function ascent({ land, ladder, arrival, indoors }: Stage): Track<Cue> {
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
      at: begins + RUNG_TIME * (index + 1),
      x: x - OFF_LADDER * cos - side * SWAY * sin,
      y: rung + EYE_ON_LADDER,
      z: z - OFF_LADDER * sin + side * SWAY * cos,
      roll: 0.025 * side,
    };
  });
  const over = begins + RUNG_TIME * (rungs.length + 1);
  const [inX, inY, inZ] = arrival;
  const beats: Beat[] = [
    {
      at: 0,
      x: stance[0],
      y: land.height(...stance) + EYE_OVER_SAND,
      z: stance[1],
      yaw,
      elevation: 0,
      ...OPEN,
    },
    { at: begins, elevation: 0.5, exposure: 1 },
    ...climbed,
    { at: over - RUNG_TIME * 2, elevation: 0.35 },
    // A hand on the jamb, a foot on the sill.
    {
      at: over,
      x: top[0] - 0.1 * cos,
      y: top[1] + EYE_OVER_SAND - 0.12,
      z: top[2] - 0.1 * sin,
      elevation: 0,
      roll: 0,
      exposure: 1,
    },
    { at: over + 1.5, x: inX, y: inY, z: inZ, yaw: nearest(Math.PI, yaw) },
    { at: over + 2.1, exposure: indoors },
  ];
  const cues: Marks = [
    ...rungs.flatMap((_, index): Marked<Cue>[] => {
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
      { at: 0, ...from, yaw },
      { at: SETTLE, ...opening },
    ]),
    track,
  );
};

/** The climb into the cube, from where `from` stands by the ladder's foot. */
export const climb = (from: Shot, stage: Stage): Track<Cue> =>
  entered(from, ascent(stage));

/**
 * The way back down, from where `from` stands by the doorway inside: the
 * climb backwards, down to the ladder's foot.
 */
export const descent = (from: Shot, stage: Stage): Track<Cue> =>
  entered(from, reversed(ascent(stage)));
