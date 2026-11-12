import type { Ground } from '@/cube/shared/lib/acoustics';
import { lerp, ramp, smooth } from '@/cube/shared/lib/ease';
import type { Gazing, Vec3 } from '@/cube/entities/world';

import type { Cue } from './play';
import {
  EYE_HEIGHT,
  type Input,
  RUN_SPEED,
  strideOf,
  turned,
  WALK_SPEED,
} from './step';

/** Something solid standing on the island, as the rectangle a body walks round. */
export type Footprint = {
  west: number;
  east: number;
  north: number;
  south: number;
};

/**
 * The island as a body meets it, in metres east (`x`) and south (`z`):
 * `height` of the sand over still sea level, the sea's slow `level` there
 * `seconds` into the hour, and what stands in the way.
 */
export type Land = {
  height: (x: number, z: number) => number;
  level: (x: number, z: number, seconds: number) => number;
  solids: readonly Footprint[];
};

/**
 * A body out of doors: its eye in metres (east, up, south) and its gaze;
 * `strode` the metres walked since its last footfall, `stroke` the swimming
 * strokes it has made, in turns; `cues` what happened in the frame that made
 * it.
 */
export type Roamer = Gazing & {
  eye: Vec3;
  strode: number;
  stroke: number;
  cues: readonly Cue[];
};

/** Floor 1's room side in metres, which the body's paces are told in. */
const SIDE = 5;

/** The eye over the soles, and over the water once the body floats. */
export const EYE_OVER_SAND = EYE_HEIGHT * SIDE;
export const EYE_OVER_WATER = 0.14;

/** The depth past which the pace is a swimmer's, and that pace's share of a run. */
const SWIM_DEPTH = 1.3;
const SWIM_SHARE = 0.32;

/** How near a solid the body's middle comes. */
const GIRTH = 0.3;

/** Metres between footfalls, and between a swimmer's strokes. */
const STRIDE = 0.75;
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

const NO_CUES: readonly Cue[] = [];

/** A body standing on `land` at `x`, `z`, looking along `gaze`. */
export const roamingAt = (
  land: Land,
  [x, z]: readonly [number, number],
  gaze: Gazing,
  seconds: number,
): Roamer => ({
  ...gaze,
  eye: [x, restingEye(land, x, z, seconds, 0), z],
  strode: 0,
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
): number {
  const bob =
    TREAD_BOB * Math.sin((2 * Math.PI * seconds) / TREAD) +
    STROKE_BOB * Math.sin(2 * Math.PI * stroke);
  return Math.max(
    land.height(x, z) + EYE_OVER_SAND,
    land.level(x, z, seconds) + EYE_OVER_WATER + bob,
  );
}

/** Whether a body with its eye at `eye` floats rather than stands. */
export const isAfloat = (
  land: Land,
  [x, , z]: Vec3,
  seconds: number,
): boolean =>
  land.level(x, z, seconds) + EYE_OVER_WATER >
  land.height(x, z) + EYE_OVER_SAND;

/** `x`, `z` pushed out of every solid a body's width away. */
function clear(
  x: number,
  z: number,
  solids: readonly Footprint[],
): readonly [number, number] {
  let at: readonly [number, number] = [x, z];
  // Twice, so a push out of one solid into another is undone.
  for (const _ of [0, 1]) {
    for (const { west, east, north, south } of solids) {
      const [px, pz] = at;
      const nearX = Math.min(east, Math.max(west, px));
      const nearZ = Math.min(south, Math.max(north, pz));
      const [dx, dz] = [px - nearX, pz - nearZ];
      const away = Math.hypot(dx, dz);
      if (away >= GIRTH) continue;
      if (away > 0) {
        const push = GIRTH / away;
        at = [nearX + dx * push, nearZ + dz * push];
        continue;
      }
      // Inside: out through the nearest side.
      const sides = [
        [px - west, [west - GIRTH, pz]],
        [east - px, [east + GIRTH, pz]],
        [pz - north, [px, north - GIRTH]],
        [south - pz, [px, south + GIRTH]],
      ] as const;
      at = sides.toSorted(([a], [b]) => a - b)[0][1];
    }
  }
  return at;
}

/** What a foot lands on where the water is `depth` over the sand, or under it. */
const groundAt = (depth: number): Ground =>
  depth > 0 ? 'shallows' : -depth < WET_REACH ? 'wet-sand' : 'sand';

/**
 * `roamer` after `dt` seconds of `input` on `land`, `seconds` into the hour.
 *
 * It walks the sand at the inside's paces with its eye a person's height over
 * its soles, slows as the water deepens round its legs, and floats once its
 * depth would put its eyes under: the eye then rides the water's own level,
 * bobbing with each stroke and while treading. Solids turn it aside. A
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
  const gaze = turned(roamer, input, dt);
  const [fromX, fromY, fromZ] = roamer.eye;
  const depthOf = (x: number, z: number): number =>
    land.level(x, z, seconds) - land.height(x, z);
  const share = lerp(
    1,
    SWIM_SHARE,
    smooth(ramp(depthOf(fromX, fromZ), 0, SWIM_DEPTH)),
  );
  const run = (input.walking ? WALK_SPEED : RUN_SPEED) * SIDE;
  const [east, south] = strideOf(input, gaze.yaw, run * share * dt);
  const [x, z] = clear(fromX + east, fromZ + south, land.solids);
  const went = Math.hypot(x - fromX, z - fromZ);
  const afloat = isAfloat(land, [x, fromY, z], seconds);
  const stroke = roamer.stroke + (afloat ? went / STROKE : 0);
  const rest = restingEye(land, x, z, seconds, stroke);
  const y = lerp(fromY, rest, 1 - Math.exp(-dt / SETTLE));
  const strode = roamer.strode + went;
  const reach = afloat ? STROKE : STRIDE;
  const fell = strode >= reach && dt > 0;
  const depth = depthOf(x, z);
  const strength = dt > 0 ? Math.min(1, went / dt / run) : 0;
  const cue: Cue = afloat
    ? { cue: 'splash', strength: 0.25 + 0.5 * strength }
    : depth > ANKLE
      ? { cue: 'splash', strength: lerp(0.2, 0.7, strength) }
      : { cue: 'step', strength, ground: groundAt(depth) };
  return {
    ...gaze,
    eye: [x, y, z],
    strode: fell ? strode % reach : strode,
    stroke,
    cues: fell ? [cue] : NO_CUES,
  };
}
