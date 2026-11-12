import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import { f32, vecf, wgsl } from '../lib/wgsl';
import { HASH } from '../lib/wgsl-hash';
import { OUTDOOR_FRAME } from '../outside/outdoor-frame';
import { CLOUDS, LANE, WIND_AXIS } from './cloud-field';

const hash = pathHash('0');

/** What every lattice of the clouds is salted with. */
const { salt: SALT } = rollWith(
  roll.struct({ salt: roll.uniform(0, 2 ** 31) }),
  (path) => hash(`island/sky/clouds/${path}`),
);

const SECONDS_IN_HOUR = 3600;
const cellsPerKm = (cells: number): string => f32(cells / CLOUDS.tile);

/**
 * Where clouds stand, as noise on lattices that repeat with the field's tile
 * along the wind, so the hour's drift closes on itself:
 *
 * - `inField(at) -> vec3f`, a point `at` km from the eye as the field holds
 *   it: x along the wind from where it started the hour, y km over the sea, z
 *   across the wind;
 * - `weatherAt(field, octaves) -> vec2f`, x the cover over that point and y
 *   how tall a cloud there grows, the cover from that many of its octaves;
 * - `cloudNoise(p, period, salt) -> f32`, smooth noise in [0, 1) over a unit
 *   lattice whose x repeats every `period.x` cells and y every `period.y`.
 */
export const CLOUD_NOISE = wgsl(
  'sky/cloud-noise',
  /* wgsl */ `
const CLOUD_SALT = ${String(Math.floor(SALT))}u;
const CLOUD_BASE = ${f32(CLOUDS.base)};
const CLOUD_TOP = ${f32(CLOUDS.top)};
const CLOUD_REACH = ${f32(CLOUDS.reach)};
const WIND_AXIS = ${vecf(WIND_AXIS)};
const WIND_SIDE = ${vecf([-WIND_AXIS[1], WIND_AXIS[0]])};
const EARTH_RADIUS = 6360.0;

/// Kilometres the field has drifted down the wind this hour.
fn cloudDrift() -> f32 {
  return frame.clock.x * ${f32((CLOUDS.tile * CLOUDS.tilesPerHour) / SECONDS_IN_HOUR)};
}

/// The height over the sea of a point \`at\` km from the eye: the sea falls
/// away under a far cloud, which is what sets cloud banks on the horizon.
fn heightOf(at: vec3f) -> f32 {
  return at.y + dot(at.xz, at.xz) / (2.0 * EARTH_RADIUS);
}

fn inField(at: vec3f) -> vec3f {
  return vec3f(dot(at.xz, WIND_AXIS) - cloudDrift(), heightOf(at), dot(at.xz, WIND_SIDE));
}

fn wrapped(cell: i32, period: i32) -> i32 {
  return ((cell % period) + period) % period;
}

fn cloudNoise2(p: vec2f, period: i32, salt: u32) -> f32 {
  let cell = vec2i(floor(p));
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let near = wrapped(cell.x, period);
  let far = wrapped(cell.x + 1, period);
  let a = unitOf(cellHash(vec2i(near, cell.y), salt));
  let b = unitOf(cellHash(vec2i(far, cell.y), salt));
  let c = unitOf(cellHash(vec2i(near, cell.y + 1), salt));
  let d = unitOf(cellHash(vec2i(far, cell.y + 1), salt));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

fn cloudNoise(p: vec3f, period: vec2i, salt: u32) -> f32 {
  let cell = vec3i(floor(p));
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let near = wrapped(cell.x, period.x);
  let far = wrapped(cell.x + 1, period.x);
  let low = bitcast<u32>(wrapped(cell.y, period.y));
  let high = bitcast<u32>(wrapped(cell.y + 1, period.y));
  // One word per column of the lattice, hashed again with each level.
  let a = cellHash(vec2i(near, cell.z), salt);
  let b = cellHash(vec2i(far, cell.z), salt);
  let c = cellHash(vec2i(near, cell.z + 1), salt);
  let d = cellHash(vec2i(far, cell.z + 1), salt);
  let under = mix(
    mix(unitOf(hashOf(a, low)), unitOf(hashOf(b, low)), u.x),
    mix(unitOf(hashOf(c, low)), unitOf(hashOf(d, low)), u.x),
    u.z,
  );
  let over = mix(
    mix(unitOf(hashOf(a, high)), unitOf(hashOf(b, high)), u.x),
    mix(unitOf(hashOf(c, high)), unitOf(hashOf(d, high)), u.x),
    u.z,
  );
  return mix(under, over, u.y);
}

fn weatherAt(field: vec3f, octaves: i32) -> vec2f {
  let at = field.xz;
  var cover = cloudNoise2(at * ${cellsPerKm(CLOUDS.cover[0])}, ${String(CLOUDS.cover[0])}, CLOUD_SALT);
  if (octaves > 1) {
    cover = mix(cover, cloudNoise2(at * ${cellsPerKm(CLOUDS.cover[1])}, ${String(CLOUDS.cover[1])}, CLOUD_SALT + 1u), 0.36);
  }
  if (octaves > 2) {
    cover = mix(cover, cloudNoise2(at * ${cellsPerKm(CLOUDS.cover[2])}, ${String(CLOUDS.cover[2])}, CLOUD_SALT + 2u), 0.14);
  }
  let tall = cloudNoise2(at * ${cellsPerKm(4)} + vec2f(0.5), 4, CLOUD_SALT + 3u);
  // The lane is the island's, not the field's: it stands still while the
  // clouds go down it, open where the sun's beam crosses the slab and for a
  // way either side of the island, closing far off.
  let toSun = -(field.x + cloudDrift());
  let open = smoothstep(${f32(LANE.shut.behind)}, ${f32(LANE.open.behind)}, toSun)
    * (1.0 - smoothstep(${f32(LANE.open.ahead)}, ${f32(LANE.shut.ahead)}, toSun));
  let clear = ${f32(CLOUDS.lane.clear)} * open;
  let edge = clear + ${f32(CLOUDS.lane.full - CLOUDS.lane.clear)} * (0.35 + 0.65 * tall);
  let lane = mix(1.0, smoothstep(clear, edge, abs(field.z)), smoothstep(0.0, 0.2, open));
  let away = length(vec2f(toSun, field.z));
  let fade = 1.0 - smoothstep(0.75 * CLOUD_REACH, CLOUD_REACH, away);
  return vec2f(smoothstep(0.5, 0.78, cover) * lane * fade, smoothstep(0.3, 0.7, tall));
}
`,
  HASH,
  OUTDOOR_FRAME,
);
