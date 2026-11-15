import { assemble, vecf } from '@/scene/shared/shader';

import { SHORE_CUSPED, SHORE_LEVEL, WETNESS } from '@/nature/shared/shore';
import { DEEP_SPEED, HOUR_SECONDS } from '@/nature/shared/swell';

import type { Vec3 } from '@/island/shared/globe';

import { RIPPLE_TABLE_WGSL } from './ripple-table';

/**
 * The way the open swell runs, a unit vector in space: its crests are the
 * planes square to it, so it rolls strongest where it lies along the sea and
 * dies out toward the two points where it stands up out of it.
 */
const SWELL_AXIS: Vec3 = [0.6, 0.25, -0.758_287_5];

/** Along the swell's crests: square to its axis and level at the equator. */
const SWELL_CREST: Vec3 = (() => {
  const [x, , z] = SWELL_AXIS;
  const size = Math.hypot(x, z);
  return [-z / size, 0, x / size];
})();

/** How far along a crest the cusps' pattern is carried before it wraps, metres: millimetres fine in a float. */
const CREST_WRAPS = 65_536;

const along = (eye: Vec3, axis: Vec3) =>
  eye[0] * axis[0] + eye[1] * axis[1] + eye[2] * axis[2];

const wrapped = (value: number, period: number) =>
  ((value % period) + period) % period;

/**
 * The swell at `eye` (metres from the planet's centre), `seconds` into the
 * hour, taken in float64 so a shader adds only a fragment's distance from the
 * eye: its clock — the hour's seconds less those the swell takes to reach the
 * eye — and the eye's place along the crests.
 */
export const swellAt = (eye: Vec3, seconds: number): [number, number] => [
  wrapped(seconds - along(eye, SWELL_AXIS) / DEEP_SPEED, HOUR_SECONDS),
  wrapped(along(eye, SWELL_CREST), CREST_WRAPS),
];

/**
 * The sea's surface as WGSL functions of their arguments alone — no uniform,
 * no binding — so any renderer that hands them a place, a clock and a sun can
 * draw with them.
 */
const SEA_WGSL = `
const SEA_TAU = 6.283185307;
const SEA_SWELL_AXIS = ${vecf(SWELL_AXIS)};
const SEA_SWELL_CREST = ${vecf(SWELL_CREST)};

/**
 * The wind over direction \`unit\` from the planet's centre, metres a second
 * along the ground: easterly trades by the equator, westerlies at mid
 * latitudes, calmer where the belts meet, the whole of it bent and gusted by a
 * slow field so no two coasts take the same wind.
 */
fn windAt(unit: vec3f) -> vec3f {
  let eastward = cross(vec3f(0.0, 1.0, 0.0), unit);
  let off = length(eastward);
  let east = eastward / max(off, 1e-4);
  let north = cross(unit, east);
  let latitude = asin(clamp(unit.y, -1.0, 1.0));
  let belt = cos(3.0 * latitude);
  let bend =
    sin(dot(unit, vec3f(3.1, 1.7, -2.3)) * 2.0) +
    0.6 * sin(dot(unit, vec3f(-1.9, 4.3, 2.9)) * 3.0 + 1.3);
  let turn = 0.5 * bend;
  let zonal = -belt;
  let meridional = -0.35 * sin(2.0 * latitude);
  let heading = normalize(
    east * (zonal * cos(turn) - meridional * sin(turn)) +
    north * (zonal * sin(turn) + meridional * cos(turn)) +
    east * 0.05,
  );
  let speed = 7.5 * (0.55 + 0.45 * abs(belt)) * (1.0 + 0.2 * bend);
  return heading * speed * min(1.0, off * 8.0);
}

/** The ripples' slope along the sea, and the mean square slope of the waves a pixel hides. */
struct Rippled {
  slope: vec3f,
  hidden: f32,
}

/** The share of the sea's slope variance one wave of the table carries, on average. */
const RIPPLE_SHARE = 0.065;

/**
 * The wind sea at \`place\` — a position modulo \`RIPPLE_PERIOD\` on each axis —
 * under \`wind\`, seen by a pixel \`footprint\` metres wide. Slope variance is
 * Cox and Munk's for the wind's speed, spread evenly over the bands shorter
 * than the wind's own longest wave and leaning downwind. A wave under a few
 * pixels long is taken out of the slope and into \`hidden\`.
 */
fn ripplesAt(place: vec3f, up: vec3f, wind: vec3f, footprint: f32, seconds: f32) -> Rippled {
  let speed = length(wind);
  let heading = wind / max(speed, 1e-3);
  let variance = 0.003 + 0.00512 * speed;
  let longest = 0.9 * speed * speed;
  var slope = vec3f(0.0);
  var hidden = 0.0;
  for (var i = 0; i < RIPPLE_COUNT; i++) {
    let wave = RIPPLES[i];
    let scale = exp2(f32(i / RIPPLES_PER_BAND)) / RIPPLE_PERIOD;
    let number = SEA_TAU * scale * wave.xyz;
    let flat = number - up * dot(number, up);
    let along = length(flat);
    let toward = flat / max(along, 1e-6);
    let lying = along / length(number);
    let downwind = max(dot(toward, heading), 0.0);
    let metres = SEA_TAU / max(along, 1e-6);
    let share =
      RIPPLE_SHARE * variance * lying * lying *
      (0.12 + 0.88 * downwind * downwind) *
      (1.0 - smoothstep(0.6 * longest, 1.2 * longest, metres));
    let seen = smoothstep(2.0, 6.0, metres / footprint);
    let phase = SEA_TAU * dot(wave.xyz, fract(place * scale)) - RIPPLE_PACES[i] * seconds + wave.w;
    slope += toward * (sqrt(2.0 * share) * seen * cos(phase));
    hidden += share * (1.0 - seen * seen);
  }
  return Rippled(slope, hidden);
}

/** Fresnel's reflectance of water for a ray \`cosine\` off the normal. */
fn seaFresnel(cosine: f32) -> f32 {
  return 0.02 + 0.98 * pow(1.0 - clamp(cosine, 0.0, 1.0), 5.0);
}

/**
 * The sky's light from \`toward\`, between \`horizon\`'s colour and a deeper
 * zenith, with the sun's glow about it. A stand-in for the sky's own model.
 */
fn seaSky(toward: vec3f, up: vec3f, sun: vec3f, horizon: vec3f) -> vec3f {
  let lift = clamp(dot(toward, up), 0.0, 1.0);
  let zenith = horizon * vec3f(0.42, 0.62, 0.95);
  let glow = pow(max(dot(toward, sun), 0.0), 12.0);
  return mix(horizon, zenith, pow(lift, 0.5)) + vec3f(1.0, 0.82, 0.6) * (0.35 * glow);
}

/** What the sun lays on the water's body per unit of its height's sine, and the sky by day and by night. */
const SEA_SUNLIGHT = vec3f(1.47, 1.42, 1.3);
const SEA_DAY_SKYLIGHT = vec3f(0.22, 0.26, 0.3);
const SEA_NIGHT_SKYLIGHT = vec3f(0.04, 0.05, 0.075);

/** How far the sea's haze reaches before a thing is two thirds gone, metres. */
const SEA_HAZE_REACH = 60000.0;

/**
 * How much of a wave's throw the shore keeps at a point \`world\` from the
 * eye: its cusps, which run the swash up the sand in tongues.
 */
fn seaTongue(world: vec3f, swell: vec2f) -> f32 {
  return cusped(swell.y + dot(world, SEA_SWELL_CREST));
}

/**
 * The swell's level, metres about the still sea, at a point \`world\` from an
 * eye where the swell reads \`swell\` — its clock, and the eye's place along
 * the crests — over a floor at \`bed\`: the open
 * swell, its surf, and its sheet up the sand. It dies out with distance, past
 * where a mesh's vertices could carry it.
 */
fn seaSwellAt(world: vec3f, bed: f32, swell: vec2f) -> f32 {
  let near = 1.0 - smoothstep(600.0, 2500.0, length(world));
  if (near <= 0.0) {
    return 0.0;
  }
  return near * swellLevel(dot(world, SEA_SWELL_AXIS), bed, 1.0, seaTongue(world, swell), swell.x);
}

/** How far over the sand a sea vertex rides where a sheet may lie on it, metres. */
const SEA_SHEET_RIDES = 0.015;

/**
 * How high a sea vertex stands: the swell's level over water, and just over
 * the sand ashore, where \`seaLies\` cuts the surface to the sheet's outline
 * a fragment at a time.
 */
fn seaVertexLevel(world: vec3f, bed: f32, swell: vec2f) -> f32 {
  let level = seaSwellAt(world, bed, swell);
  if (bed <= 0.0) {
    return level;
  }
  let near = 1.0 - smoothstep(600.0, 2500.0, length(world));
  return max(level, near * (bed + SEA_SHEET_RIDES));
}

/** Whether water lies at a point: always over a floor under the still sea, ashore only under a sheet. */
fn seaLies(world: vec3f, bed: f32, swell: vec2f) -> bool {
  return bed <= 0.0 || seaSwellAt(world, bed, swell) - bed > 0.004;
}

/**
 * What the sand's dampness leaves of its colour at a point ashore: dark where
 * a sheet has just left, drying back to its own.
 */
fn seaDampTint(world: vec3f, bed: f32, swell: vec2f) -> vec3f {
  let near = 1.0 - smoothstep(600.0, 2500.0, length(world));
  if (bed > 1.5 || near <= 0.0) {
    return vec3f(1.0);
  }
  let tau = swell.x - dot(world, SEA_SWELL_AXIS) * SWELL_PACE - shoreDelay(shoreDepth(bed));
  let damp = near * dampAfter(drySince(tau, bed, seaTongue(world, swell)));
  return mix(vec3f(1.0), vec3f(0.6, 0.57, 0.52), damp);
}

/**
 * The sea's colour toward an eye at the origin: \`world\` is the fragment less
 * the eye, \`eye\` the eye from the planet's centre, \`place\` the fragment
 * modulo the ripples' period, \`bed\` the floor's height under it, \`under\`
 * the colour of the water's body over that floor, unlit; \`horizon\` the sky's
 * colour at the horizon.
 */
fn seaColour(
  place: vec3f, world: vec3f, eye: vec3f, sun: vec3f, bed: f32, under: vec3f,
  footprint: f32, seconds: f32, horizon: vec3f, swell: vec2f,
) -> vec3f {
  let up = normalize(eye + world);
  let range = length(world);
  let toEye = -world / max(range, 1e-3);
  let wind = windAt(up);
  // Shallows and lee water lie smoother: the bed takes the short waves' fetch.
  let depth = max(-bed, 0.0);
  let calm = 0.35 + 0.65 * smoothstep(0.0, 4.0, depth);
  let rippled = ripplesAt(place, up, wind * calm, footprint, seconds);
  // The swell's own slope along its run, while a pixel is finer than a wave.
  let swellSeen = 1.0 - smoothstep(1.0, 6.0, footprint);
  let level = seaSwellAt(world, bed, swell);
  let run = SEA_SWELL_AXIS - up * dot(SEA_SWELL_AXIS, up);
  let along = run / max(length(run), 1e-4);
  let ahead = seaSwellAt(world + along * 0.4, bed, swell);
  let swellSlope = along * (swellSeen * (ahead - level) / 0.4);
  let normal = normalize(up - rippled.slope - swellSlope);

  let facing = max(dot(normal, toEye), 0.0);
  let rough = sqrt(rippled.hidden);
  // A rough sea never mirrors at the horizon: its hidden slopes face the eye.
  let mirror = seaFresnel(sqrt(facing * facing + 2.0 * rough * rough + 1e-4) * 0.98 + rough);
  var bounced = reflect(-toEye, normal);
  bounced = normalize(bounced + up * max(0.02 - dot(bounced, up), 0.0) * 2.0);
  let sky = seaSky(bounced, up, sun, horizon);

  // The sun's glint, a Beckmann lobe as wide as the slopes the pixel hides.
  let half = normalize(toEye + sun);
  let tilt = max(dot(normal, half), 1e-3);
  let spread = 2.0 * rippled.hidden + 0.0008;
  let lobe = exp((tilt * tilt - 1.0) / (tilt * tilt * spread)) /
    (3.14159 * spread * tilt * tilt * tilt * tilt);
  let sunUp = smoothstep(-0.02, 0.1, dot(sun, up));
  let glint = vec3f(1.0, 0.9, 0.72) * (
    sunUp * seaFresnel(dot(toEye, half)) * min(lobe, 400.0) * 0.5 / max(4.0 * facing, 0.2)
  );

  // Foam where the water thins out over the beach, broken by the ripples.
  let lace = 0.5 + 0.5 * sin(dot(place, vec3f(2.1, 1.3, 1.7)) + 3.0 * rippled.slope.x / max(rough, 0.05));
  let tau = swell.x - dot(world, SEA_SWELL_AXIS) * SWELL_PACE - shoreDelay(shoreDepth(bed));
  let broken = brokenAt(tau, min(bed, -0.02), 1.0) * smoothstep(-0.05, 0.25, level) * swellSeen;
  // The sheet on the sand is all froth at its thin tip.
  let sheet = smoothstep(0.035, 0.0, level - bed) * step(0.0, bed);
  let still = smoothstep(0.12, 0.0, depth) * (1.0 - swellSeen);
  let foam = clamp(max(max(broken, sheet), still) * (0.45 + 0.55 * lace), 0.0, 1.0) *
    smoothstep(400.0, 40.0, footprint * 100.0);
  let height = dot(sun, up);
  let light = SEA_SUNLIGHT * max(height, 0.0) +
    mix(SEA_NIGHT_SKYLIGHT, SEA_DAY_SKYLIGHT, smoothstep(-0.1, 0.2, height));
  let body = mix(under, vec3f(0.9, 0.93, 0.94), foam) * light;

  let lit = mix(body, sky, mirror * (1.0 - foam)) + glint * (1.0 - foam);
  let haze = 1.0 - exp(-range / SEA_HAZE_REACH);
  return mix(lit, horizon, haze * smoothstep(3.0e6, 2.0e5, range));
}
`;

/** The whole listing the island's sea compiles: the shore's closed forms, the ripples' table, the sea's own. */
export const SEA_LISTING = `${assemble([SHORE_LEVEL, WETNESS, SHORE_CUSPED])}\n${RIPPLE_TABLE_WGSL}\n${SEA_WGSL}`;
