import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import { f32, vecf, wgsl } from '../lib/wgsl';
import { HASH } from '../lib/wgsl-hash';
import { OUTDOOR_FRAME } from '../outside/outdoor-frame';
import {
  CLOUD_LANE,
  CLOUD_TILE,
  CLOUDS,
  DRIFT_PER_SECOND,
  SUN_IN_FIELD,
  WIND_AXIS,
} from './cloud-field';

const hash = pathHash('0');

/** What every lattice and every cell of the clouds is salted with. */
const { salt: SALT } = rollWith(
  roll.struct({ salt: roll.uniform(0, 2 ** 31) }),
  (path) => hash(`island/sky/clouds/${path}`),
);

/** Lattice cells to a kilometre, for a lattice of `cells` to the tile. */
export const cellsPerKm = (cells: number): string => f32(cells / CLOUD_TILE);

const radius = CLOUDS.radius;
const lane = CLOUDS.lane;

/**
 * Where clouds stand and the noise that shapes them, on lattices that repeat
 * with the field's tile along the wind, so the hour's drift closes on itself:
 *
 * - `inField(at) -> vec3f`, a point `at` km from the island as the field
 *   holds it: x along the wind from where it started the hour, y km over the
 *   sea, z across the wind;
 * - `cloudIn(cell) -> Cloud`, the cloud a cell of the field holds, its
 *   `radius` 0 where it holds none;
 * - `cloudNoise(p, period, salt)` and `cloudNoise2(p, period, salt)`, smooth
 *   noise in [0, 1) over a unit lattice whose x repeats every `period` cells.
 */
export const CLOUD_NOISE = wgsl(
  'sky/cloud-noise',
  /* wgsl */ `
const CLOUD_SALT = ${String(Math.floor(SALT))}u;
const CLOUD_BASE = ${f32(CLOUDS.base)};
const CLOUD_CEILING = ${f32(CLOUDS.ceiling)};
const CLOUD_REACH = ${f32(CLOUDS.reach)};
const CLOUD_CELL = ${f32(CLOUDS.cell)};
const CLOUD_BOUND = ${f32(CLOUDS.bound)};
const TILE_CELLS = ${String(CLOUDS.tileCells)};
const WIND_AXIS = ${vecf(WIND_AXIS)};
const WIND_SIDE = ${vecf([-WIND_AXIS[1], WIND_AXIS[0]])};
/// Towards the sun, in the field's axes.
const SUN_IN_FIELD = ${vecf(SUN_IN_FIELD)};
const EARTH_RADIUS = 6360.0;

struct Cloud {
  /// Its middle on the sea, in the field: along the wind, across it.
  centre: vec2f,
  /// Its footprint's radius, 0 where the cell holds no cloud, and its height.
  radius: f32,
  tall: f32,
  /// What its own billows are salted with.
  seed: u32,
};

/// Kilometres the field has drifted down the wind this hour.
fn cloudDrift() -> f32 {
  return frame.clock.x * ${f32(DRIFT_PER_SECOND)};
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
  return mix(
    mix(unitOf(pointHash(vec3i(near, cell.y, 0), salt)), unitOf(pointHash(vec3i(far, cell.y, 0), salt)), u.x),
    mix(unitOf(pointHash(vec3i(near, cell.y + 1, 0), salt)), unitOf(pointHash(vec3i(far, cell.y + 1, 0), salt)), u.x),
    u.y,
  );
}

fn cloudNoise(p: vec3f, period: i32, salt: u32) -> f32 {
  let cell = vec3i(floor(p));
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let near = wrapped(cell.x, period);
  let far = wrapped(cell.x + 1, period);
  let under = mix(
    mix(unitOf(pointHash(vec3i(near, cell.y, cell.z), salt)), unitOf(pointHash(vec3i(far, cell.y, cell.z), salt)), u.x),
    mix(unitOf(pointHash(vec3i(near, cell.y, cell.z + 1), salt)), unitOf(pointHash(vec3i(far, cell.y, cell.z + 1), salt)), u.x),
    u.z,
  );
  let over = mix(
    mix(unitOf(pointHash(vec3i(near, cell.y + 1, cell.z), salt)), unitOf(pointHash(vec3i(far, cell.y + 1, cell.z), salt)), u.x),
    mix(unitOf(pointHash(vec3i(near, cell.y + 1, cell.z + 1), salt)), unitOf(pointHash(vec3i(far, cell.y + 1, cell.z + 1), salt)), u.x),
    u.z,
  );
  return mix(under, over, u.y);
}

fn cloudIn(cell: vec2i) -> Cloud {
  let word = cellHash(vec2i(wrapped(cell.x, TILE_CELLS), cell.y), CLOUD_SALT);
  let size = unitOf(hashOf(word, 1u));
  let ragged = unitOf(hashOf(word, 2u));
  let broad = mix(${f32(radius.least)}, ${f32(radius.most)}, size * size);
  let room = 0.5 * CLOUD_CELL - broad * CLOUD_BOUND;
  let nudge = vec2f(unitOf(hashOf(word, 3u)), unitOf(hashOf(word, 4u))) * 2.0 - 1.0;
  let centre = (vec2f(cell) + 0.5) * CLOUD_CELL + nudge * room;

  // The lane is the island's, not the field's: it stands still while the
  // clouds go down it, open where the sun's beam crosses the slab and for a
  // way either side of the island, closing far off.
  let toSun = -(centre.x + cloudDrift());
  let open = smoothstep(${f32(CLOUD_LANE.shut.behind)}, ${f32(CLOUD_LANE.open.behind)}, toSun)
    * (1.0 - smoothstep(${f32(CLOUD_LANE.open.ahead)}, ${f32(CLOUD_LANE.shut.ahead)}, toSun));
  let clear = ${f32(lane.clear)} * open;
  let edge = clear + ${f32(lane.full - lane.clear)} * (0.35 + 0.65 * ragged);
  let laned = mix(1.0, smoothstep(clear, edge, abs(centre.y)), smoothstep(0.0, 0.2, open));
  let away = length(vec2f(toSun, centre.y));
  let stands = laned * (1.0 - smoothstep(0.8 * CLOUD_REACH, CLOUD_REACH, away));
  if (unitOf(word) > ${f32(CLOUDS.chance)} || stands < 0.3) {
    return Cloud(centre, 0.0, 0.0, 0u);
  }

  let radius = broad * stands;
  // The broad ones are the ones that tower.
  let tower = mix(0.7, 1.25, unitOf(hashOf(word, 5u))) + 0.8 * smoothstep(0.6, 1.0, size) * ragged;
  let tall = min(radius * tower, (CLOUD_CEILING - CLOUD_BASE) / CLOUD_BOUND);
  return Cloud(centre, radius, tall, hashOf(word, 7u));
}
`,
  HASH,
  OUTDOOR_FRAME,
);
