import { RIPPLE_TABLE_WGSL } from './ripple-table';

/**
 * The sea's surface as WGSL functions of their arguments alone — no uniform,
 * no binding — so any renderer that hands them a place, a clock and a sun can
 * draw with them.
 */
const SEA_WGSL = `
const SEA_TAU = 6.283185307;

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
 * The sea's colour toward an eye at the origin: \`world\` is the fragment less
 * the eye, \`eye\` the eye from the planet's centre, \`place\` the fragment
 * modulo the ripples' period, \`bed\` the floor's height under it, \`under\`
 * the colour of the water's body over that floor, unlit; \`horizon\` the sky's
 * colour at the horizon.
 */
fn seaColour(
  place: vec3f, world: vec3f, eye: vec3f, sun: vec3f, bed: f32, under: vec3f,
  footprint: f32, seconds: f32, horizon: vec3f,
) -> vec3f {
  let up = normalize(eye + world);
  let range = length(world);
  let toEye = -world / max(range, 1e-3);
  let wind = windAt(up);
  // Shallows and lee water lie smoother: the bed takes the short waves' fetch.
  let depth = max(-bed, 0.0);
  let calm = 0.35 + 0.65 * smoothstep(0.0, 4.0, depth);
  let rippled = ripplesAt(place, up, wind * calm, footprint, seconds);
  let normal = normalize(up - rippled.slope);

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
  let foam = smoothstep(0.12, 0.0, depth) * (0.45 + 0.55 * lace) * smoothstep(400.0, 40.0, footprint * 100.0);
  let height = dot(sun, up);
  let light = SEA_SUNLIGHT * max(height, 0.0) +
    mix(SEA_NIGHT_SKYLIGHT, SEA_DAY_SKYLIGHT, smoothstep(-0.1, 0.2, height));
  let body = mix(under, vec3f(0.9, 0.93, 0.94), foam) * light;

  let lit = mix(body, sky, mirror * (1.0 - foam)) + glint * (1.0 - foam);
  let haze = 1.0 - exp(-range / SEA_HAZE_REACH);
  return mix(lit, horizon, haze * smoothstep(3.0e6, 2.0e5, range));
}
`;

export const SEA_LISTING = `${RIPPLE_TABLE_WGSL}\n${SEA_WGSL}`;
