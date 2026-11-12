import { wgsl } from '../lib/wgsl';
import { SKY, SUN, WATER_LEVEL } from '../outside';
import { DRY_SAND, SAND_COLOUR } from './sand-colour';
import { SAND_GRAIN } from './sand-grain';
import { RIPPLES, SAND_RELIEF, WIND } from './sand-relief';

/**
 * Sand as a material: its colour dry and wet, how a low sun and the sky light
 * it, and how wet it is from where the sea has lately been.
 */

/** Seconds ago at which the sea's reach is asked, densest over the last swash. */
const AGES = [
  0, 0.6, 1.2, 2, 3, 4, 5.2, 6.5, 8, 9.5, 11, 13, 16, 20, 25, 31, 38, 46,
] as const;

/** Seconds over which sand the water has left goes from soaked to dry. */
const DRYING = 28;

/** Metres over still water above which the sea is never asked: always dry. */
export const SWASH_TOP = 1.1;

/**
 * How the sand is lit — `sandLight` — and how wet it is from where the sea
 * has lately been — `sandWetness`.
 */
export const SAND_MATERIAL = wgsl(
  'sand-material',
  /* wgsl */ `
/// How wet the sand is at \`xz\`, \`h\` metres over still water, at \`t\` seconds
/// into the hour: x how damp (1 soaked), y how much of a film of water still
/// stands on it (1 a mirror). Both follow where \`waterLevel\` has lately
/// reached and nothing else, so two eyes at one moment see one beach.
fn sandWetness(xz: vec2f, h: f32, t: f32) -> vec2f {
  if (h > ${SWASH_TOP}) {
    return vec2f(0.0);
  }
  let ages = array<f32, ${AGES.length}>(${AGES.map((age) => age.toFixed(1)).join(', ')});
  var damp = 1.0 - smoothstep(0.02, 0.2, h);
  var film = 0.0;
  for (var index = 0; index < ${AGES.length}; index++) {
    let age = ages[index];
    let reached = smoothstep(-0.004, 0.006, waterLevel(xz, t - age) - h);
    damp = max(damp, reached * exp(-age / ${DRYING}.0));
    film = max(film, reached * (1.0 - smoothstep(0.4, 5.0, age)));
  }
  return vec2f(damp, film);
}

/// Sun on a rough, dusty surface that throws light back the way it came:
/// what a white face of it shows per unit of sunlight.
fn sandDiffuse(normal: vec3f, sun: vec3f, view: vec3f) -> f32 {
  let toSun = max(dot(normal, sun), 0.0);
  let toEye = max(dot(normal, view), 0.0);
  let around = dot(sun, view) - toSun * toEye;
  let spread = select(1.0, max(toSun, toEye), around > 0.0);
  let back = 0.3 * pow(max(dot(sun, view), 0.0), 6.0);
  return toSun * (0.71 + 0.52 * around / max(spread, 1e-3) + back);
}

/// The sky's light on a face of the sand.
fn sandFill(normal: vec3f, sun: vec3f) -> vec3f {
  // The sky is brightest and warmest round the sun, so a face turned that way
  // stays the lighter one in shadow too.
  let sunward = max(dot(normal, normalize(vec3f(sun.x, 0.35, sun.z))), 0.0);
  return SKY_FILL * (0.42 + 0.3 * normal.y + 0.55 * vec3f(1.3, 0.95, 0.62) * sunward);
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
  let drawn = 1.0 - smoothstep(0.2, 0.55, point.alongWind / ${RIPPLES.wavelength});
  let dryness = sandDryness(point.h);
  var crest = 0.5;
  var stand = 0.65 * dryness;
  var rippleSun = 1.0;
  if (drawn > 0.0) {
    let ripples = sandRipples(xz, point.h, sun);
    slope += drawn * ripples.relief.slope;
    crest = mix(crest, ripples.crest, drawn);
    stand = ripples.stand / ${RIPPLES.height};
    rippleSun = ripples.sun;
  }
  let acrossSun = abs(dot(normalize(sun.xz), vec2f(${WIND[0]}, ${WIND[1]})));
  rippleSun = mix(1.0 - 0.42 * stand * acrossSun, rippleSun, drawn);

  let damp = smoothstep(0.22, 0.7, point.wet.x + 0.35 * (fbmd(xz / 0.35, 0x9bu, 3).x - 0.5));
  let film = point.wet.y;
  let grains = sandGrains(xz, point.px);
  let litter = sandLitter(xz, point.h, point.px, sun);
  slope += grains.slope * (1.0 - 0.6 * damp);
  slope = mix(slope, litter.slope, litter.cover);

  // Heavy dark grains gather in the troughs.
  var albedo = sandAlbedo(xz) * grains.tint * (1.0 - 0.16 * stand * (1.0 - crest));
  albedo = sandWetted(mix(albedo, litter.albedo, litter.cover), damp);

  let normal = normalize(vec3f(-slope.x, 1.0, -slope.y));
  let direct = SUN_LIGHT * (point.sun * rippleSun * litter.sun);
  let hollow = 1.0 - 0.3 * stand * (1.0 - crest);
  // Sunlit sand lights the shaded faces beside it, warm.
  let bounce = SUN_LIGHT * (point.sun * sun.y * 0.3) * vec3f(${DRY_SAND.join(', ')}) * (1.0 - 0.5 * normal.y);
  var light = albedo * (direct * sandDiffuse(normal, sun, point.view) + (sandFill(normal, sun) + bounce) * hollow);

  let half = normalize(sun + point.view);
  let dry = 1.0 - damp;
  // Dry quartz throws a broad sheen forward, toward an eye facing the sun.
  let toHalf = max(dot(normal, half), 0.0);
  let sheenLobe = 0.09 / (${Math.PI} * pow(toHalf * toHalf * (0.09 - 1.0) + 1.0, 2.0));
  let grazing = pow(1.0 - max(dot(point.view, half), 0.0), 5.0);
  light += direct * dry * max(dot(normal, sun), 0.0) * (0.04 + 0.96 * grazing) * sheenLobe * 0.6;
  light += direct * (0.2 + 0.8 * dry) * 4.0 * sandGlint(xz, normal, half, point.px)
    + direct * litter.cover * litter.gloss * pow(max(dot(normal, half), 0.0), 60.0);

  // Wet sand: a sheen where it is soaked, the sky's mirror where water stands.
  if (damp > 0.0) {
    let level = point.slope + 0.3 * hummocks.slope;
    let flat = normalize(vec3f(-level.x, 1.0, -level.y));
    let lying = normalize(mix(normal, flat, 0.55 + 0.45 * film));
    let facing = max(dot(lying, point.view), 0.0);
    let fresnel = 0.02 + 0.98 * pow(1.0 - facing, 5.0);
    let rough = mix(0.2, 0.04, film);
    let mirrored = skyRadiance(reflect(-point.view, lying), 6.0 * rough);
    let a2 = rough * rough * rough * rough;
    let nh = max(dot(lying, half), 0.0);
    let lobe = a2 / (${Math.PI} * pow(nh * nh * (a2 - 1.0) + 1.0, 2.0));
    let glare = min(direct * ${Math.PI / 4} * lobe / max(facing, 0.05), vec3f(60.0));
    let sheen = fresnel * mix(0.7 * damp * damp, 1.0, film);
    light = mix(light, mirrored, sheen) + sheen * glare * max(dot(lying, sun), 0.0);
  }
  return light;
}
`,
  SAND_RELIEF,
  SAND_GRAIN,
  SAND_COLOUR,
  WATER_LEVEL,
  SUN,
  SKY,
);
