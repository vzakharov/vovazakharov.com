import { wgsl } from '@/cube/shared/lib/wgsl';
import { HASH } from '@/cube/shared/lib/wgsl-hash';
import {
  AERIAL,
  CUBE_SHADOW,
  LADDER_WGSL,
  OUTDOOR_STAGE,
  SUN,
  WORLD,
} from '@/cube/shared/outside';

import { SHELL_MATERIAL } from './shell-material';
import { SHELL_KINDS, type ShellKind } from './shell-mesh';

/** The least `kind` a vertex of `kind` and of the kinds after it carries, as WGSL. */
const least = (kind: ShellKind): string =>
  (SHELL_KINDS.indexOf(kind) - 0.5).toFixed(1);

/**
 * The shell's scene-pass shader, over \`shellVertices\`' buffer: the cube's
 * faces in its black-and-grey material and the ladder in paint-flecked wood,
 * both under the sun, the sky and the cube's own shadow.
 */
export const SHELL_SHADER = wgsl(
  'shell/shader',
  /* wgsl */ `
struct ShellVertex {
  @location(0) at: vec3f,
  @location(1) facing: vec3f,
  @location(2) on: vec2f,
  @location(3) kind: f32,
};

struct ShellSeen {
  @builtin(position) clip: vec4f,
  @location(0) world: vec3f,
  @location(1) facing: vec3f,
  @location(2) on: vec2f,
  @location(3) @interpolate(flat) kind: f32,
};

@vertex
fn vertexMain(v: ShellVertex) -> ShellSeen {
  return ShellSeen(clipOf(v.at), v.at, v.facing, v.on, v.kind);
}

/// How far in from a cap's edge a point of it is: 1 at the edge, 0 at the
/// middle.
fn outward(on: vec2f) -> f32 {
  let off = abs(on / CUBE_METRES - 0.5) * 2.0;
  return max(off.x, off.y);
}

/// The ladder's wood at \`grain\`, metres along the grain and across it:
/// pale, weathered, spattered with two old paints.
fn wood(grain: vec2f) -> vec3f {
  let rings = fbm(grain * vec2f(2.5, 70.0), 81u, 3);
  let worn = valueNoise(grain * vec2f(1.3, 9.0), 82u);
  var colour = mix(vec3f(0.11, 0.08, 0.055), vec3f(0.26, 0.2, 0.14), 0.25 + 0.75 * rings)
    * (0.8 + 0.3 * worn);
  let white = worley(grain * vec2f(60.0, 90.0), 83u).x;
  let whites = smoothstep(0.55, 0.75, valueNoise(grain * vec2f(4.0, 14.0), 84u));
  colour = mix(colour, vec3f(0.5, 0.49, 0.45), whites * (1.0 - smoothstep(0.1, 0.22, white)));
  let teal = worley(grain * vec2f(38.0, 55.0), 85u).x;
  let teals = smoothstep(0.6, 0.8, valueNoise(grain * vec2f(2.3, 9.0), 86u));
  colour = mix(colour, vec3f(0.1, 0.24, 0.27), teals * (1.0 - smoothstep(0.12, 0.26, teal)));
  return colour;
}

@fragment
fn fragmentMain(s: ShellSeen) -> Scene {
  let normal = normalize(s.facing);
  let metres = metresTo(s.world);
  let toEye = (frame.eye.xyz - s.world) / metres;
  let pixel = max(length(fwidth(s.world)), 1e-4);
  // A face seen from behind is the inside of the shell, which the rooms are.
  if (dot(normal, toEye) < 0.0) {
    discard;
  }
  let sun = cubeShadow(s.world + normal * 0.004);
  var light: vec3f;

  if (s.kind > ${least('stile')}) {
    // The ladder: its grain runs up a stile and along a rung.
    let off = s.world - LADDER_FOOT;
    let up = dot(off, LADDER_UP);
    let across = dot(off, LADDER_ACROSS);
    let round = dot(off, LADDER_OUT) * 1.7 + dot(abs(normal), vec3f(0.0, 3.1, 7.3));
    let stile = vec2f(up, across + round);
    let rung = vec2f(across + 9.0 * floor(up / LADDER_SIZE.w), up + round);
    let colour = wood(select(stile, rung, s.kind > ${least('rung')}));
    let fill = SKY_FILL * (0.5 + 0.5 * normal.y) + SAND_LIGHT * (0.5 - 0.5 * normal.y);
    light = colour * (SUN_LIGHT * max(dot(normal, SUN_DIR), 0.0) * sun + fill);
  } else {
    var face = Face(
      s.world, normal, toEye, s.on,
      cross(vec3f(0.0, -1.0, 0.0), normal), vec3f(0.0, -1.0, 0.0),
      pixel, sun,
    );
    var band: Band;
    var depth = 2;
    if (s.kind > ${least('reveal')}) {
      // The reveal: the grey all the way through the wall.
      band = Band(0.0, 0.0, 1.0, 1.0, 0.0);
      face.along = vec3f(0.0, 0.0, 1.0);
      face.down = vec3f(-1.0, 0.0, 0.0);
    } else if (s.kind > ${least('underside')}) {
      // The underside: the floors go on outward from its middle, over a
      // well of lights.
      let pixelShare = pixel / (0.5 * CUBE_METRES);
      band = bandAt(1.0 - outward(s.on), pixelShare);
      band.dark = mix(1.0, band.dark, 0.35);
      face.along = vec3f(1.0, 0.0, 0.0);
      face.down = vec3f(0.0, 0.0, 1.0);
      depth = 5;
    } else if (s.kind > ${least('top')}) {
      // The top: the first floor's black folds over the edge, and the rest
      // halve inward to the middle.
      band = bandAt(outward(s.on), pixel / (0.5 * CUBE_METRES));
      face.along = vec3f(0.0, 0.0, 1.0);
      face.down = vec3f(1.0, 0.0, 0.0);
    } else {
      band = bandAt(1.0 - s.on.y / CUBE_METRES, pixel / CUBE_METRES);
    }
    light = shellFace(face, band, depth);
  }
  return lit(aerial(light, -toEye, metres), metres);
}
`,
  OUTDOOR_STAGE,
  SHELL_MATERIAL,
  CUBE_SHADOW,
  LADDER_WGSL,
  AERIAL,
  WORLD,
  SUN,
  HASH,
);
