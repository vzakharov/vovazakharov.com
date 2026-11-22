import { f32, vecf } from '@/gpu/shared/shader';

import { DEEP_SPEED, HOUR_SECONDS } from '@/nature/shared/swell';

import type { Vec3 } from '@/island/shared/globe';

import { SUN_ELEVATION } from './day';
import { NATURE_LISTING } from './nature-listing';
import { RIPPLE_TABLE_WGSL } from './ripple-table';
import { CLIMB_KEPT } from './sun';

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
/** The sine of the sun's height the eye is set by, and the share of a higher sun's growth it lets through: \`eyeKeeps\` in sun.ts. */
const SEA_EYE_SET = ${f32(Math.sin((SUN_ELEVATION * Math.PI) / 180))};
const SEA_CLIMB_KEPT = ${f32(CLIMB_KEPT)};
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

/** Two values, 0 to 1, of the slow fields' cell \`cell\` as the world at \`grain\` numbers it. */
fn seaGroupCell(cell: vec3f, grain: vec3f) -> vec2f {
  var folded = fract((cell + grain) * 0.1031);
  folded += dot(folded, folded.zyx + 31.32);
  return fract(vec2f((folded.x + folded.y) * folded.z, (folded.x + folded.z) * folded.y));
}

/**
 * The two slow fields the ripples' groups are read from, each 0 to 1, at
 * \`field\` — a position modulo the fields' period on each axis — in the world
 * whose lattice is shifted by \`grain\` cells.
 */
fn seaGroups(field: vec3f, grain: vec3f) -> vec2f {
  let at = field / GROUP_CELL;
  let base = floor(at);
  let within = at - base;
  let eased = within * within * (3.0 - 2.0 * within);
  let low = base - GROUP_CELLS * floor(base / GROUP_CELLS);
  let high = select(low + 1.0, vec3f(0.0), low + 1.0 >= vec3f(GROUP_CELLS));
  let x00 = mix(seaGroupCell(vec3f(low.x, low.y, low.z), grain), seaGroupCell(vec3f(high.x, low.y, low.z), grain), eased.x);
  let x10 = mix(seaGroupCell(vec3f(low.x, high.y, low.z), grain), seaGroupCell(vec3f(high.x, high.y, low.z), grain), eased.x);
  let x01 = mix(seaGroupCell(vec3f(low.x, low.y, high.z), grain), seaGroupCell(vec3f(high.x, low.y, high.z), grain), eased.x);
  let x11 = mix(seaGroupCell(vec3f(low.x, high.y, high.z), grain), seaGroupCell(vec3f(high.x, high.y, high.z), grain), eased.x);
  return mix(mix(x00, x10, eased.y), mix(x01, x11, eased.y), eased.z);
}

/**
 * The wind sea at \`place\` — a position modulo \`RIPPLE_PERIOD\` on each axis —
 * under \`wind\`, seen by a pixel \`footprint\` metres wide, each wave's phase
 * drifting with the slow fields' values \`groups\`. Slope variance is Cox and
 * Munk's for the wind's speed, spread evenly over the bands shorter than the
 * wind's own longest wave and leaning downwind. A wave under a few pixels
 * long is taken out of the slope and into \`hidden\`.
 */
fn ripplesAt(place: vec3f, groups: vec2f, up: vec3f, wind: vec3f, footprint: f32, seconds: f32) -> Rippled {
  let speed = length(wind);
  let heading = wind / max(speed, 1e-3);
  let variance = 0.003 + 0.00512 * speed;
  let longest = 0.9 * speed * speed;
  var slope = vec3f(0.0);
  var hidden = 0.0;
  for (var band = 0; band < RIPPLE_BANDS; band++) {
    let scale = exp2(f32(band)) / RIPPLE_PERIOD;
    let turned = fract(place * scale);
    for (var w = 0; w < RIPPLES_PER_BAND; w++) {
      let i = band * RIPPLES_PER_BAND + w;
      let wave = RIPPLES[i];
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
      let phase = SEA_TAU * (dot(wave.xyz, turned) + dot(RIPPLE_DRIFTS[i], groups)) -
        RIPPLE_PACES[i] * seconds + wave.w;
      slope += toward * (sqrt(2.0 * share) * seen * cos(phase));
      hidden += share * (1.0 - seen * seen);
    }
  }
  return Rippled(slope, hidden);
}

/** Fresnel's reflectance of water for a ray \`cosine\` off the normal. */
fn seaFresnel(cosine: f32) -> f32 {
  return 0.02 + 0.98 * pow(1.0 - clamp(cosine, 0.0, 1.0), 5.0);
}

/** What the sun lays on the water's body per unit of its height's sine, and the sky by day and by night. */
const SEA_SUNLIGHT = vec3f(1.47, 1.42, 1.3);
const SEA_DAY_SKYLIGHT = vec3f(0.22, 0.26, 0.3);
const SEA_NIGHT_SKYLIGHT = vec3f(0.04, 0.05, 0.075);

/**
 * How much of a wave's throw the shore keeps at a point \`world\` from the
 * eye: its cusps, which run the swash up the sand in tongues.
 */
fn seaTongue(world: vec3f, swell: vec2f) -> f32 {
  return cusped(swell.y + dot(world, SEA_SWELL_CREST));
}

/** How much of the swell a mesh's vertices carry at a point \`world\` from the eye: none past where they could. */
fn seaNear(world: vec3f) -> f32 {
  return 1.0 - smoothstep(600.0, 2500.0, length(world));
}

/** The shore's clock at a point \`world\` from the eye over a floor at \`bed\`. */
fn seaTau(world: vec3f, bed: f32, swell: vec2f) -> f32 {
  return swell.x - dot(world, SEA_SWELL_AXIS) * SWELL_PACE - shoreDelay(shoreDepth(bed));
}

/**
 * The swell's level, metres about the still sea, at a point \`world\` from an
 * eye where the swell reads \`swell\` — its clock, and the eye's place along
 * the crests — over a floor at \`bed\`: the open
 * swell, its surf, and its sheet up the sand. It dies out with distance, past
 * where a mesh's vertices could carry it.
 */
fn seaSwellAt(world: vec3f, bed: f32, swell: vec2f) -> f32 {
  let near = seaNear(world);
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
  let near = seaNear(world);
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
  let near = seaNear(world);
  if (bed > 1.5 || near <= 0.0) {
    return vec3f(1.0);
  }
  let tau = seaTau(world, bed, swell);
  let damp = near * dampAfter(drySince(tau, bed, seaTongue(world, swell)));
  return mix(vec3f(1.0), vec3f(0.6, 0.57, 0.52), damp);
}

/**
 * The sea's colour toward an eye at the origin: \`world\` is the fragment less
 * the eye, \`eye\` the eye from the planet's centre, \`place\` the fragment
 * modulo the ripples' period, \`field\` modulo the slow fields' and \`grain\`
 * the world's shift of their lattice, \`bed\` the floor's height under it, \`under\`
 * the colour of the water's body over that floor, unlit; \`mirrored\` the
 * sky a still sea would show the eye there and \`overhead\` the zenith's.
 * The air between is the caller's to add.
 */
fn seaColour(
  place: vec3f, field: vec3f, grain: vec3f, world: vec3f, eye: vec3f, sun: vec3f, bed: f32,
  under: vec3f, footprint: f32, seconds: f32, mirrored: vec3f, overhead: vec3f, swell: vec2f,
) -> vec3f {
  let up = normalize(eye + world);
  let range = length(world);
  let toEye = -world / max(range, 1e-3);
  let wind = windAt(up);
  // Shallows and lee water lie smoother: the bed takes the short waves' fetch.
  let depth = max(-bed, 0.0);
  let calm = 0.35 + 0.65 * smoothstep(0.0, 4.0, depth);
  let rippled = ripplesAt(place, seaGroups(field, grain), up, wind * calm, footprint, seconds);
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
  // The sky in the water: between what a still sea would mirror and the zenith's.
  let still = max(dot(reflect(-toEye, up), up), 0.03);
  let raised = clamp((dot(bounced, up) - still) / max(1.0 - still, 1e-3), 0.0, 1.0);
  let sky = mix(mirrored, overhead, sqrt(raised));

  // The sun's glint, a Beckmann lobe as wide as the slopes the pixel hides.
  let half = normalize(toEye + sun);
  let tilt = max(dot(normal, half), 1e-3);
  let spread = 2.0 * rippled.hidden + 0.0008;
  let lobe = exp((tilt * tilt - 1.0) / (tilt * tilt * spread)) /
    (3.14159 * spread * tilt * tilt * tilt * tilt);
  let sunUp = smoothstep(-0.02, 0.1, dot(sun, up));
  let height = dot(sun, up);
  let kept = pow(SEA_EYE_SET / max(height, SEA_EYE_SET), 1.0 - SEA_CLIMB_KEPT);
  let glint = vec3f(1.0, 0.9, 0.72) * (
    sunUp * kept * seaFresnel(dot(toEye, half)) * min(lobe, 400.0) * 0.5 / max(4.0 * facing, 0.2)
  );

  // Foam where the water thins out over the beach, broken by the ripples.
  let lace = 0.5 + 0.5 * sin(dot(place, vec3f(2.1, 1.3, 1.7)) + 3.0 * rippled.slope.x / max(rough, 0.05));
  let tau = seaTau(world, bed, swell);
  let broken = brokenAt(tau, min(bed, -0.02), 1.0) * smoothstep(-0.05, 0.25, level) * swellSeen;
  // The sheet on the sand is all froth at its thin tip.
  let sheet = smoothstep(0.012, 0.0, level - bed) * step(0.0, bed);
  let line = smoothstep(0.12, 0.0, depth) * (1.0 - swellSeen);
  let foam = clamp(max(max(broken, sheet), line) * (0.45 + 0.55 * lace), 0.0, 1.0) *
    smoothstep(400.0, 40.0, footprint * 100.0);
  let light = SEA_SUNLIGHT * (max(height, 0.0) * kept) +
    mix(SEA_NIGHT_SKYLIGHT, SEA_DAY_SKYLIGHT, smoothstep(-0.1, 0.2, height));
  let body = mix(under, vec3f(0.9, 0.93, 0.94), foam) * light;

  return mix(body, sky, mirror * (1.0 - foam)) + glint * (1.0 - foam);
}
`;

/** The whole listing the island's sea and ground compile: the shore's closed forms, the ripples' table, the sea's own and the ground's relief. */
export const SEA_LISTING = `${NATURE_LISTING}\n${RIPPLE_TABLE_WGSL}\n${SEA_WGSL}`;
