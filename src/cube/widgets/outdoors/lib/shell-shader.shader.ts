// Generated from shell-shader.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { SUN } from '@/cube/shared/outside';
import { HASH, wgsl } from '@/cube/shared/shader';
import { LADDER_WGSL, WORLD } from '@/cube/entities/island';

import { AERIAL } from './aerial.shader';
import { CUBE_SHADOW } from './cube-shadow.shader';
import { OUTDOOR_FRAME } from './outdoor-frame';
import { OUTDOOR_STAGE } from './outdoor-stage.shader';
import { SHELL_MATERIAL } from './shell-material.shader';
import { SHELL_SALT } from './shell-salt';
import { SHELL_SHADER_NUMBERS } from './shell-shader-numbers';

export const SHELL_SHADER = wgsl(
  'cube/widgets/outdoors/lib/shell-shader',
  /* wgsl */ `
/// The ladder's wood where the weather has left it brown, and where the sun
/// has bleached it silver.
const WOOD_BROWN = vec3f(0.13, 0.092, 0.06);
const WOOD_SILVER = vec3f(0.19, 0.186, 0.178);

struct ShellVertex {
  @location(0) at: vec3f,
  @location(1) facing: vec3f,
  @location(2) on: vec2f,
  @location(3) kind: f32,
}

struct ShellSeen {
  @builtin(position) clip: vec4f,
  @location(0) world: vec3f,
  @location(1) facing: vec3f,
  @location(2) on: vec2f,
  @location(3) @interpolate(flat) kind: f32,
}

@vertex
fn vertexMain(v: ShellVertex) -> ShellSeen {
  // A ladder that is gone is drawn nowhere: its triangles close to a point.
  let gone = v.kind > SHELL_STILE_FROM && frame.state.x < 0.5;
  let clip = select(clipOf(v.at), vec4f(0.0), gone);
  return ShellSeen(clip, v.at, v.facing, v.on, v.kind);
}

/// How far in from a cap's edge a point of it is: 1 at the edge, 0 at the
/// middle.
fn outward(on: vec2f) -> f32 {
  let off = abs(on / CUBE_METRES - 0.5) * 2.0;
  return max(off.x, off.y);
}

/// The ladder's wood at \`grain\`, metres along a member and round it:
/// its colour there, weathered grey-brown, the grain running along, split
/// by drying checks and carrying the odd knot. \`worn\` is how much hands
/// and feet have rubbed the place smooth and pale.
fn wood(grain: vec2f, worn: f32) -> vec3f {
  // The grain wanders a little from straight, as the tree grew.
  let wander = 0.004 * valueNoise(grain * vec2f(2.5, 9.0), SHELL_SALT + 81u);
  let fibre =
    fbm(vec2f(grain.x * 6.0, (grain.y + wander) * 330.0), SHELL_SALT + 82u, 3);
  let ring =
    0.5 + 0.5 * cos(
      TURN * ((grain.y + wander) * 95.0 + 2.0 * valueNoise(
        grain * vec2f(1.3, 40.0),
        SHELL_SALT + 83u,
      )),
    );
  let bleached = fbm(grain * vec2f(1.7, 30.0), SHELL_SALT + 84u, 3);
  let check =
    smoothstep(
      0.86,
      0.93,
      valueNoise(
        vec2f(grain.x * 3.0, (grain.y + wander) * 260.0),
        SHELL_SALT + 85u,
      ),
    ) * smoothstep(
      0.35,
      0.6,
      valueNoise(grain * vec2f(4.0, 12.0), SHELL_SALT + 86u),
    );
  let knot =
    1.0 - smoothstep(
      0.0,
      0.12,
      worley(grain * vec2f(4.5, 55.0), SHELL_SALT + 87u).x,
    );
  let silver = clamp(0.35 + 0.9 * bleached + 0.4 * worn, 0.0, 1.0);
  var colour = mix(WOOD_BROWN, WOOD_SILVER, silver);
  colour *= 0.5 + 0.45 * fibre + 0.3 * ring * (1.0 - 0.6 * worn);
  colour = mix(colour, WOOD_BROWN * 0.35, 0.8 * knot);
  return colour * (1.0 - 0.75 * check * (1.0 - worn));
}

@fragment
fn fragmentMain(s: ShellSeen) -> Scene {
  let flat = normalize(s.facing);
  var normal = flat;
  let metres = metresTo(s.world);
  let toEye = (frame.eye.xyz - s.world) / metres;
  let pixel = max(length(fwidth(s.world)), 1e-4);
  // A face seen from behind is the inside of the shell, which the rooms are.
  if (dot(flat, toEye) < 0.0) {
    discard;
  }
  var light: vec3f;

  if (s.kind > SHELL_STILE_FROM) {
    // The ladder: its grain runs up a stile and along a rung.
    let off = s.world - LADDER_FOOT;
    let up = dot(off, LADDER_UP);
    let across = dot(off, LADDER_ACROSS);
    let out = dot(off, LADDER_OUT);
    let isRung = s.kind > SHELL_RUNG_FROM;
    var grain: vec2f;
    var worn = 0.0;
    if (isRung) {
      // A rung is a round bar: lit as one, and worn where it is stepped on.
      let step = round((up - LADDER_RUNGS.x) / LADDER_SIZE.w);
      let spoke = vec2f(up - LADDER_RUNGS.x - step * LADDER_SIZE.w, out);
      normal = normalize(LADDER_UP * spoke.x + LADDER_OUT * spoke.y);
      let turn = atan2(spoke.y, spoke.x);
      grain =
        vec2f(across + 7.0 * step, 0.5 * LADDER_RUNGS.z * turn + 0.31 * step);
      worn =
        (1.0 - smoothstep(0.05, 0.16, abs(across))) * smoothstep(
          -0.3,
          0.6,
          cos(turn),
        );
    } else {
      // A stile's four faces are four cuts of one piece: each its own way
      // through the grain, the two stiles two pieces.
      let side = sign(across);
      let through = dot(abs(flat), abs(LADDER_ACROSS));
      grain =
        vec2f(
          up + 11.0 * side,
          mix(across, out, through) + 0.07 * through + 0.19 * side,
        );
      // Hands have rubbed the stiles' edges where a climber holds them.
      worn = 0.35 * smoothstep(0.5, 2.5, up) * (1.0 - through);
    }
    let albedo = wood(grain, worn);
    let sun = cubeShadow(s.world + normal * 0.004);
    let towards = max(dot(normal, SUN_DIR), 0.0);
    let fill =
      SKY_FILL * (0.5 + 0.5 * normal.y) + SAND_LIGHT * (0.5 - 0.5 * normal.y);
    // Rubbed wood takes a dull polish, which the low sun finds.
    let mid = normalize(SUN_DIR + toEye);
    let polish = 0.05 * worn * pow(max(dot(normal, mid), 0.0), 30.0);
    light =
      albedo * (SUN_LIGHT * towards * sun + fill) + SUN_LIGHT * sun * polish;
  } else {
    let sun = cubeShadow(s.world + normal * 0.004);
    var face =
      Face(
        s.world,
        normal,
        toEye,
        s.on,
        cross(vec3f(0.0, -1.0, 0.0), normal),
        vec3f(0.0, -1.0, 0.0),
        pixel,
        sun,
      );
    var band: Band;
    var depth = 2;
    var glance = 0.5;
    var bounce = vec3f(0.0);
    if (s.kind > SHELL_REVEAL_FROM) {
      // The reveal: the grey all the way through the wall.
      band = Band(0.0, 0.0, 1.0, 1.0, 0.0);
      face.along = vec3f(0.0, 0.0, 1.0);
      face.down = vec3f(-1.0, 0.0, 0.0);
    } else if (s.kind > SHELL_UNDERSIDE_FROM) {
      // The underside: the floors go on outward from its middle, over a
      // well of lights.
      let pixelShare = pixel / (0.5 * CUBE_METRES);
      band = bandAt(1.0 - outward(s.on), pixelShare);
      band.dark = mix(1.0, band.dark, 0.35);
      // Its lines are for whoever looks up at it; seen along it from the
      // beach they would run together, so only its rim is lit there.
      let rim = smoothstep(0.98, 0.988, outward(s.on));
      band.line =
        max(band.line * smoothstep(0.08, 0.35, dot(normal, toEye)), rim);
      face.along = vec3f(1.0, 0.0, 0.0);
      face.down = vec3f(0.0, 0.0, 1.0);
      depth = 5;
      // Seen from the beach it is all glance: left a mirror, it would show
      // the sand as bright as the gap under it.
      glance = 0.1;
      // Toward its edges it faces the sand the sun still reaches, which
      // lights it from below.
      bounce =
        cooled(SAND_LIGHT) * 0.035 * smoothstep(0.55, 1.0, outward(s.on));
    } else if (s.kind > SHELL_TOP_FROM) {
      // The top: the first floor's black folds over the edge, and the rest
      // halve inward to the middle.
      band = bandAt(outward(s.on), pixel / (0.5 * CUBE_METRES));
      face.along = vec3f(0.0, 0.0, 1.0);
      face.down = vec3f(1.0, 0.0, 0.0);
    } else {
      band = bandAt(1.0 - s.on.y / CUBE_METRES, pixel / CUBE_METRES);
    }
    light = shellFace(face, band, depth, glance) + bounce;
  }
  return lit(aerial(light, -toEye, metres), metres);
}
`,
  OUTDOOR_STAGE,
  OUTDOOR_FRAME,
  WORLD,
  LADDER_WGSL,
  CUBE_SHADOW,
  AERIAL,
  SUN,
  HASH,
  SHELL_MATERIAL,
  SHELL_SALT,
  SHELL_SHADER_NUMBERS,
);
