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
 * faces in its black-and-grey material and the ladder in mill-finish aluminium,
 * both under the sun, the sky and the cube's own shadow.
 */
export const SHELL_SHADER = wgsl(
  'shell/shader',
  /* wgsl */ `
/// What the ladder's metal gives back: of the light on it as a matte face
/// would, of what it mirrors, and of the sun's own streak across its grain.
const ALUMINIUM = vec3f(0.07, 0.7, 1.1);

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
  // A ladder that is gone is drawn nowhere: its triangles close to a point.
  let gone = v.kind > ${least('stile')} && frame.state.x < 0.5;
  let clip = select(clipOf(v.at), vec4f(0.0), gone);
  return ShellSeen(clip, v.at, v.facing, v.on, v.kind);
}

/// How far in from a cap's edge a point of it is: 1 at the edge, 0 at the
/// middle.
fn outward(on: vec2f) -> f32 {
  let off = abs(on / CUBE_METRES - 0.5) * 2.0;
  return max(off.x, off.y);
}

/// The ladder's aluminium at \`grain\`, metres along the extrusion and
/// across it: x how bright the metal is there, y how dull its oxide has
/// left it, 0 to 1.
fn aluminium(grain: vec2f) -> vec2f {
  let drawn = valueNoise(grain * vec2f(4.0, 1400.0), SHELL_SALT + 81u);
  let dull = fbm(grain * vec2f(5.0, 34.0), SHELL_SALT + 82u, 3);
  let nick = worley(grain * vec2f(31.0, 140.0), SHELL_SALT + 83u).x;
  let scuffed = smoothstep(0.62, 0.8, valueNoise(grain * vec2f(3.0, 21.0), SHELL_SALT + 84u))
    * (1.0 - smoothstep(0.08, 0.2, nick));
  return vec2f(0.66 + 0.14 * drawn - 0.2 * dull + 0.25 * scuffed, clamp(dull - scuffed, 0.0, 1.0));
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
    // The ladder: its metal is drawn along a stile and along a rung.
    let off = s.world - LADDER_FOOT;
    let up = dot(off, LADDER_UP);
    let across = dot(off, LADDER_ACROSS);
    let round = dot(off, LADDER_OUT) * 1.7 + dot(abs(normal), vec3f(0.0, 3.1, 7.3));
    let isRung = s.kind > ${least('rung')};
    let stile = vec2f(up, across + round);
    let rung = vec2f(across + 9.0 * floor(up / LADDER_SIZE.w), up + round);
    let metal = aluminium(select(stile, rung, isRung));
    let axis = select(LADDER_UP, LADDER_ACROSS, isRung);
    let mid = normalize(SUN_DIR + toEye);
    let along = dot(mid, axis);
    let sheen = pow(max(1.0 - along * along, 0.0), 40.0) * pow(max(dot(normal, mid), 0.0), 14.0);
    let towards = max(dot(normal, SUN_DIR), 0.0);
    let fill = SKY_FILL * (0.5 + 0.5 * normal.y) + SAND_LIGHT * (0.5 - 0.5 * normal.y);
    let mirror = surround(reflect(-toEye, normal), 3.0 + 4.0 * metal.y);
    light = vec3f(0.91, 0.92, 0.93) * metal.x * (
      ALUMINIUM.x * (SUN_LIGHT * towards * sun + fill)
      + ALUMINIUM.y * mirror
      + ALUMINIUM.z * SUN_LIGHT * sun * step(0.0, dot(normal, SUN_DIR)) * sheen * (1.0 - 0.7 * metal.y)
    );
  } else {
    var face = Face(
      s.world, normal, toEye, s.on,
      cross(vec3f(0.0, -1.0, 0.0), normal), vec3f(0.0, -1.0, 0.0),
      pixel, sun,
    );
    var band: Band;
    var depth = 2;
    var glance = 0.5;
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
      // Its lines are for whoever looks up at it; seen along it from the
      // beach they would run together, so only its rim is lit there.
      let rim = smoothstep(0.98, 0.988, outward(s.on));
      band.line = max(band.line * smoothstep(0.08, 0.35, dot(normal, toEye)), rim);
      face.along = vec3f(1.0, 0.0, 0.0);
      face.down = vec3f(0.0, 0.0, 1.0);
      depth = 5;
      // Seen from the beach it is all glance: left a mirror, it would show
      // the sand as bright as the gap under it.
      glance = 0.1;
    } else if (s.kind > ${least('top')}) {
      // The top: the first floor's black folds over the edge, and the rest
      // halve inward to the middle.
      band = bandAt(outward(s.on), pixel / (0.5 * CUBE_METRES));
      face.along = vec3f(0.0, 0.0, 1.0);
      face.down = vec3f(1.0, 0.0, 0.0);
    } else {
      band = bandAt(1.0 - s.on.y / CUBE_METRES, pixel / CUBE_METRES);
    }
    light = shellFace(face, band, depth, glance);
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
