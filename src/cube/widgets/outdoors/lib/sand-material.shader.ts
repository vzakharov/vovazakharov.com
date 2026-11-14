// Generated from sand-material.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { SUN } from '@/cube/shared/outside';
import { wgsl } from '@/cube/shared/shader';
import { SHORE_WETNESS } from '@/cube/entities/island';

import { SAND_COLOUR } from './sand-colour.shader';
import { SAND_GRAIN } from './sand-grain.shader';
import { SAND_RELIEF } from './sand-relief.shader';
import { SAND_RELIEF_NUMBERS } from './sand-relief-numbers';
import { SAND_SALT } from './sand-salt';
import { SKY } from './sky.shader';

export const SAND_MATERIAL = wgsl(
  'cube/widgets/outdoors/lib/sand-material',
  /* wgsl */ `
/// Metres over still water above which the sea is never asked: always dry.
const SWASH_TOP = 1.1;

/// How wet the sand is at \`xz\`, \`h\` metres over still water, at \`t\` seconds
/// into the hour: x how damp (1 soaked), y how much of a film of water still
/// stands on it (1 a mirror). The sea says where its sheets have lately lain;
/// the sand by the still waterline is damp whatever the waves do.
fn sandWetness(xz: vec2f, h: f32, t: f32) -> vec2f {
  if (h > SWASH_TOP) {
    return vec2f(0.0);
  }
  let shore = shoreWetness(xz, t);
  return vec2f(max(shore.x, 1.0 - smoothstep(0.02, 0.2, h)), shore.y);
}

/// Sun on a rough, dusty surface that throws light back the way it came:
/// what a white face of it shows per unit of sunlight.
fn sandDiffuse(normal: vec3f, sun: vec3f, view: vec3f) -> f32 {
  let toSun = max(dot(normal, sun), 0.0);
  let toEye = max(dot(normal, view), 0.0);
  let around = dot(sun, view) - toSun * toEye;
  // At a low sun both angles graze, where the bare ratio runs away.
  let spread = select(1.0, max(max(toSun, toEye), 0.35), around > 0.0);
  let back = 0.3 * pow(max(dot(sun, view), 0.0), 6.0);
  return toSun * (max(0.75 + 0.35 * around / spread, 0.5) + back);
}

/// The sky's light on a face of the sand.
fn sandFill(normal: vec3f, sun: vec3f) -> vec3f {
  // The sky is brightest and warmest round the sun, so a face turned that way
  // stays the lighter one in shadow too; the rest of it, overhead, is bluer
  // than its mean.
  let sunward = max(dot(normal, normalize(vec3f(sun.x, 0.35, sun.z))), 0.0);
  return
    SKY_FILL * ((0.34 + 0.3 * normal.y) * vec3f(0.9, 0.96, 1.2) + 0.5
      * vec3f(1.3, 0.95, 0.62)
      * sunward);
}

/// What one pixel of sand has to be lit with.
struct SandPoint {
  /// The point in the world, and metres over still water of the shape under it.
  at: vec3f,
  h: f32,
  /// The walked-on shape's slope here.
  slope: vec2f,
  /// \`sandWetness\` here.
  wet: vec2f,
  /// Unit, from the point to the eye.
  view: vec3f,
  /// Metres of ground under a pixel: across the view and along the wind.
  px: f32,
  alongWind: f32,
  /// 1 in sun, 0 in the cube's shadow.
  sun: f32,
}

/// The light a pixel of sand sends to the eye.
fn sandLight(point: SandPoint, sun: vec3f) -> vec3f {
  let xz = point.at.xz;
  let hummocks = sandHummocks(xz, point.h);
  var slope = point.slope + hummocks.slope;

  // The ripples: drawn while a pixel resolves them, their average beyond.
  let drawn = 1.0 - smoothstep(0.2, 0.55, point.alongWind / RIPPLE_LENGTH);
  let dryness = sandDryness(point.h);
  var crest = 0.5;
  var stand = dryness * rippleSwathe(xz);
  var rippleSun = 1.0;
  if (drawn > 0.0) {
    let ripples = sandRipples(xz, point.h, sun);
    slope += drawn * ripples.relief.slope;
    crest = mix(crest, ripples.crest, drawn);
    stand = ripples.stand / RIPPLE_HEIGHT;
    rippleSun = ripples.sun;
  }
  let acrossSun = abs(dot(normalize(sun.xz), SAND_WIND));
  rippleSun = mix(1.0 - 0.42 * stand * acrossSun, rippleSun, drawn);

  var damp = 0.0;
  if (point.wet.x > 0.0) {
    damp =
      smoothstep(
        0.22,
        0.7,
        point.wet.x + 0.35 * (fbmd(xz / 0.35, SAND_SALT + 0x9bu, 3).x - 0.5),
      );
  }
  let film = point.wet.y;
  let grains = sandGrains(xz, point.px);
  let litter = sandLitter(xz, point.h, point.px, sun);
  slope += grains.slope * (1.0 - 0.6 * damp);
  slope = mix(slope, litter.slope, litter.cover);

  // Heavy dark grains gather in the troughs.
  var albedo =
    sandAlbedo(xz) * grains.tint * (1.0 - 0.16 * stand * (1.0 - crest));
  albedo = sandWetted(mix(albedo, litter.albedo, litter.cover), damp);

  let normal = normalize(vec3f(-slope.x, 1.0, -slope.y));
  let direct = SUN_LIGHT * (point.sun * rippleSun * litter.sun);
  let hollow = 1.0 - 0.16 * stand * (1.0 - crest);
  // Sunlit sand lights the shaded faces beside it, warm.
  let bounce =
    SUN_LIGHT * (point.sun * sun.y * 0.3) * DRY_SAND * (1.0 - 0.5 * normal.y);
  var light =
    albedo * (direct * sandDiffuse(normal, sun, point.view) + (sandFill(
      normal,
      sun,
    ) + bounce) * hollow);

  let half = normalize(sun + point.view);
  let dry = 1.0 - damp;
  // Dry quartz throws a broad sheen forward, toward an eye facing the sun.
  let toHalf = max(dot(normal, half), 0.0);
  let sheenLobe =
    0.09 / (SAND_PI * pow(toHalf * toHalf * (0.09 - 1.0) + 1.0, 2.0));
  let grazing = pow(1.0 - max(dot(point.view, half), 0.0), 5.0);
  light +=
    direct
      * dry
      * max(dot(normal, sun), 0.0)
      * (0.04 + 0.96 * grazing)
      * sheenLobe
      * 0.6;
  // Quartz lets a low sun through: seen against it, dry sand glows the sun's
  // colour, most where the eye grazes the ground along the sun's bearing.
  let sunward = max(-dot(normalize(point.view.xz), normalize(sun.xz)), 0.0);
  let through = pow(sunward, 1.5) * pow(1.0 - max(point.view.y, 0.0), 2.0);
  light +=
    direct
      * vec3f(0.8, 0.78, 0.5)
      * (0.17 * dry * through * (0.4 + 0.6 * crest));
  // Glints are a thing of the sand at one's feet and of the sun's own
  // bearing: further off, or to the side, a pixel holds only their average.
  let glints =
    (1.0 - smoothstep(0.0035, 0.009, point.px)) * smoothstep(
      0.55,
      0.9,
      sunward,
    );
  if (glints > 0.0) {
    let white = mix(direct, vec3f(dot(direct, vec3f(0.3, 0.5, 0.2))), 0.6);
    light +=
      white * dry * dry * 3.0 * glints * sandGlint(xz, normal, half, point.px);
  }
  light +=
    direct
      * litter.cover
      * litter.gloss
      * pow(max(dot(normal, half), 0.0), 60.0);

  // Wet sand: a sheen where it is soaked, the sky's mirror where water stands.
  if (damp > 0.0) {
    let level = point.slope + 0.3 * hummocks.slope;
    let flat = normalize(vec3f(-level.x, 1.0, -level.y));
    let lying = normalize(mix(normal, flat, 0.55 + 0.45 * film));
    // How much it mirrors goes by the lie of the sand, not of each grain.
    let facing = max(dot(flat, point.view), 0.0);
    let fresnel = 0.02 + 0.98 * pow(1.0 - facing, 5.0);
    // Even under a film the grains show through it, so the sun's mirror
    // image is a broad path of glare and not a disc.
    let rough = mix(0.24, 0.1, film);
    // Seen at a graze, the faces that would mirror the ground hide behind
    // their neighbours: what shows is the sky just over the horizon.
    let bounced = reflect(-point.view, lying);
    let mirrored =
      skyRadiance(
        normalize(vec3f(bounced.x, max(bounced.y, 0.04), bounced.z)),
        6.0 * rough,
      );
    let a2 = rough * rough * rough * rough;
    let nh = max(dot(lying, half), 0.0);
    let lobe = a2 / (SAND_PI * pow(nh * nh * (a2 - 1.0) + 1.0, 2.0));
    let glare =
      min(direct * (SAND_PI / 4.0) * lobe / max(facing, 0.05), vec3f(60.0));
    let sheen = fresnel * mix(0.9 * damp, 1.0, film);
    light =
      mix(light, mirrored, sheen) + sheen * glare * max(dot(lying, sun), 0.0);
  }
  return light;
}
`,
  SHORE_WETNESS,
  SKY,
  SUN,
  SAND_COLOUR,
  SAND_GRAIN,
  SAND_RELIEF,
  SAND_RELIEF_NUMBERS,
  SAND_SALT,
);
