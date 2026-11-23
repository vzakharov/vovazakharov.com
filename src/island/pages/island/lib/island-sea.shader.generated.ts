// Generated from island-sea.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/gpu/shared/shader';

import { SHORE_CUSPED, SHORE_LEVEL } from '@/nature/shared/shore';
import { SWELL_COURSE } from '@/nature/shared/swell';

import { RIPPLE_TABLE } from './ripple-table';
import { SEA_NUMBERS } from './sea-numbers';

export const ISLAND_SEA = wgsl(
  'island/pages/island/lib/island-sea',
  /* wgsl */ `
const SEA_TAU = 6.283185307;

/// The wind over direction \`unit\` from the planet's centre, metres a second
/// along the ground: easterly trades by the equator, westerlies at mid
/// latitudes, calmer where the belts meet, the whole of it bent and gusted by a
/// slow field so no two coasts take the same wind.
fn windAt(unit: vec3f) -> vec3f {
  let eastward = cross(vec3f(0.0, 1.0, 0.0), unit);
  let off = length(eastward);
  let east = eastward / max(off, 1e-4);
  let north = cross(unit, east);
  let latitude = asin(clamp(unit.y, -1.0, 1.0));
  let belt = cos(3.0 * latitude);
  let bend =
    sin(dot(unit, vec3f(3.1, 1.7, -2.3)) * 2.0) + 0.6 * sin(
      dot(unit, vec3f(-1.9, 4.3, 2.9)) * 3.0 + 1.3,
    );
  let turn = 0.5 * bend;
  let zonal = -belt;
  let meridional = -0.35 * sin(2.0 * latitude);
  let heading =
    normalize(
      east * (zonal * cos(turn) - meridional * sin(turn))
        + north * (zonal * sin(turn) + meridional * cos(turn))
        + east * 0.05,
    );
  let speed = 7.5 * (0.55 + 0.45 * abs(belt)) * (1.0 + 0.2 * bend);
  return heading * speed * min(1.0, off * 8.0);
}

/// The ripples' slope along the sea, and the mean square slope of the waves a pixel hides.
struct Rippled {
  slope: vec3f,
  hidden: f32,
}

/// Two values, 0 to 1, of the slow fields' cell \`cell\` as the world at \`grain\` numbers it.
fn seaGroupCell(cell: vec3f, grain: vec3f) -> vec2f {
  var folded = fract((cell + grain) * 0.1031);
  folded += dot(folded, folded.zyx + 31.32);
  return
    fract(
      vec2f((folded.x + folded.y) * folded.z, (folded.x + folded.z) * folded.y),
    );
}

/// The two slow fields the ripples' groups are read from, each 0 to 1, at
/// \`field\` — a position modulo the fields' period on each axis — in the world
/// whose lattice is shifted by \`grain\` cells.
fn seaGroups(field: vec3f, grain: vec3f) -> vec2f {
  let at = field / GROUP_CELL;
  let base = floor(at);
  let within = at - base;
  let eased = within * within * (3.0 - 2.0 * within);
  let low = base - GROUP_CELLS * floor(base / GROUP_CELLS);
  let high = select(low + 1.0, vec3f(0.0), low + 1.0 >= vec3f(GROUP_CELLS));
  let x00 =
    mix(
      seaGroupCell(vec3f(low.x, low.y, low.z), grain),
      seaGroupCell(vec3f(high.x, low.y, low.z), grain),
      eased.x,
    );
  let x10 =
    mix(
      seaGroupCell(vec3f(low.x, high.y, low.z), grain),
      seaGroupCell(vec3f(high.x, high.y, low.z), grain),
      eased.x,
    );
  let x01 =
    mix(
      seaGroupCell(vec3f(low.x, low.y, high.z), grain),
      seaGroupCell(vec3f(high.x, low.y, high.z), grain),
      eased.x,
    );
  let x11 =
    mix(
      seaGroupCell(vec3f(low.x, high.y, high.z), grain),
      seaGroupCell(vec3f(high.x, high.y, high.z), grain),
      eased.x,
    );
  return mix(mix(x00, x10, eased.y), mix(x01, x11, eased.y), eased.z);
}

/// The wind sea at \`place\` — a position modulo \`RIPPLE_PERIOD\` on each axis —
/// under \`wind\`, seen by a pixel \`footprint\` metres wide, each wave's phase
/// drifting with the slow fields' values \`groups\`. Slope variance is Cox and
/// Munk's for the wind's speed, spread evenly over the bands shorter than the
/// wind's own longest wave and leaning downwind. A wave under a few pixels
/// long is taken out of the slope and into \`hidden\`, and so is every wave
/// past the first \`bands\` bands.
fn ripplesAt(
  place: vec3f,
  groups: vec2f,
  up: vec3f,
  wind: vec3f,
  footprint: f32,
  seconds: f32,
  bands: f32,
) -> Rippled {
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
        RIPPLE_SHARE
          * variance
          * lying
          * lying
          * (0.12 + 0.88 * downwind * downwind)
          * (1.0 - smoothstep(0.6 * longest, 1.2 * longest, metres));
      let seen =
        smoothstep(2.0, 6.0, metres / footprint) * step(f32(band) + 1.0, bands);
      hidden += share * (1.0 - seen * seen);
      // A wave under two pixels adds no slope: its phase is never wanted.
      if (seen > 0.0) {
        let phase =
          SEA_TAU * (dot(wave.xyz, turned) + dot(RIPPLE_DRIFTS[i], groups))
            - RIPPLE_PACES[i] * seconds
            + wave.w;
        slope += toward * (sqrt(2.0 * share) * seen * cos(phase));
      }
    }
  }
  return Rippled(slope, hidden);
}

/// Fresnel's reflectance of water for a ray \`cosine\` off the normal.
fn seaFresnel(cosine: f32) -> f32 {
  return 0.02 + 0.98 * pow(1.0 - clamp(cosine, 0.0, 1.0), 5.0);
}

/// What the sun lays on the water's body per unit of its height's sine, and the sky by day and by night.
const SEA_SUNLIGHT = vec3f(1.47, 1.42, 1.3);
const SEA_DAY_SKYLIGHT = vec3f(0.22, 0.26, 0.3);
const SEA_NIGHT_SKYLIGHT = vec3f(0.04, 0.05, 0.075);

/// How much of a wave's throw the shore keeps at a point \`world\` from the
/// eye: its cusps, which run the swash up the sand in tongues.
fn seaTongue(world: vec3f, swell: vec2f) -> f32 {
  return cusped(swell.y + dot(world, SEA_SWELL_CREST));
}

/// How much of the swell a mesh's vertices carry at a point \`world\` from the eye: none past where they could.
fn seaNear(world: vec3f) -> f32 {
  return 1.0 - smoothstep(600.0, 2500.0, length(world));
}

/// The shore's clock at a point \`world\` from the eye over a floor at \`bed\`.
fn seaTau(world: vec3f, bed: f32, swell: vec2f) -> f32 {
  return
    swell.x
      - dot(world, SEA_SWELL_AXIS) * SWELL_PACE
      - shoreDelay(shoreDepth(bed));
}

/// The swell's level, metres about the still sea, at a point \`world\` from an
/// eye where the swell reads \`swell\` — its clock, and the eye's place along
/// the crests — over a floor at \`bed\`: the open
/// swell, its surf, and its sheet up the sand. It dies out with distance, past
/// where a mesh's vertices could carry it.
fn seaSwellAt(world: vec3f, bed: f32, swell: vec2f) -> f32 {
  let near = seaNear(world);
  if (near <= 0.0) {
    return 0.0;
  }
  return
    near * swellLevel(
      dot(world, SEA_SWELL_AXIS),
      bed,
      1.0,
      seaTongue(world, swell),
      swell.x,
    );
}

/// How far over the sand a sea vertex rides where a sheet may lie on it, metres.
const SEA_SHEET_RIDES = 0.015;

/// The thinnest sheet of water that lies on the sand, metres: under it the sand is dry.
const SEA_SHEET_THINNEST = 0.004;
`,
  RIPPLE_TABLE,
  SEA_NUMBERS,
  SHORE_CUSPED,
  SHORE_LEVEL,
  SWELL_COURSE,
);
