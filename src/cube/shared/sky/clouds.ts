import { f32, vecf, wgsl } from '../lib/wgsl';
import { AIR } from './atmosphere';
import { CLEAR_SKY } from './clear-sky';
import { CLOUDS } from './cloud-field';
import { CLOUD_NOISE } from './cloud-noise';

const SECONDS_IN_HOUR = 3600;
const cellsPerKm = (cells: number): string => f32(cells / CLOUDS.tile);
const period = (cells: number, up: number): string =>
  `vec2i(${String(cells)}, ${String(up)})`;
/** Levels a billow lattice repeats over upward: more than the slab holds. */
const BILLOW_UP = 64;

const { rayleigh, mie } = AIR;

/**
 * A cumulus field as a density and the light in it:
 *
 * - `cloudsAlong(dir, jitter) -> vec4f`, the clouds along unit `dir` from the
 *   eye: rgb the light they send, a the share of what is behind them that
 *   still shows. `jitter` in [0, 1) shifts the march's steps;
 * - `cloudVeil(dir, lod) -> vec4f`, the same in three samples, for a
 *   reflection or fill that would not see the difference.
 *
 * The shapes follow Schneider's Nubis: a cover says where a cloud stands and
 * how tall, a height profile rounds it, billows cut it back, and grain wears
 * the edge. The light is the sun's own colour at the cloud's height through
 * an optical depth marched toward it, spread over octaves that stand for the
 * scattering a single march cannot follow (Wrenninge's approximation), plus
 * the sky's.
 */
export const CLOUDS_WGSL = wgsl(
  'sky/clouds',
  /* wgsl */ `
const CLOUD_EXTINCTION = ${f32(CLOUDS.extinction)};
const CIRRUS_HEIGHT = ${f32(CLOUDS.cirrus)};

fn remap(x: f32, a: f32, b: f32, c: f32, d: f32) -> f32 {
  return c + (x - a) / (b - a) * (d - c);
}

/// The cloud's density at a point of the field under weather \`w\`, 0 to 1;
/// \`fine\` wears the edge with the grain.
fn cloudDensity(field: vec3f, w: vec2f, fine: bool) -> f32 {
  if (w.x < 0.01) { return 0.0; }
  // A cloud is tallest over the middle of its cell: a dome, not a slab.
  let top = CLOUD_BASE + (CLOUD_TOP - CLOUD_BASE) * (0.25 + 0.75 * w.y) * mix(0.45, 1.0, w.x);
  let rise = (field.y - CLOUD_BASE) / (top - CLOUD_BASE);
  if (rise <= 0.0 || rise >= 1.0) { return 0.0; }
  // Flat below, full to half its height, drawn in toward the top.
  let profile = smoothstep(0.0, 0.07, rise) * (1.0 - smoothstep(0.4, 1.0, rise) * 0.9);
  let billow = mix(
    cloudNoise(field * ${cellsPerKm(CLOUDS.billow[0])}, ${period(CLOUDS.billow[0], BILLOW_UP)}, CLOUD_SALT + 4u),
    cloudNoise(field * ${cellsPerKm(CLOUDS.billow[1])}, ${period(CLOUDS.billow[1], BILLOW_UP)}, CLOUD_SALT + 5u),
    0.38,
  );
  var density = remap(profile * smoothstep(0.1, 0.8, billow), 1.0 - w.x, 1.0, 0.0, 1.0) * w.x;
  if (density <= 0.0) { return 0.0; }
  if (fine) {
    let risen = frame.clock.x * ${f32(CLOUDS.grainRise / SECONDS_IN_HOUR)};
    let cells = cloudNoise(
      field * ${cellsPerKm(CLOUDS.grain)} - vec3f(0.0, risen, 0.0),
      ${period(CLOUDS.grain, CLOUDS.grainRise)},
      CLOUD_SALT + 6u,
    );
    // Wisps hang under a cloud, cauliflower stands on it.
    let wear = mix(cells, 1.0 - cells, clamp(rise * 4.0, 0.0, 1.0));
    density = remap(density, wear * 0.5 * (1.0 - density), 1.0, 0.0, 1.0);
  }
  // A cumulus has an edge: its water is all there a few metres in.
  return clamp(density * 3.0, 0.0, 1.0) * mix(0.55, 1.0, rise);
}

fn densityAt(at: vec3f, fine: bool) -> f32 {
  let field = inField(at);
  if (field.y < CLOUD_BASE || field.y > CLOUD_TOP) { return 0.0; }
  return cloudDensity(field, weatherAt(field, 3), fine);
}

/// The cloud between a point and the sun, as an optical depth.
fn depthToSun(at: vec3f) -> f32 {
  var depth = 0.0;
  var stride = 0.09;
  var gone = 0.0;
  for (var i = 0; i < 4; i++) {
    depth += densityAt(at + SUN_DIR * (gone + stride * 0.5), false) * stride;
    gone += stride;
    stride *= 2.2;
  }
  return depth * CLOUD_EXTINCTION;
}

fn henyeyCloud(c: f32, g: f32) -> f32 {
  return (1.0 - g * g) / (4.0 * PI * pow(1.0 + g * g - 2.0 * g * c, 1.5));
}

/// What a cloud sends toward the eye from a point \`h\` km up, per unit of its
/// own extinction: the sun through \`depth\` of cloud, and the sky's fill.
/// \`towardSun\` is the cosine between the eye's ray and the sun, \`rise\` the
/// height within the slab.
fn cloudLight(h: f32, depth: f32, towardSun: f32, rise: f32, density: f32) -> vec3f {
  var lit = 0.0;
  var weight = 1.0;
  var thin = 1.0;
  var blunt = 1.0;
  for (var octave = 0; octave < 5; octave++) {
    let phase = mix(henyeyCloud(towardSun, 0.82 * blunt), henyeyCloud(towardSun, -0.25 * blunt), 0.3);
    lit += weight * 4.0 * PI * phase * exp(-depth * thin);
    weight *= 0.5;
    thin *= 0.4;
    blunt *= 0.5;
  }
  // The sky reaches a cloud's crown freely and its heart hardly at all.
  let open = mix(0.35, 1.0, rise) * exp(-density * 1.6);
  let ambient = (SKY_FILL * (0.3 + 0.7 * rise) + HORIZON_FILL * 0.5) * 0.7 * open;
  return sunThrough(h) * lit * 0.6 + ambient;
}

/// The share of light that crosses the clear air from the eye to a point
/// \`away\` km off and \`h\` km up: the air thins as the way climbs.
fn airBetween(away: f32, h: f32) -> vec3f {
  let up = max(h, 0.01);
  let thin = ${vecf(rayleigh.scatter)} * ${f32(rayleigh.height)} * (1.0 - exp(-up / ${f32(rayleigh.height)})) / up;
  let haze = ${vecf(mie.scatter.map((s, c) => s + (mie.absorb[c] ?? 0)))} * ${f32(mie.height)} * (1.0 - exp(-up / ${f32(mie.height)})) / up;
  return exp(-(thin + haze) * away);
}

/// How far along a ray climbing at sine \`y\` the sea has fallen \`h\` km below it.
fn reachOf(y: f32, h: f32) -> f32 {
  let bend = (1.0 - y * y) / (2.0 * EARTH_RADIUS);
  return 2.0 * h / (y + sqrt(y * y + 4.0 * bend * h));
}

/// The ice cloud's sheet where the ray crosses it: streaks along the wind.
fn cirrusAlong(dir: vec3f, fog: vec3f) -> vec4f {
  let away = reachOf(dir.y, CIRRUS_HEIGHT);
  let field = inField(dir * away);
  let streak = field.xz * vec2f(${cellsPerKm(6)}, ${cellsPerKm(30)});
  let sheet = cloudNoise2(streak, 6, CLOUD_SALT + 7u) * 0.6
    + cloudNoise2(streak * vec2f(3.0, 4.0), 18, CLOUD_SALT + 8u) * 0.28
    + cloudNoise2(streak * vec2f(12.0, 16.0), 72, CLOUD_SALT + 9u) * 0.12;
  let fade = 1.0 - smoothstep(0.6 * CLOUD_REACH, 1.6 * CLOUD_REACH, away);
  let cover = 0.5 * smoothstep(0.5, 0.85, sheet) * fade;
  let forward = henyeyCloud(dot(dir, SUN_DIR), 0.7) * 4.0 * PI;
  let light = sunThrough(CIRRUS_HEIGHT) * (0.25 + 0.2 * forward) + SKY_FILL * 0.35;
  let air = airBetween(away, CIRRUS_HEIGHT);
  return vec4f((light * air + fog * (1.0 - air)) * cover, 1.0 - cover);
}

fn cloudsAlong(dir: vec3f, jitter: f32) -> vec4f {
  if (dir.y <= 0.002) { return vec4f(0.0, 0.0, 0.0, 1.0); }
  let fog = clearSky(dir);
  let eye = frame.eye.xyz / 1000.0;
  let towardSun = dot(dir, SUN_DIR);
  let last = min(reachOf(dir.y, CLOUD_TOP), CLOUD_REACH);
  var gone = reachOf(dir.y, CLOUD_BASE);
  var light = vec3f(0.0);
  var through = 1.0;
  var treading = 0;
  gone += jitter * max(0.1, 0.03 * gone);
  for (var i = 0; i < 128; i++) {
    if (gone >= last || through < 0.01) { break; }
    let seek = max(0.1, 0.03 * gone);
    let at = eye + dir * gone;
    let density = densityAt(at, treading > 0);
    if (treading == 0) {
      if (density > 0.0) {
        // Something stands in this stride: go back and walk it finely.
        gone -= seek * (1.0 - 0.17 * jitter);
        treading = 8;
      } else {
        gone += seek;
      }
      continue;
    }
    let tread = clamp(0.4 / max(density * CLOUD_EXTINCTION, 1e-3), seek * 0.06, seek * 0.2);
    if (density > 0.0) {
      treading = 8;
      let h = heightOf(at);
      let rise = clamp((h - CLOUD_BASE) / (CLOUD_TOP - CLOUD_BASE), 0.0, 1.0);
      let shown = cloudLight(h, depthToSun(at), towardSun, rise, density);
      let kept = exp(-density * CLOUD_EXTINCTION * tread);
      let air = airBetween(gone, h);
      light += through * (1.0 - kept) * (shown * air + fog * (1.0 - air));
      through *= kept;
    } else {
      treading -= 1;
    }
    gone += tread;
  }
  if (through < 0.01) { through = 0.0; }
  let cirrus = cirrusAlong(dir, fog);
  return vec4f(light + through * cirrus.rgb, through * cirrus.a);
}

fn cloudVeil(dir: vec3f, lod: f32) -> vec4f {
  if (dir.y <= 0.002) { return vec4f(0.0, 0.0, 0.0, 1.0); }
  let fog = clearSky(dir);
  let eye = frame.eye.xyz / 1000.0;
  let octaves = select(2, 1, lod > 3.0);
  var light = vec3f(0.0);
  var through = 1.0;
  for (var i = 0; i < 3; i++) {
    let h = mix(CLOUD_BASE, CLOUD_TOP, (f32(i) + 0.5) / 3.0 * 0.7);
    let away = reachOf(dir.y, h);
    if (away > CLOUD_REACH) { break; }
    let field = inField(eye + dir * away);
    let w = weatherAt(field, octaves);
    let top = CLOUD_BASE + (CLOUD_TOP - CLOUD_BASE) * (0.25 + 0.75 * w.y) * mix(0.45, 1.0, w.x);
    let cover = smoothstep(0.05, 0.5, w.x) * step(h, top);
    let rise = clamp((h - CLOUD_BASE) / (CLOUD_TOP - CLOUD_BASE), 0.0, 1.0);
    // The flank a ray from the sun's side meets is lit through much of the cloud, the far one through little.
    let depth = mix(0.7, 6.0, 0.5 + 0.5 * dot(dir, SUN_DIR)) * (1.5 - rise);
    let shown = cloudLight(h, depth, dot(dir, SUN_DIR), rise, 0.5);
    let air = airBetween(away, h);
    light += through * cover * (shown * air + fog * (1.0 - air));
    through *= 1.0 - cover;
  }
  return vec4f(light, through);
}
`,
  CLEAR_SKY,
  CLOUD_NOISE,
);
