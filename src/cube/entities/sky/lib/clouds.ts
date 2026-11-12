import { AIR } from '../model/atmosphere';
import { CLOUDS, LANE, WIND_AXIS } from '../model/cloud-field';
import { HORIZON_FILL, SKY_FILL, SUN_WHITE } from '../model/sun';
import { f, vec3 } from './air';

/**
 * A cumulus field as a density and the light in it. Needs \`AIR_WGSL\`, the
 * noise textures (\`shape\`, \`grain\`, \`weather\`, \`noiseSampler\`) and
 * \`drifted\`: x the kilometres the field has drifted down the wind, y the
 * tiles its grain has risen.
 *
 * The shapes follow Schneider's Nubis: a weather map says where a cloud
 * stands and how tall, a height profile rounds it, billows of Perlin–Worley
 * noise are cut back to that cover, and fine cells wear the edge. The light
 * is the sun's own colour at the cloud's height through an optical depth
 * marched toward it, spread over octaves that stand for the scattering a
 * single march cannot follow (Wrenninge's approximation), plus the sky's.
 */
export const CLOUD_WGSL = /* wgsl */ `
const CLOUD_BASE = ${f(CLOUDS.base)};
const CLOUD_TOP = ${f(CLOUDS.top)};
const CLOUD_TILE = ${f(CLOUDS.tile)};
const CLOUD_REACH = ${f(CLOUDS.reach)};
const CLOUD_EXTINCTION = ${f(CLOUDS.extinction)};
const WIND_AXIS = vec2f(${f(WIND_AXIS[0])}, ${f(WIND_AXIS[1])});
const WIND_SIDE = vec2f(${f(-WIND_AXIS[1])}, ${f(WIND_AXIS[0])});
const SKY_AMBIENT = ${vec3(SKY_FILL)};
const HORIZON_AMBIENT = ${vec3(HORIZON_FILL)};

fn remap(x: f32, a: f32, b: f32, c: f32, d: f32) -> f32 {
  return c + (x - a) / (b - a) * (d - c);
}

/// A point \`at\` km from the eye, as the field holds it: along the wind
/// where it started the hour, up, across the wind.
fn inField(at: vec3f, h: f32) -> vec3f {
  return vec3f(dot(at.xz, WIND_AXIS) - drifted.x, h, dot(at.xz, WIND_SIDE));
}

/// The weather over a point of the field: x the cover there, y how tall the
/// cloud grows, z the unevenness of its base.
fn weatherAt(field: vec3f, away: f32) -> vec3f {
  let w = textureSampleLevel(weather, noiseSampler, field.xz / CLOUD_TILE, 0.0).rgb;
  // The lane is the island's, not the field's: it stands still while the
  // clouds go down it, open where the sun's beam crosses the slab and for
  // a way either side of the island, closing far off.
  let toSun = -(field.x + drifted.x);
  let open = smoothstep(${f(LANE.shut.behind)}, ${f(LANE.open.behind)}, toSun)
    * (1.0 - smoothstep(${f(LANE.open.ahead)}, ${f(LANE.shut.ahead)}, toSun));
  let clear = ${f(CLOUDS.lane.clear)} * open;
  let edge = clear + ${f(CLOUDS.lane.full - CLOUDS.lane.clear)} * (0.35 + 0.65 * w.b);
  let lane = mix(1.0, smoothstep(clear, edge, abs(field.z)), smoothstep(0.0, 0.2, open));
  let far = 1.0 - smoothstep(0.75 * CLOUD_REACH, CLOUD_REACH, away);
  return vec3f(smoothstep(0.52, 0.9, w.r) * lane * far, smoothstep(0.3, 0.7, w.g), w.b);
}

/// The cloud's density at a point of the field under weather \`w\`, 0 to 1.
/// \`lod\` blurs the noise to the march's stride; \`fine\` wears the edge.
fn cloudDensity(field: vec3f, w: vec3f, lod: f32, fine: bool) -> f32 {
  if (w.x < 0.01) { return 0.0; }
  let base = CLOUD_BASE + 0.3 * (w.z - 0.5);
  // A cloud is tallest over the middle of its cell: a dome, not a slab.
  let top = base + (CLOUD_TOP - CLOUD_BASE - 0.3) * (0.3 + 0.7 * w.y) * mix(0.45, 1.0, w.x);
  let rise = (field.y - base) / (top - base);
  if (rise <= 0.0 || rise >= 1.0) { return 0.0; }
  // Flat below, fullest a quarter of the way up, drawn in toward the top.
  let profile = smoothstep(0.0, 0.07, rise) * (1.0 - smoothstep(0.3, 1.0, rise) * 0.85);
  let at = field / (CLOUD_TILE / ${f(CLOUDS.shapeTiles)});
  let n = textureSampleLevel(shape, noiseSampler, at, lod);
  let worn = n.g * 0.625 + n.b * 0.25 + n.a * 0.125;
  let billow = remap(n.r, worn - 1.0, 1.0, 0.0, 1.0);
  var density = remap(billow * profile, 1.0 - w.x, 1.0, 0.0, 1.0) * w.x;
  if (density <= 0.0) { return 0.0; }
  if (fine) {
    let fineAt = field / (CLOUD_TILE / ${f(CLOUDS.grainTiles)}) - vec3f(0.0, drifted.y, 0.0);
    let cells = textureSampleLevel(grain, noiseSampler, fineAt, lod).r;
    // Wisps hang under a cloud, cauliflower stands on it.
    let wear = mix(cells, 1.0 - cells, clamp(rise * 4.0, 0.0, 1.0));
    density = remap(density, wear * 0.32 * (1.0 - density), 1.0, 0.0, 1.0);
  }
  return clamp(density, 0.0, 1.0) * mix(0.55, 1.0, rise);
}

/// The height over the sea of a point \`at\` km from the eye.
fn heightOf(at: vec3f) -> f32 {
  return length(at + vec3f(0.0, EYE_RADIUS, 0.0)) - RG;
}

/// The cloud between a point and the sun, as an optical depth.
fn depthToSun(at: vec3f, sun: vec3f, lod: f32) -> f32 {
  var depth = 0.0;
  var stride = 0.08;
  var gone = 0.0;
  for (var i = 0; i < 5; i++) {
    let p = at + sun * (gone + stride * 0.5);
    let field = inField(p, heightOf(p));
    let w = weatherAt(field, length(p.xz));
    depth += cloudDensity(field, w, lod + f32(i) * 0.7, i < 1) * stride;
    gone += stride;
    stride *= 2.0;
  }
  return depth * CLOUD_EXTINCTION;
}

fn henyeyCloud(c: f32, g: f32) -> f32 {
  return (1.0 - g * g) / (4.0 * PI * pow(1.0 + g * g - 2.0 * g * c, 1.5));
}

/// What a cloud sends toward the eye from a point \`h\` km up, per unit of its
/// own extinction: the sun through \`depth\` of cloud, and the sky's fill.
/// \`towardSun\` is the cosine between the eye's ray and the sun, \`sunMu\`
/// the sun's own cosine there, \`rise\` the height within the slab.
fn cloudLight(h: f32, depth: f32, towardSun: f32, sunMu: f32, rise: f32, density: f32) -> vec3f {
  // A white face square to the sun up there: a cloud's sunlit flank is about that.
  let sun = ${f(SUN_WHITE)} * sunTransmittance(RG + h, sunMu);
  var lit = 0.0;
  var weight = 1.0;
  var thin = 1.0;
  var blunt = 1.0;
  for (var octave = 0; octave < 5; octave++) {
    let phase = mix(henyeyCloud(towardSun, 0.82 * blunt), henyeyCloud(towardSun, -0.25 * blunt), 0.3);
    lit += weight * 4.0 * PI * phase * exp(-depth * thin);
    weight *= 0.5;
    thin *= 0.45;
    blunt *= 0.5;
  }
  // The sky reaches a cloud's crown freely and its heart hardly at all.
  let open = mix(0.35, 1.0, rise) * exp(-density * 1.6);
  let ambient = (SKY_AMBIENT * (0.3 + 0.7 * rise) + HORIZON_AMBIENT * 0.5) * 0.4 * open;
  return sun * lit * 0.6 + ambient;
}

/// The share of light that crosses the clear air from the eye to a point
/// \`away\` km off and \`h\` km up: the air thins as the way climbs.
fn airBetween(away: f32, h: f32) -> vec3f {
  let up = max(h, 0.01);
  let rayleigh = RAYLEIGH * ${f(AIR.rayleigh.height)} * (1.0 - exp(-up / ${f(AIR.rayleigh.height)})) / up;
  let haze = (MIE + MIE_ABSORB) * ${f(AIR.mie.height)} * (1.0 - exp(-up / ${f(AIR.mie.height)})) / up;
  return exp(-(rayleigh + haze) * away);
}
`;
