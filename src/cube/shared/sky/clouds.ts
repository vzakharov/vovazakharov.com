import { f32, vecf, wgsl } from '../lib/wgsl';
import { ATMOSPHERE } from './atmosphere';
import { CLOUD_TILE, CLOUDS } from './cloud-field';
import { cellsPerKm, CLOUD_NOISE } from './cloud-noise';
import { SUN_GLOW } from './sun-glow';

const { rayleigh, mie } = ATMOSPHERE;

/**
 * The most the billows add to a cloud's body or take from it, in radii: what
 * `billows` can return, and the margin a march keeps before it reads them.
 */
const BILLOW = { broad: 0.95, knobs: 0.3, fine: 0.14 } as const;
const BILLOW_REACH = (BILLOW.broad + BILLOW.knobs + BILLOW.fine) / 2;

/** How far a cloud's own noise pushes its footprint in and out, in radii². */
const HEAP = 2;

/**
 * The cumulus layer as `cloudGlance` holds it: the height its clouds are seen
 * at, in kilometres, and the share of a ray straight up through it that meets
 * one — the share of the sea the clouds stand over, about.
 */
const GLANCE = {
  height: CLOUDS.base + 1,
  thick:
    (CLOUDS.chance *
      Math.PI *
      ((CLOUDS.radius.least + CLOUDS.radius.most) / 2) ** 2 *
      0.5) /
    CLOUDS.cell ** 2,
} as const;

/** The angle one texel of the quarter-size sky spans, in radians, about. */
const SKY_TEXEL = 0.005;

/** A cloud's edge: its density is whole this many kilometres inside it. */
const EDGE = 0.18;

/**
 * The clouds as a density and the light in it, and the whole sky they stand
 * in:
 *
 * - `skyAlong(dir, jitter) -> vec4f`, the sky along unit `dir` from the eye
 *   without the sun's own disc: rgb its light — the clear air, the glow round
 *   the sun, the ice cloud, the cumulus marched — and a the share of the disc
 *   that would show through. `jitter` in [0, 1) shifts the march's steps;
 * - `cloudGlance(dir) -> vec4f`, the cumulus as a haze of the cover they
 *   make, in a dozen operations, in `cloudVeil`'s terms;
 * - `cloudVeil(dir) -> vec4f`, the cumulus along `dir` without a march, for a
 *   mirror that would not show the difference: rgb their light, a the share of
 *   what is behind them that shows.
 *
 * A cloud is a heap on a flat base: its footprint is its own noise's, so no
 * two are one shape, and it domes over that, leaning down the wind, pushed in
 * and out by three sizes of billow and frayed by a grain.
 * The body is near enough a distance for a ray to step by, so a march walks
 * to its surface and spends its samples there. The light is the sun's own
 * colour at the cloud's height through the cloud between, spread over terms
 * that stand for the scattering a single march cannot follow (Wrenninge's
 * approximation), plus the sky's.
 */
export const CLOUDS_WGSL = wgsl(
  'sky/clouds',
  /* wgsl */ `
const CLOUD_EXTINCTION = ${f32(CLOUDS.extinction)};
const CIRRUS_HEIGHT = ${f32(CLOUDS.cirrus)};
const BILLOW_REACH = ${f32(BILLOW_REACH)};
const SKIN = ${f32(Math.sqrt(EDGE / CLOUDS.extinction) * 0.7)};
/// A billow lattice never comes round within one cloud.
const BILLOW_PERIOD = 65536;

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

/// A cloud's body before its billows: over 0 inside, falling about a unit a
/// radius outward. Its footprint is its own noise cut off round its middle,
/// so no two are one shape, and it stands tallest where the footprint is
/// deepest: a heap of domes on one flat base.
fn cloudBody(cloud: Cloud, field: vec3f) -> f32 {
  let up = (field.y - CLOUD_BASE) / cloud.tall;
  // Its crown leans down the wind.
  let within = (field.xz - cloud.centre) / cloud.radius - vec2f(0.15 * max(up, 0.0), 0.0);
  let heap = 0.6 * cloudNoise2(within * 1.1 + 40.0, BILLOW_PERIOD, cloud.seed + 2u)
    + 0.4 * cloudNoise2(within * 2.7 + 40.0, BILLOW_PERIOD, cloud.seed + 3u);
  let out = dot(within, within);
  let foot = 0.75 - out + ${f32(HEAP)} * (heap - 0.5);
  // The crown falls toward the rim, so the heap's outline is a dome's.
  let crown = max(1.0 - 0.25 * out, 0.6);
  return foot - up * up / (crown * crown) - 3.0 * max(-up, 0.0);
}

/// A cloud's body with its billows at a point of the field, in the same
/// units: over 0 inside. Outside their reach it is the body's own, less the
/// reach, which is never under the truth. \`fine\` frays the surface.
fn cloudSolid(cloud: Cloud, field: vec3f, frayed: bool) -> f32 {
  let body = cloudBody(cloud, field);
  if (body < -BILLOW_REACH) { return body + BILLOW_REACH; }
  let up = clamp((field.y - CLOUD_BASE) / cloud.tall, 0.0, 1.0);
  // Billows are the cloud's own: as many across a small one as a broad one.
  let within = vec3f(field.x - cloud.centre.x, field.y - CLOUD_BASE, field.z - cloud.centre.y) / cloud.radius;
  let broad = cloudNoise(within * ${f32(CLOUDS.billow[0])}, BILLOW_PERIOD, cloud.seed) - 0.5;
  // Folded noise: round knobs with creases between, a cauliflower's.
  let knobs = abs(2.0 * cloudNoise(within * ${f32(CLOUDS.billow[1])}, BILLOW_PERIOD, cloud.seed + 1u) - 1.0) - 0.5;
  // No billow stands clear of the body it grew from.
  let held = smoothstep(-BILLOW_REACH, -0.12, body);
  let fine = abs(2.0 * cloudNoise(within * ${f32(CLOUDS.billow[1] * 2.3)}, BILLOW_PERIOD, cloud.seed + 4u) - 1.0) - 0.5;
  // A billow narrower than a couple of the sky's texels at this distance is
  // only grain.
  let texel = cloud.off * ${f32(SKY_TEXEL)} / cloud.radius;
  let knobbed = 1.0 - smoothstep(0.2, 0.6, texel * ${f32(CLOUDS.billow[1])});
  let fined = 1.0 - smoothstep(0.2, 0.6, texel * ${f32(CLOUDS.billow[1] * 2.3)});
  var solid = body + held * (${f32(BILLOW.broad)} * broad * (0.4 + 0.6 * up) + ${f32(BILLOW.knobs)} * knobs * knobbed + ${f32(BILLOW.fine)} * fine * fined);
  if (frayed && solid > -0.12 && fined > 0.0) {
    let grain = cloudNoise(field * ${cellsPerKm(CLOUDS.grain)}, ${String(CLOUDS.grain)}, CLOUD_SALT + 3u) - 0.5;
    solid += 0.03 * grain * fined / cloud.radius;
  }
  return solid;
}

/// The water at a point \`solid\` deep in a cloud, 0 to 1: all of it a little
/// way in, none under the flat base.
fn cloudWater(cloud: Cloud, field: vec3f, solid: f32) -> f32 {
  return clamp(solid * cloud.radius / ${f32(EDGE)}, 0.0, 1.0)
    * smoothstep(0.0, 0.05, field.y - CLOUD_BASE);
}

/// The cloud between a point and the sun: x its optical depth — the billows
/// just sunward of the point, then the body beyond — and y how squarely the
/// surface at the point faces the sun, −1 to 1, which a body that is near
/// enough a distance gives as its fall toward the sun.
fn towardSun(cloud: Cloud, field: vec3f, solid: f32) -> vec2f {
  let near = field + SUN_IN_FIELD * 0.09;
  let sunward = cloudSolid(cloud, near, false);
  let depth = cloudWater(cloud, near, sunward) * 0.18
    + clamp(cloudBody(cloud, field + SUN_IN_FIELD * 0.4) * 2.5, 0.0, 1.0) * 0.45
    + clamp(cloudBody(cloud, field + SUN_IN_FIELD * 1.0) * 2.5, 0.0, 1.0) * 0.9;
  return vec2f(depth * CLOUD_EXTINCTION, (solid - sunward) * cloud.radius / 0.09);
}

fn henyeyCloud(c: f32, g: f32) -> f32 {
  return (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * c, 1.5);
}

/// How much brighter than an even scatterer a cloud's first scattering is
/// along a ray at cosine \`c\` to the sun: the silver lining and the
/// brightening of a cloud seen with the sun behind the eye.
fn cloudPhase(c: f32) -> f32 {
  return 0.65 * henyeyCloud(c, 0.6) + 0.35 * henyeyCloud(c, -0.3);
}

/// What a cloud sends toward the eye from a point \`h\` km up, per unit of its
/// own extinction: the sun as \`towardSun\` found it, and the sky's fill.
/// \`phase\` is \`cloudPhase\` along the eye's ray, \`rise\` the height within
/// the cloud and \`solid\` the depth inside it.
fn cloudLight(h: f32, sun: vec2f, phase: f32, rise: f32, solid: f32) -> vec3f {
  let depth = sun.x;
  let square = mix(0.3, 1.0, smoothstep(-0.4, 0.9, sun.y));
  let lit = square * (0.28 * phase * exp(-depth) + 0.3 * exp(-0.3 * depth))
    + 0.1 * exp(-0.1 * depth);
  // The sky reaches a cloud's crown freely and its heart hardly at all.
  let open = mix(0.45, 1.0, exp(-4.0 * max(solid, 0.0)));
  // Its underside looks at the sea, its crown at the whole sky.
  let ambient = mix(HORIZON_FILL * 0.14 + GROUND_FILL, SKY_FILL + HORIZON_FILL * 0.2, sqrt(rise)) * open;
  return sunThrough(h) * lit + ambient;
}

/// One cloud along a ray from \`eye\` between \`begin\` and \`to\` km, laid
/// over what \`seen\` already holds: rgb the light so far, a what still shows.
fn marchCloud(
  cloud: Cloud, eye: vec3f, dir: vec3f, begin: f32, to: f32,
  jitter: f32, phase: f32, fog: vec3f, seen: ptr<function, vec4f>,
) {
  let scale = min(cloud.radius, cloud.tall);
  var gone = begin;
  // The last step taken outside the cloud, and how far outside it started.
  var stepped = 0.0;
  var outside = 0.0;
  for (var i = 0; i < 48; i++) {
    if (gone >= to || (*seen).a < 0.02) { break; }
    let pace = 0.012 + 0.0022 * gone;
    let field = inField(eye + dir * gone);
    var solid = cloudSolid(cloud, field, true);
    if (solid <= 0.0) {
      stepped = max(-solid * scale * 0.22, pace * (0.6 + 0.4 * jitter));
      outside = solid;
      gone += stepped;
      continue;
    }
    var at = field;
    if (stepped > 0.0) {
      // Just through the surface: close in on where the step crossed it, so
      // every ray's first sample of a cloud is its skin, at one depth from
      // texel to texel.
      var before = gone - stepped;
      for (var k = 0; k < 2; k++) {
        let mid = before + (gone - before) * outside / (outside - solid);
        let found = cloudSolid(cloud, inField(eye + dir * mid), true);
        if (found > 0.0) {
          gone = mid;
          solid = found;
        } else {
          before = mid;
          outside = found;
        }
      }
      stepped = 0.0;
      // The first sample is this far under the skin, where a cloud has
      // thickened enough to show its light.
      gone += SKIN;
      at = inField(eye + dir * gone);
      solid = cloudSolid(cloud, at, true);
      if (solid <= 0.0) { continue; }
    }
    let water = cloudWater(cloud, at, solid);
    let tread = clamp(0.5 / (water * CLOUD_EXTINCTION + 1e-3), pace, 4.0 * pace);
    let rise = clamp((at.y - CLOUD_BASE) / cloud.tall, 0.0, 1.0);
    let shown = cloudLight(at.y, towardSun(cloud, at, solid), phase, rise, solid);
    let kept = exp(-water * CLOUD_EXTINCTION * tread);
    let air = airBetween(gone, at.y);
    *seen = vec4f(
      (*seen).rgb + (*seen).a * (1.0 - kept) * (shown * air + fog * (1.0 - air)),
      (*seen).a * kept,
    );
    gone += tread;
  }
}

/// Where a ray from \`eye\`, both in the field's axes, is inside the bound of
/// \`cloud\`: x where it enters, y where it leaves, x over y where it misses.
fn boundOf(cloud: Cloud, eye: vec3f, dir: vec3f) -> vec2f {
  let reach = vec3f(cloud.radius, cloud.tall, cloud.radius) * CLOUD_BOUND;
  let begin = (eye - vec3f(cloud.centre.x, CLOUD_BASE, cloud.centre.y)) / reach;
  let along = dir / reach;
  let a = dot(along, along);
  let b = dot(begin, along);
  let inside = b * b - a * (dot(begin, begin) - 1.0);
  if (inside <= 0.0) { return vec2f(1.0, 0.0); }
  let root = sqrt(inside);
  return vec2f((-b - root) / a, (-b + root) / a);
}

/// The cumulus along a ray, cell by cell of the field from the nearest.
fn cumulusAlong(dir: vec3f, jitter: f32, fog: vec3f) -> vec4f {
  var seen = vec4f(0.0, 0.0, 0.0, 1.0);
  if (dir.y <= 0.004) { return seen; }
  let eye = frame.eye.xyz / 1000.0;
  let first = reachOf(dir.y, CLOUD_BASE);
  let last = min(reachOf(dir.y, CLOUD_CEILING), CLOUD_REACH);
  if (first >= last) { return seen; }
  let phase = cloudPhase(dot(dir, SUN_DIR));

  // The ray over the sea, in the field's axes, per kilometre of itself.
  let over = vec2f(dot(dir.xz, WIND_AXIS), dot(dir.xz, WIND_SIDE));
  let start = inField(eye).xz;
  let entry = start + over * first;
  var cell = vec2i(floor(entry / CLOUD_CELL));
  let ahead = vec2i(sign(over));
  let stride = CLOUD_CELL / max(abs(over), vec2f(1e-6));
  var next = (vec2f(cell + max(ahead, vec2i(0))) * CLOUD_CELL - entry) / over;
  next = select(next, vec2f(1e9), abs(over) < vec2f(1e-6));
  var gone = first;
  for (var i = 0; i < 44; i++) {
    let leaves = first + min(next.x, next.y);
    var cloud = cloudIn(cell);
    if (cloud.radius > 0.0) {
      // The sea has fallen this far under the cloud, and still falls.
      let off = length(cloud.centre - start);
      cloud.off = off;
      let bound = boundOf(
        cloud,
        vec3f(start.x, eye.y + off * off / (2.0 * EARTH_RADIUS), start.y),
        vec3f(over.x, dir.y + off * length(over) / EARTH_RADIUS, over.y),
      );
      let begin = max(bound.x, gone);
      if (begin < bound.y) {
        marchCloud(cloud, eye, dir, begin, bound.y, jitter, phase, fog, &seen);
        if (seen.a < 0.02) { break; }
      }
    }
    if (leaves >= last) { break; }
    gone = leaves;
    if (next.x < next.y) {
      next.x += stride.x;
      cell.x += ahead.x;
    } else {
      next.y += stride.y;
      cell.y += ahead.y;
    }
  }
  if (seen.a < 0.02) { seen.a = 0.0; }
  return seen;
}

/// The ice cloud's sheet where the ray crosses it: streaks, in the patches a
/// wider weather leaves them.
fn cirrusAlong(dir: vec3f, fog: vec3f) -> vec4f {
  let away = reachOf(max(dir.y, 0.0), CIRRUS_HEIGHT);
  if (dir.y <= 0.0 || away > ${f32(CLOUDS.cirrusReach)}) { return vec4f(0.0, 0.0, 0.0, 1.0); }
  let at = inField(frame.eye.xyz / 1000.0 + dir * away).xz / ${f32(CLOUD_TILE)};
  let patches = cloudNoise2(at * vec2f(3.0, 4.0), 3, CLOUD_SALT + 7u);
  // Drawn out askew to the wind, which blows from the sun: streaks along it
  // would fan out of the sun. Sheared, the lattice still closes on the tile.
  let streak = vec2f((at.x + at.y) * 24.0, at.y * 9.0);
  let sheet = 0.6 * cloudNoise2(streak, 24, CLOUD_SALT + 10u)
    + 0.28 * cloudNoise2(streak * vec2f(3.0, 4.0), 72, CLOUD_SALT + 11u)
    + 0.12 * cloudNoise2(streak * vec2f(6.0, 9.0), 144, CLOUD_SALT + 12u);
  // Fibres, where the sheet is near enough overhead to show them.
  let fibre = (cloudNoise2(streak * vec2f(12.0, 2.0), 288, CLOUD_SALT + 13u) - 0.5)
    * (1.0 - smoothstep(14.0, 40.0, away));
  let fade = 1.0 - smoothstep(0.5, 1.0, away / ${f32(CLOUDS.cirrusReach)});
  let cover = 0.38 * smoothstep(0.5, 0.82, sheet + 0.14 * fibre) * smoothstep(0.3, 0.6, patches) * fade;
  let c = dot(dir, SUN_DIR);
  let light = sunThrough(CIRRUS_HEIGHT) * (0.16 + 0.1 * henyeyCloud(c, 0.7)) + SKY_FILL * 0.5;
  let air = airBetween(away, CIRRUS_HEIGHT);
  return vec4f((light * air + fog * (1.0 - air)) * cover, 1.0 - cover);
}

fn skyAlong(dir: vec3f, jitter: f32) -> vec4f {
  let fog = clearSky(dir);
  let cumulus = cumulusAlong(dir, jitter, fog);
  let cirrus = cirrusAlong(dir, fog);
  let behind = cirrus.rgb + cirrus.a * (fog + aureole(dir));
  return vec4f(cumulus.rgb + cumulus.a * behind, cumulus.a * cirrus.a);
}

/// The cumulus along \`dir\` as the share of the sky they hide, for a mirror
/// too rough to tell one cloud from the next: thicker toward the horizon,
/// where a ray is longest in their layer, and lost in the air far off. rgb
/// their light, a the share of what is behind them that shows.
fn cloudGlance(dir: vec3f) -> vec4f {
  let y = max(dir.y, 0.02);
  let hidden = 0.7 * (1.0 - exp(-${f32(GLANCE.thick)} / y));
  let air = airBetween(${f32(GLANCE.height)} / y, ${f32(GLANCE.height)});
  // Looking away from the sun a cloud shows its lit flank, toward it its shade.
  let lit = 0.22 - 0.12 * dot(dir, SUN_DIR);
  let shown = sunThrough(${f32(GLANCE.height)}) * lit + SKY_FILL * 0.6 + HORIZON_FILL * 0.1;
  let cover = hidden * max(air.r, max(air.g, air.b));
  return vec4f(shown * cover, 1.0 - cover);
}

fn cloudVeil(dir: vec3f) -> vec4f {
  var seen = vec4f(0.0, 0.0, 0.0, 1.0);
  if (dir.y <= 0.004) { return seen; }
  let eye = frame.eye.xyz / 1000.0;
  let fog = clearSky(dir);
  let phase = cloudPhase(dot(dir, SUN_DIR));
  let start = inField(eye).xz;
  let over = vec2f(dot(dir.xz, WIND_AXIS), dot(dir.xz, WIND_SIDE));
  var last = vec2i(1 << 30);
  for (var i = 0; i < 4; i++) {
    let level = CLOUD_BASE + 0.15 + 0.6 * f32(i);
    let reached = reachOf(dir.y, level);
    if (reached > CLOUD_REACH) { continue; }
    let cell = vec2i(floor(inField(eye + dir * reached).xz / CLOUD_CELL));
    if (all(cell == last)) { continue; }
    last = cell;
    let cloud = cloudIn(cell);
    if (cloud.radius <= 0.0) { continue; }
    // Where the ray passes the cloud's middle is where it is deepest in it.
    let away = max(dot(cloud.centre - start, over) / max(dot(over, over), 1e-6), 0.0);
    let field = inField(eye + dir * away);
    let h = field.y;
    let body = cloudBody(cloud, field);
    let cover = smoothstep(-0.05, 0.25, body);
    // A flank is lit where the body thins toward the sun.
    let sunward = cloudBody(cloud, field + SUN_IN_FIELD * 0.5 * cloud.radius);
    let depth = 14.0 * clamp(0.5 + sunward, 0.0, 1.0);
    let rise = clamp((h - CLOUD_BASE) / cloud.tall, 0.0, 1.0);
    let shown = cloudLight(h, vec2f(depth, body - sunward), phase, rise, 0.2);
    let air = airBetween(away, h);
    seen = vec4f(seen.rgb + seen.a * cover * (shown * air + fog * (1.0 - air)), seen.a * (1.0 - cover));
  }
  return seen;
}
`,
  SUN_GLOW,
  CLOUD_NOISE,
);
