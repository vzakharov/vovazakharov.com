// Generated from clouds-wgsl.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { OUTDOOR_FRAME } from '../outside/outdoor-frame';
import { SUN } from '../outside/sun';
import { wgsl } from '../shader/wgsl';
import { CLEAR_SKY } from './clear-sky.shader';
import { CLOUD_BODY } from './cloud-body.shader';
import { CLOUD_NOISE } from './cloud-noise.shader';
import { CLOUD_NOISE_NUMBERS } from './cloud-noise-numbers';
import { CLOUDS_NUMBERS } from './clouds-numbers';
import { SUN_GLOW } from './sun-glow.shader';

export const CLOUDS_WGSL = wgsl(
  'cube/shared/sky/clouds-wgsl',
  /* wgsl */ `
/// The share of light that crosses the clear air from the eye to a point
/// \`away\` km off and \`h\` km up: the air thins as the way climbs.
fn airBetween(away: f32, h: f32) -> vec3f {
  let up = max(h, 0.01);
  let thin =
    RAYLEIGH_SCATTER
      * RAYLEIGH_HEIGHT
      * (1.0 - exp(-up / RAYLEIGH_HEIGHT))
      / up;
  let haze = MIE_EXTINCTION * MIE_HEIGHT * (1.0 - exp(-up / MIE_HEIGHT)) / up;
  return exp(-(thin + haze) * away);
}

/// How far along a ray climbing at sine \`y\` the sea has fallen \`h\` km below it.
fn reachOf(y: f32, h: f32) -> f32 {
  let bend = (1.0 - y * y) / (2.0 * EARTH_RADIUS);
  return 2.0 * h / (y + sqrt(y * y + 4.0 * bend * h));
}

/// Henyey and Greenstein's phase function for asymmetry \`g\` at cosine \`c\`,
/// against an even scatterer's.
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
/// the cloud, \`solid\` the depth inside it and \`stood\` how far the
/// billows stand out of the body there.
fn cloudLight(
  h: f32,
  sun: vec2f,
  phase: f32,
  rise: f32,
  solid: f32,
  stood: f32,
) -> vec3f {
  let depth = sun.x;
  let square = mix(0.3, 1.0, smoothstep(-0.4, 0.9, sun.y));
  let lit =
    square * (0.28 * phase * exp(-depth) + 0.3 * exp(-0.3 * depth)) + 0.1 * exp(
      -0.1 * depth,
    );
  // The sky reaches a cloud's crown freely and its heart hardly at all.
  let open = mix(0.45, 1.0, exp(-4.0 * max(solid, 0.0)));
  // Its underside looks at the sea, its crown at the whole sky.
  let ambient =
    mix(
      HORIZON_FILL * 0.3 + GROUND_FILL,
      SKY_FILL + HORIZON_FILL * 0.2,
      sqrt(rise),
    ) * open;
  // A crease between billows sees less of the sun and of the sky than a knob.
  return
    (sunThrough(h) * lit + ambient) * mix(
      0.62,
      1.2,
      smoothstep(-0.22, 0.12, stood),
    );
}

/// One cloud along a ray from \`eye\` between \`begin\` and \`to\` km, laid
/// over what \`seen\` already holds: rgb the light so far, a what still shows.
fn marchCloud(
  cloud: Cloud,
  eye: vec3f,
  dir: vec3f,
  begin: f32,
  to: f32,
  jitter: f32,
  phase: f32,
  fog: vec3f,
  seen: ptr<function, vec4f>,
) {
  let scale = min(cloud.radius, cloud.tall);
  var gone = begin;
  // Where the ray was last outside the cloud and how far outside, and
  // whether it has stepped since it was last in.
  var before = begin;
  var outside = 0.0;
  var stepped = false;
  // The sample between a crossing's two sides, which places it.
  var between = false;
  // The sample a placed crossing sent the ray on to.
  var landing = false;
  var after = begin;
  var inside = 0.0;
  var lit = 0;
  var shown = vec3f(0.0);
  for (var i = 0; i < 48; i++) {
    if (gone >= to || (*seen).a < 0.02) {
      break;
    }
    let pace = 0.012 + 0.0022 * gone;
    let at = inField(eye + dir * gone);
    let solid = cloudSolid(cloud, at, true);
    if (between) {
      // The crossing is placed: on to a set way under the skin, where a
      // cloud has thickened enough to show its light, so texel after texel
      // samples a cloud at one depth.
      if (solid > 0.0) {
        after = gone;
        inside = solid;
      } else {
        before = gone;
        outside = solid;
      }
      gone = before + (after - before) * outside / (outside - inside) + SKIN;
      between = false;
      landing = true;
      continue;
    }
    // A ray that grazes less of a cloud than the skin's depth still shows
    // the wisp it went through.
    let wisp = landing && solid <= 0.0;
    landing = false;
    if (solid <= 0.0 && !wisp) {
      before = gone;
      outside = solid;
      stepped = true;
      gone += max(-solid * scale * 0.22, pace * (0.6 + 0.4 * jitter));
      continue;
    }
    if (stepped) {
      // Just through the surface: back to where the step crossed it.
      after = gone;
      inside = solid;
      gone = before + (after - before) * outside / (outside - solid);
      stepped = false;
      between = true;
      continue;
    }
    let deep = select(solid, 0.5 * inside, wisp);
    let water = cloudWater(cloud, at, deep);
    let tread =
      select(
        clamp(0.5 / (water * CLOUD_EXTINCTION + 1e-3), pace, 4.0 * pace),
        SKIN,
        wisp,
      );
    let rise = clamp((at.y - CLOUD_BASE) / cloud.tall, 0.0, 1.0);
    // Past its first two samples a cloud's light is its heart's, near enough.
    if (lit < 2) {
      let stood = relief;
      shown =
        cloudLight(at.y, towardSun(cloud, at, deep), phase, rise, deep, stood);
      lit++;
    }
    let kept = exp(-water * CLOUD_EXTINCTION * tread);
    let air = airBetween(gone, at.y);
    *seen =
      vec4f(
        (*seen).rgb + (*seen).a
          * (1.0 - kept)
          * (shown * air + fog * (1.0 - air)),
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
  if (inside <= 0.0) {
    return vec2f(1.0, 0.0);
  }
  let root = sqrt(inside);
  return vec2f((-b - root) / a, (-b + root) / a);
}

/// The cumulus along a ray, cell by cell of the field from the nearest.
fn cumulusAlong(dir: vec3f, jitter: f32, fog: vec3f) -> vec4f {
  var seen = vec4f(0.0, 0.0, 0.0, 1.0);
  if (dir.y <= 0.004) {
    return seen;
  }
  let eye = frame.eye.xyz / 1000.0;
  let first = reachOf(dir.y, CLOUD_BASE);
  let last = min(reachOf(dir.y, CLOUD_CEILING), CLOUD_REACH);
  if (first >= last) {
    return seen;
  }
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
      let bound =
        boundOf(
          cloud,
          vec3f(start.x, eye.y + off * off / (2.0 * EARTH_RADIUS), start.y),
          vec3f(over.x, dir.y + off * length(over) / EARTH_RADIUS, over.y),
        );
      let begin = max(bound.x, gone);
      if (begin < bound.y) {
        marchCloud(cloud, eye, dir, begin, bound.y, jitter, phase, fog, &seen);
        if (seen.a < 0.02) {
          break;
        }
      }
    }
    if (leaves >= last) {
      break;
    }
    gone = leaves;
    if (next.x < next.y) {
      next.x += stride.x;
      cell.x += ahead.x;
    } else {
      next.y += stride.y;
      cell.y += ahead.y;
    }
  }
  if (seen.a < 0.02) {
    seen.a = 0.0;
  }
  return seen;
}

/// The ice cloud's sheet where the ray crosses it: streaks, in the patches a
/// wider weather leaves them.
fn cirrusAlong(dir: vec3f, fog: vec3f) -> vec4f {
  let away = reachOf(max(dir.y, 0.0), CIRRUS_HEIGHT);
  if (dir.y <= 0.0 || away > CIRRUS_REACH) {
    return vec4f(0.0, 0.0, 0.0, 1.0);
  }
  let at = inField(frame.eye.xyz / 1000.0 + dir * away).xz / CLOUD_TILE_KM;
  let patches = cloudNoise2(at * vec2f(3.0, 4.0), 3, CLOUD_SALT + 7u);
  // Drawn out askew to the wind, which blows from the sun: streaks along it
  // would fan out of the sun. Sheared, the lattice still closes on the tile.
  let streak = vec2f((at.x + at.y) * 24.0, at.y * 9.0);
  let sheet =
    0.6 * cloudNoise2(streak, 24, CLOUD_SALT + 10u)
      + 0.28 * cloudNoise2(streak * vec2f(3.0, 4.0), 72, CLOUD_SALT + 11u)
      + 0.12 * cloudNoise2(streak * vec2f(6.0, 9.0), 144, CLOUD_SALT + 12u);
  let fade = 1.0 - smoothstep(0.5, 1.0, away / CIRRUS_REACH);
  let cover =
    0.38 * smoothstep(0.5, 0.85, sheet) * smoothstep(0.3, 0.6, patches) * fade;
  let c = dot(dir, SUN_DIR);
  let light =
    sunThrough(CIRRUS_HEIGHT) * (0.16 + 0.1 * henyeyCloud(
      c,
      0.7,
    )) + SKY_FILL * 0.5;
  let air = airBetween(away, CIRRUS_HEIGHT);
  return vec4f((light * air + fog * (1.0 - air)) * cover, 1.0 - cover);
}

/// The sky along unit \`dir\` from the eye without the sun's own disc: rgb its
/// light — the clear air, the glow round the sun, the ice cloud, the cumulus
/// marched — and a the share of the disc that would show through. \`jitter\` in
/// [0, 1) shifts the march's steps.
fn skyAlong(dir: vec3f, jitter: f32) -> vec4f {
  let fog = clearSky(dir);
  let cumulus = cumulusAlong(dir, jitter, fog);
  let cirrus = cirrusAlong(dir, fog);
  let behind = cirrus.rgb + cirrus.a * (fog + aureole(dir));
  return vec4f(cumulus.rgb + cumulus.a * behind, cumulus.a * cirrus.a);
}
`,
  OUTDOOR_FRAME,
  SUN,
  CLEAR_SKY,
  CLOUD_BODY,
  CLOUD_NOISE,
  CLOUD_NOISE_NUMBERS,
  CLOUDS_NUMBERS,
  SUN_GLOW,
);
