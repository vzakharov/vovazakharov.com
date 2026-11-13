import type { Scaling } from '@/scene/shared/lib/plane';

import type { Ground } from '@/cube/shared/lib/acoustics';
import { lerp, ramp, smooth } from '@/cube/shared/lib/ease';
import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import type { Box } from '@/cube/shared/outside';
import type { Gazing, Outside, Vec3 } from '@/cube/entities/world';

import { type Cue, NO_CUES, type Striding } from './player';
import {
  EYE_HEIGHT,
  type Input,
  RUN_SPEED,
  strideOf,
  stridesIn,
  turned,
  WALK_SPEED,
  WALK_STRIDE,
} from './step';

/**
 * The island as a body meets it, in metres east (`x`) and south (`z`):
 * `height` of the sand over still sea level, the sea's slow `level` there
 * `seconds` into the hour, and what stands in the way, each solid walked
 * round on the ground plan whatever its height.
 */
export type Land = {
  height: (x: number, z: number) => number;
  level: (x: number, z: number, seconds: number) => number;
  solids: readonly Box[];
};

/**
 * A body out of doors: its eye in metres (east, up, south) and its gaze;
 * its `scale`, 1 a whole person and ½ one the pill has halved, which its eye
 * height, girth, pace and stride all go by; `strode` the metres walked since
 * its last footfall and `paces` how many footfalls it has made, `stroke` the
 * swimming strokes it has made, in turns; `cues` what happened in the frame
 * that made it.
 */
export type Roamer = Outside &
  Scaling &
  Striding & {
    paces: number;
    stroke: number;
  };

/** A whole body's eye over its soles, and over the water once it floats. */
export const EYE_OVER_SAND = EYE_HEIGHT * ROOM_METRES;
export const EYE_OVER_WATER = 0.14;

/** The depth past which the pace is a swimmer's, and that pace's share of a run. */
const SWIM_DEPTH = 1.3;
const SWIM_SHARE = 0.32;

/** How near a solid a whole body's middle comes. */
const GIRTH = 0.3;

/** Metres between a walk's footfalls, as indoors, and a swimmer's strokes. */
const STRIDE = WALK_STRIDE * ROOM_METRES;
const STROKE = 1.5;

/** How far a stroke lifts the eye, and treading water does, every `TREAD` seconds. */
const STROKE_BOB = 0.035;
const TREAD_BOB = 0.025;
const TREAD = 2.5;

/** Seconds the eye takes to settle most of the way to a new height. */
const SETTLE = 0.12;

/** Water deeper than this is waded, not stepped in: a splash, not a footfall. */
const ANKLE = 0.25;
/** How far above the water's edge the sand is still wet. */
const WET_REACH = 0.12;

/** A body of `scale` standing on `land` at `x`, `z`, looking along `gaze`. */
export const roamingAt = (
  land: Land,
  [x, z]: readonly [number, number],
  gaze: Gazing,
  seconds: number,
  scale = 1,
): Roamer => ({
  ...gaze,
  roll: 0,
  scale,
  eye: [x, restingEye(land, x, z, seconds, 0, scale), z],
  strode: 0,
  paces: 0,
  stroke: 0,
  cues: NO_CUES,
});

/** The height the eye rests at: over its soles, or over the water it floats in. */
function restingEye(
  land: Land,
  x: number,
  z: number,
  seconds: number,
  stroke: number,
  scale: number,
): number {
  const bob =
    TREAD_BOB * Math.sin((2 * Math.PI * seconds) / TREAD) +
    STROKE_BOB * Math.sin(2 * Math.PI * stroke);
  return Math.max(
    land.height(x, z) + EYE_OVER_SAND * scale,
    land.level(x, z, seconds) + (EYE_OVER_WATER + bob) * scale,
  );
}

/** Whether a body of `scale` with its eye at `eye` floats rather than stands. */
export const isAfloat = (
  land: Land,
  [x, , z]: Vec3,
  seconds: number,
  scale = 1,
): boolean =>
  land.level(x, z, seconds) + EYE_OVER_WATER * scale >
  land.height(x, z) + EYE_OVER_SAND * scale;

/** `x`, `z` pushed `girth` clear of every solid. */
function clear(
  x: number,
  z: number,
  solids: readonly Box[],
  girth: number,
): readonly [number, number] {
  let at: readonly [number, number] = [x, z];
  // Twice, so a push out of one solid into another is undone.
  for (const _ of [0, 1]) {
    for (const {
      min: [west, , north],
      max: [east, , south],
    } of solids) {
      const [px, pz] = at;
      const nearX = Math.min(east, Math.max(west, px));
      const nearZ = Math.min(south, Math.max(north, pz));
      const [dx, dz] = [px - nearX, pz - nearZ];
      const away = Math.hypot(dx, dz);
      if (away >= girth) continue;
      if (away > 0) {
        const push = girth / away;
        at = [nearX + dx * push, nearZ + dz * push];
        continue;
      }
      // Inside: out through the nearest side.
      const sides = [
        [px - west, [west - girth, pz]],
        [east - px, [east + girth, pz]],
        [pz - north, [px, north - girth]],
        [south - pz, [px, south + girth]],
      ] as const;
      let nearest: (typeof sides)[number] = sides[0];
      for (const side of sides) if (side[0] < nearest[0]) nearest = side;
      [, at] = nearest;
    }
  }
  return at;
}

/** What a foot lands on where the water is `depth` over the sand, or under it. */
const groundAt = (depth: number): Ground =>
  depth > 0 ? 'shallows' : -depth < WET_REACH ? 'wet-sand' : 'sand';

/** What a foot lands on at `x`, `z` of `land`, `seconds` into the hour. */
export const footingAt = (
  land: Land,
  x: number,
  z: number,
  seconds: number,
): Ground => groundAt(land.level(x, z, seconds) - land.height(x, z));

/**
 * `roamer` after `dt` seconds of `input` on `land`, `seconds` into the hour.
 *
 * It walks the sand at the inside's walking pace, and runs it at the inside's
 * running pace while `input.running` holds, its eye its own height over its
 * soles; its footfalls fall harder the nearer its pace is a run's. It slows to
 * a swimmer's pace as the water deepens round its legs, and floats once its
 * depth would put its eyes under: the eye then rides the water's own level,
 * bobbing with each stroke and while treading; every one of those lengths is
 * its scale's share of a whole body's. Solids turn it aside. A
 * footfall names the ground it lands on; past the ankles it is a splash, and
 * so is every swimming stroke. The sea has no edge.
 */
export function roam(
  roamer: Roamer,
  input: Input,
  dt: number,
  seconds: number,
  land: Land,
): Roamer {
  const {
    scale,
    eye: [fromX, fromY, fromZ],
    paces,
  } = roamer;
  const gaze = turned(roamer, input, dt);
  const depthOf = (x: number, z: number): number =>
    land.level(x, z, seconds) - land.height(x, z);
  const pace = input.running ? RUN_SPEED : WALK_SPEED;
  const speed =
    lerp(
      pace,
      RUN_SPEED * SWIM_SHARE,
      smooth(ramp(depthOf(fromX, fromZ), 0, SWIM_DEPTH * scale)),
    ) *
    ROOM_METRES *
    scale;
  const run = RUN_SPEED * ROOM_METRES * scale;
  const [east, south] = strideOf(input, gaze.yaw, speed * dt);
  const [x, z] = clear(fromX + east, fromZ + south, land.solids, GIRTH * scale);
  const went = Math.hypot(x - fromX, z - fromZ);
  const afloat = isAfloat(land, [x, fromY, z], seconds, scale);
  const stroke = roamer.stroke + (afloat ? went / (STROKE * scale) : 0);
  const rest = restingEye(land, x, z, seconds, stroke, scale);
  const y = lerp(fromY, rest, 1 - Math.exp(-dt / SETTLE));
  const strode = roamer.strode + went;
  const reach = (afloat ? STROKE : STRIDE * stridesIn(input)) * scale;
  const fell = strode >= reach && dt > 0;
  const depth = depthOf(x, z);
  const strength = dt > 0 ? Math.min(1, went / dt / run) : 0;
  const cue: Cue = afloat
    ? { cue: 'splash', strength: 0.25 + 0.5 * strength }
    : depth > ANKLE * scale
      ? { cue: 'splash', strength: lerp(0.2, 0.7, strength) }
      : { cue: 'step', strength, ground: groundAt(depth) };
  return {
    ...gaze,
    roll: 0,
    scale,
    eye: [x, y, z],
    strode: fell ? strode % reach : strode,
    paces: paces + (fell ? 1 : 0),
    stroke,
    cues: fell ? [cue] : NO_CUES,
  };
}
