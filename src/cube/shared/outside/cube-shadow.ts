import { smoothstep } from '../lib/ease';
import { SUN_DISC, SUN_SPREAD } from '../lib/sun-disc';
import { cross3, dot3, moved, scaled, type Vec3 } from '../lib/vec';
import { f32, vecf, wgsl } from '../lib/wgsl';
import { CUBE_BOX, WORLD } from './frame';
import {
  DOOR_LADDER,
  LADDER_ACROSS,
  LADDER_OUT,
  LADDER_UP,
  LADDER_WGSL,
} from './ladder';
import {
  OUTDOOR_FRAME,
  type OutdoorState,
  type Standing,
} from './outdoor-frame';
import { SUN, SUN_DIR } from './sun';

/** How sharp a shadow's edge is where it starts, in metres. */
const CRISP = 0.003;

/** How far behind the thing that casts it a shadow is whole, in metres. */
const BEHIND = 0.05;

const HALF = scaled(moved(CUBE_BOX.max, CUBE_BOX.min, -1), 0.5);
const MIDDLE = moved(CUBE_BOX.min, HALF);
const AXES: Vec3[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

/**
 * The cube's outline as the sun sees it, a hexagon: for each pair of its
 * sides, the way they face across the sun's rays and how far from the cube's
 * middle they stand.
 */
const OUTLINE = AXES.map((axis) => {
  const [x, y, z] = cross3(axis, SUN_DIR);
  const long = Math.hypot(x, y, z);
  const facing: Vec3 = [x / long, y / long, z / long];
  return {
    facing,
    reach: dot3(HALF, [
      Math.abs(facing[0]),
      Math.abs(facing[1]),
      Math.abs(facing[2]),
    ]),
  };
});

/** Where the sun's ray from `p` enters and leaves the cube, in metres along it. */
function through(p: Vec3): [enters: number, leaves: number] {
  let enters = -Infinity;
  let leaves = Infinity;
  for (const axis of [0, 1, 2] as const) {
    const a = (CUBE_BOX.min[axis] - p[axis]) / SUN_DIR[axis];
    const b = (CUBE_BOX.max[axis] - p[axis]) / SUN_DIR[axis];
    enters = Math.max(enters, Math.min(a, b));
    leaves = Math.min(leaves, Math.max(a, b));
  }
  return [enters, leaves];
}

/** How much of the sun the cube leaves `p`. */
function boxLight(p: Vec3): number {
  const off = moved(p, MIDDLE, -1);
  let out = -Infinity;
  let back: Vec3 = [0, 0, 0];
  for (const { facing, reach } of OUTLINE) {
    const across = dot3(facing, off);
    if (Math.abs(across) - reach > out) {
      out = Math.abs(across) - reach;
      back = scaled(facing, -Math.sign(across));
    }
  }
  // A point beside the outline is judged by the ray of the outline's edge.
  const [enters, leaves] = through(moved(p, back, Math.max(out, 0) + 0.001));
  const hit = leaves > Math.max(enters, 0);
  const ahead = -dot3(off, SUN_DIR);
  const run = hit ? Math.max(enters, 0) : Math.max(ahead, 0);
  const behind = hit
    ? smoothstep(0, BEHIND, leaves)
    : out > 0 && ahead > 0
      ? 1
      : 0;
  const soft = SUN_SPREAD * run + CRISP;
  return 1 - (1 - smoothstep(-soft, soft, out)) * behind;
}

/** How much of the sun a bar `half` wide leaves a point `off` from its middle, its edge `soft` wide. */
const barLight = (off: number, half: number, soft: number): number =>
  (1 - smoothstep(half - soft, half + soft, off)) * Math.min(1, half / soft);

/** How much of the sun the ladder leaves `p`. */
function ladderLight(p: Vec3): number {
  const run =
    dot3(moved(DOOR_LADDER.foot, p, -1), LADDER_OUT) /
    dot3(SUN_DIR, LADDER_OUT);
  const at = moved(moved(p, SUN_DIR, run), DOOR_LADDER.foot, -1);
  const up = dot3(at, LADDER_UP);
  const across = Math.abs(dot3(at, LADDER_ACROSS));
  const soft = SUN_SPREAD * Math.max(run, 0) + CRISP;
  const stiles =
    barLight(
      Math.abs(across - DOOR_LADDER.wide / 2),
      DOOR_LADDER.stile.across / 2,
      soft,
    ) *
    barLight(
      Math.abs(up - DOOR_LADDER.length / 2),
      DOOR_LADDER.length / 2,
      soft,
    );
  const step =
    Math.min(Math.max(up, DOOR_LADDER.lowest), DOOR_LADDER.highest) -
    DOOR_LADDER.lowest;
  const rung =
    DOOR_LADDER.lowest +
    Math.round(step / DOOR_LADDER.pitch) * DOOR_LADDER.pitch;
  const rungs =
    barLight(Math.abs(up - rung), DOOR_LADDER.rung.tall / 2, soft) *
    barLight(across, DOOR_LADDER.wide / 2, soft);
  return 1 - Math.max(stiles, rungs) * smoothstep(BEHIND, 3 * BEHIND, run);
}

/** A standing body as the sun sees it: a round `BODY_HALF` to each side of its middle line. */
export const BODY_HALF = 0.17;

const acrossSun = (v: Vec3): Vec3 => moved(v, SUN_DIR, -dot3(v, SUN_DIR));

/**
 * How much of the sun a body standing at `body` leaves `p`: its shadow is a
 * capsule's, feet to head with no limbs, and 1 everywhere for a body of no
 * height.
 */
export function bodyShadow(p: Vec3, { foot, headAbove }: Standing): number {
  if (headAbove <= 0) return 1;
  const low = moved(moved(foot, [0, 1, 0], BODY_HALF), p, -1);
  const tall = Math.max(headAbove - 2 * BODY_HALF, 0.001);
  const flat = acrossSun(low);
  const line = acrossSun([0, tall, 0]);
  const share = Math.min(Math.max(-dot3(flat, line) / dot3(line, line), 0), 1);
  const off = Math.hypot(...moved(flat, line, share));
  const run = dot3(moved(low, [0, tall, 0], share), SUN_DIR);
  const soft = SUN_SPREAD * Math.max(run, 0) + CRISP;
  return 1 - barLight(off, BODY_HALF, soft) * smoothstep(0, 2 * BODY_HALF, run);
}

/**
 * How much of the sun reaches `p` in the world frame: 1 in the sun, 0 in the
 * shadow of the cube and its ladder, the edge as wide as the sun's disc makes
 * it at the distance the shadow has run. A point on the cube's own sunlit
 * faces is in the sun; one on the ladder is not in the ladder's shadow. With
 * `ladderGone` the cube casts alone, and a `body` casts with them.
 */
export const cubeShadow = (
  p: Vec3,
  { ladderGone = false, body }: OutdoorState = {},
): number =>
  boxLight(p) *
  (ladderGone ? 1 : ladderLight(p)) *
  (body ? bodyShadow(p, body) : 1);

const OUTLINE_WGSL = OUTLINE.map(({ facing, reach }) =>
  vecf([...facing, reach]),
).join(',\n  ');

/**
 * `cubeShadow(p: vec3f) -> f32`, the twin of the function above, the ladder
 * and the body read from the frame; and `bodyShadow(p: vec3f) -> f32`, the
 * body's share of it alone.
 */
export const CUBE_SHADOW = wgsl(
  'outside/cube-shadow',
  /* wgsl */ `
const SHADOW_CRISP = ${f32(CRISP)};
const SHADOW_BEHIND = ${f32(BEHIND)};
const BODY_HALF = ${f32(BODY_HALF)};
/// The cube's outline as the sun sees it: the way each pair of its sides
/// faces across the rays, and how far from the cube's middle they stand.
const CUBE_OUTLINE = array<vec4f, 3>(
  ${OUTLINE_WGSL}
);

fn boxLight(p: vec3f) -> f32 {
  let off = p - 0.5 * (CUBE_MIN + CUBE_MAX);
  var out = -1e9;
  var back = vec3f(0.0);
  for (var i = 0; i < 3; i++) {
    let side = CUBE_OUTLINE[i];
    let across = dot(side.xyz, off);
    if (abs(across) - side.w > out) {
      out = abs(across) - side.w;
      back = -side.xyz * sign(across);
    }
  }
  let edge = p + back * (max(out, 0.0) + 0.001);
  let a = (CUBE_MIN - edge) / SUN_DIR;
  let b = (CUBE_MAX - edge) / SUN_DIR;
  let near = min(a, b);
  let far = max(a, b);
  let enters = max(near.x, max(near.y, near.z));
  let leaves = min(far.x, min(far.y, far.z));
  let hit = leaves > max(enters, 0.0);
  let ahead = -dot(off, SUN_DIR);
  let run = select(max(ahead, 0.0), max(enters, 0.0), hit);
  let beside = select(0.0, 1.0, out > 0.0 && ahead > 0.0);
  let behind = select(beside, smoothstep(0.0, SHADOW_BEHIND, leaves), hit);
  let soft = SUN_SPREAD * run + SHADOW_CRISP;
  return 1.0 - (1.0 - smoothstep(-soft, soft, out)) * behind;
}

fn barLight(off: f32, half: f32, soft: f32) -> f32 {
  return (1.0 - smoothstep(half - soft, half + soft, off)) * min(1.0, half / soft);
}

fn ladderLight(p: vec3f) -> f32 {
  let run = dot(LADDER_FOOT - p, LADDER_OUT) / dot(SUN_DIR, LADDER_OUT);
  let at = p + SUN_DIR * run - LADDER_FOOT;
  let up = dot(at, LADDER_UP);
  let across = abs(dot(at, LADDER_ACROSS));
  let soft = SUN_SPREAD * max(run, 0.0) + SHADOW_CRISP;
  let stiles = barLight(abs(across - 0.5 * LADDER_SIZE.y), 0.5 * LADDER_SIZE.z, soft)
    * barLight(abs(up - 0.5 * LADDER_SIZE.x), 0.5 * LADDER_SIZE.x, soft);
  let step = clamp(up, LADDER_RUNGS.x, LADDER_RUNGS.y) - LADDER_RUNGS.x;
  let rung = LADDER_RUNGS.x + round(step / LADDER_SIZE.w) * LADDER_SIZE.w;
  let rungs = barLight(abs(up - rung), 0.5 * LADDER_RUNGS.z, soft)
    * barLight(across, 0.5 * LADDER_SIZE.y, soft);
  return 1.0 - max(stiles, rungs) * smoothstep(SHADOW_BEHIND, 3.0 * SHADOW_BEHIND, run);
}

fn bodyShadow(p: vec3f) -> f32 {
  if (frame.body.w <= 0.0) {
    return 1.0;
  }
  let up = vec3f(0.0, 1.0, 0.0);
  let low = frame.body.xyz + up * BODY_HALF - p;
  let tall = max(frame.body.w - 2.0 * BODY_HALF, 0.001);
  let flat = low - SUN_DIR * dot(low, SUN_DIR);
  let line = up * tall - SUN_DIR * (tall * SUN_DIR.y);
  let share = clamp(-dot(flat, line) / dot(line, line), 0.0, 1.0);
  let off = length(flat + line * share);
  let run = dot(low + up * (tall * share), SUN_DIR);
  let soft = SUN_SPREAD * max(run, 0.0) + SHADOW_CRISP;
  return 1.0 - barLight(off, BODY_HALF, soft) * smoothstep(0.0, 2.0 * BODY_HALF, run);
}

fn cubeShadow(p: vec3f) -> f32 {
  return boxLight(p) * mix(1.0, ladderLight(p), frame.state.x) * bodyShadow(p);
}
`,
  OUTDOOR_FRAME,
  WORLD,
  SUN,
  SUN_DISC,
  LADDER_WGSL,
);
