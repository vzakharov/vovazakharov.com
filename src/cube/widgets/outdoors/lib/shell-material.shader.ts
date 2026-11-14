// Generated from shell-material.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { SUN } from '@/cube/shared/outside';
import { HASH, wgsl } from '@/cube/shared/shader';

import { OUTDOOR_FRAME } from './outdoor-frame';
import { SHELL_SALT } from './shell-salt';
import { SKY } from './sky.shader';

export const SHELL_MATERIAL = wgsl(
  'cube/widgets/outdoors/lib/shell-material',
  /* wgsl */ `
const TURN = 6.2831853;
const HOUR = 3600.0;
/// What the sand shows of the evening, as a face looking down at it gathers
/// it.
const SAND_LIGHT = vec3f(0.72, 0.6, 0.44) * (SUN_LIGHT * SUN_DIR.y + SKY_FILL);

/// What a ray leaving the cube along \`dir\` shows, blurred by \`lod\`: the sky,
/// and under the horizon the sea and the sand.
fn surround(dir: vec3f, lod: f32) -> vec3f {
  let up = normalize(vec3f(dir.x, abs(dir.y) + 0.01, dir.z));
  let sky = skyRadiance(up, lod);
  let sea = sky * 0.45 + vec3f(0.02, 0.05, 0.07);
  let ground = mix(sea, SAND_LIGHT, smoothstep(0.04, 0.3, -dir.y));
  return mix(sky, ground, smoothstep(-0.01, 0.02 + 0.02 * lod, -dir.y));
}

/// \`light\` as the shell gives it back: a low sun and gold sand warm it a
/// little, where their colour taken whole would turn black and grey brown.
fn cooled(light: vec3f) -> vec3f {
  let level = dot(light, vec3f(0.2126, 0.7152, 0.0722));
  return mix(light, level * vec3f(0.95, 1.0, 1.07), 0.8);
}

struct Band {
  /// 1 in a near-black band, 0 in a grey one, between where they blur.
  dark: f32,
  /// How much of the point is the line between two bands.
  line: f32,
  /// Which band, the first 0, and how tall it is, in \`share\`.
  level: f32,
  tall: f32,
  /// 0 where bands are told apart, 1 where a pixel holds several.
  blurred: f32,
}

/// The floors as bands on a face, each half the one before: \`share\` runs from
/// 1 at the first band's start to 0, where they are too many to tell apart.
fn bandAt(share: f32, pixel: f32) -> Band {
  let r = clamp(share, 1e-5, 1.0);
  let level = floor(-log2(r));
  let size = exp2(-level);
  let tall = 0.5 * size;
  let within = (size - r) / tall;
  let blurred = smoothstep(0.3, 1.4, pixel / tall);
  let odd = level - 2.0 * floor(0.5 * level);
  // The line between two bands is 12 mm wide, a share of the cube's 5 m.
  let wide = min(0.0024, 0.1 * tall);
  let edge = min(within, 1.0 - within) * tall;
  let line = 1.0 - smoothstep(wide - pixel, wide + pixel, edge);
  return
    Band(
      mix(1.0 - odd, 0.5, blurred),
      mix(line, 0.3, blurred),
      level,
      tall,
      blurred,
    );
}

/// A sparse lattice of small lights \`cell\` metres apart at \`at\`, each
/// coming and going on a beat of its own.
fn lattice(at: vec2f, cell: f32, salt: u32, pixel: f32) -> f32 {
  let p = at / cell;
  let home = vec2i(floor(p));
  let h = cellHash(home, salt);
  let on = step(0.62, unitOf(h));
  // One in some thirty is a bright one.
  let bright = 1.0 + 6.0 * step(0.965, unitOf(mix32(h + 41u)));
  let off = fract(p) - 0.5;
  let beats = 300.0 + floor(unitOf(mix32(h + 13u)) * 600.0);
  let lit =
    0.5 + 0.5 * cos(
      TURN * (beats * frame.clock.x / HOUR + unitOf(mix32(h + 29u))),
    );
  let size = max(0.02, pixel / cell);
  return
    on
      * bright
      * lit
      * lit
      * (0.02 * 0.02)
      / (size * size)
      * (1.0 - smoothstep(0.0, size, length(off)));
}

struct Face {
  /// The point, the way its face looks, and the unit way to the eye.
  world: vec3f,
  normal: vec3f,
  toEye: vec3f,
  /// The point on its face, in metres, and that face's axes in the world.
  on: vec2f,
  along: vec3f,
  down: vec3f,
  /// How wide a pixel is there, in metres.
  pixel: f32,
  /// How much of the sun reaches it.
  sun: f32,
}

/// The light of a point of the shell's material in band \`band\`; \`depth\`
/// is how many layers of lights stand under its surface where it is black,
/// \`glance\` how much of a mirror it is seen along itself.
fn shellFace(f: Face, band: Band, depth: i32, glance: f32) -> vec3f {
  let facing = dot(f.normal, f.toEye);
  let grazing = pow(1.0 - clamp(facing, 0.0, 1.0), 5.0);
  let towards = max(dot(f.normal, SUN_DIR), 0.0);
  let sunlit = step(0.0, dot(f.normal, SUN_DIR)) * f.sun;

  // The colour of the grey, the black and the line between two bands.
  let base =
    mix(vec3f(0.012, 0.0132, 0.0152), vec3f(0.008, 0.009, 0.011), band.dark);
  let albedo = mix(base, vec3f(0.05, 0.052, 0.058), band.line);
  let fill =
    SKY_FILL * (0.5 + 0.5 * f.normal.y) + SAND_LIGHT * (0.5 - 0.5 * f.normal.y);
  let sunLight = mix(cooled(SUN_LIGHT), SUN_LIGHT, band.dark);
  var light = albedo * (sunLight * towards * f.sun + fill);

  // The mirror in it: sharp in the black, a satin blur in the grey, with a faint
  // cool sheen where a face that mirrors is seen along itself.
  let mirror = mix(0.11, 0.06, band.dark);
  let share = mirror + max(glance - mirror, 0.0) * grazing;
  let blur = mix(3.2, 0.4, band.dark);
  let film =
    vec3f(0.86, 0.97, 1.1) + 0.06 * cos(
      TURN * (vec3f(0.0, 0.33, 0.67)
        + 1.3 * (1.0 - facing)
        + 0.11 * band.level),
    );
  let tint =
    mix(
      vec3f(1.0),
      film,
      0.3 * smoothstep(0.1, 0.5, glance) * (1.0 - facing) * (1.0 - facing),
    );
  let mirrored = surround(reflect(-f.toEye, f.normal), blur);
  // Cooled in the black too: gold sand mirrored whole would turn it brown.
  light += cooled(mirrored) * share * tint;

  // The sun's own sheen on the brushed grey, drawn out down the face.
  let mid = normalize(SUN_DIR + f.toEye);
  let across = dot(mid, f.along);
  let sheen =
    pow(max(1.0 - across * across, 0.0), 400.0) * pow(
      max(dot(f.normal, mid), 0.0),
      24.0,
    );
  let skim = pow(1.0 - max(dot(mid, f.toEye), 0.0), 5.0);
  light +=
    sunLight
      * sunlit
      * (1.0 - band.dark)
      * sheen
      * (0.03 + 0.97 * skim)
      * 0.8
      * tint;

  // The lights under the black, each layer deeper and farther apart.
  let slide =
    vec2f(dot(f.toEye, f.along), dot(f.toEye, f.down)) / max(facing, 0.2);
  let metres = band.tall * 5.0;
  var under = 0.0;
  for (var layer = 0; layer < depth; layer++) {
    let deep = f32(layer + 1);
    let cell = max(0.25 * metres, 0.02) * (0.6 + 0.4 * deep);
    under +=
      lattice(
        f.on - slide * cell * (0.4 + 0.8 * f32(layer)),
        cell,
        SHELL_SALT + 71u + u32(layer),
        f.pixel,
      ) / deep;
  }
  light +=
    vec3f(0.62, 0.84, 1.0)
      * under
      * (0.6 + 0.5 * f32(depth))
      * band.dark
      * (1.0 - band.blurred)
      * (1.0 - band.line);

  // The lines' own light, a beat of it running down the floors each minute.
  let beat =
    0.5 + 0.5 * cos(TURN * (60.0 * frame.clock.x / HOUR - 0.125 * band.level));
  light += vec3f(0.5, 0.78, 1.0) * band.line * (0.45 + 1.4 * pow(beat, 6.0));
  return light;
}
`,
  OUTDOOR_FRAME,
  SKY,
  SUN,
  HASH,
  SHELL_SALT,
);
