// Generated from cloud-noise.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { OUTDOOR_FRAME } from '../outside/outdoor-frame';
import { HASH } from '../shader/hash.shader';
import { wgsl } from '../shader/wgsl';
import { CLOUD_NOISE_NUMBERS } from './cloud-noise-numbers';

export const CLOUD_NOISE = wgsl(
  'cube/shared/sky/cloud-noise',
  /* wgsl */ `
/// The earth's radius, km.
const EARTH_RADIUS = 6360.0;

struct Cloud {
  /// Its middle on the sea, in the field: along the wind, across it.
  centre: vec2f,
  /// Its footprint's radius, 0 where the cell holds no cloud, and its height.
  radius: f32,
  tall: f32,
  /// What its own billows are salted with.
  seed: u32,
  /// Kilometres from the eye to it, 0 until a ray's walk of the field says.
  off: f32,
}

/// Kilometres the field has drifted down the wind this hour.
fn cloudDrift() -> f32 {
  return frame.clock.x * CLOUD_DRIFT;
}

/// The height over the sea of a point \`at\` km from the eye: the sea falls
/// away under a far cloud, which is what sets cloud banks on the horizon.
fn heightOf(at: vec3f) -> f32 {
  return at.y + dot(at.xz, at.xz) / (2.0 * EARTH_RADIUS);
}

/// A point \`at\` km from the island as the field holds it: x along the wind
/// from where it started the hour, y km over the sea, z across the wind.
fn inField(at: vec3f) -> vec3f {
  return
    vec3f(
      dot(at.xz, WIND_AXIS) - cloudDrift(),
      heightOf(at),
      dot(at.xz, WIND_SIDE),
    );
}

fn wrapped(cell: i32, period: i32) -> i32 {
  return ((cell % period) + period) % period;
}

/// Smooth noise in [0, 1) over a unit lattice whose x repeats every \`period\`
/// cells.
fn cloudNoise2(p: vec2f, period: i32, salt: u32) -> f32 {
  let cell = vec2i(floor(p));
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let near = wrapped(cell.x, period);
  let far = wrapped(cell.x + 1, period);
  return
    mix(
      mix(
        unitOf(pointHash(vec3i(near, cell.y, 0), salt)),
        unitOf(pointHash(vec3i(far, cell.y, 0), salt)),
        u.x,
      ),
      mix(
        unitOf(pointHash(vec3i(near, cell.y + 1, 0), salt)),
        unitOf(pointHash(vec3i(far, cell.y + 1, 0), salt)),
        u.x,
      ),
      u.y,
    );
}

/// Smooth noise in [0, 1) over a unit lattice whose x repeats every \`period\`
/// cells.
fn cloudNoise(p: vec3f, period: i32, salt: u32) -> f32 {
  let cell = vec3i(floor(p));
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let near = wrapped(cell.x, period);
  let far = wrapped(cell.x + 1, period);
  let under =
    mix(
      mix(
        unitOf(pointHash(vec3i(near, cell.y, cell.z), salt)),
        unitOf(pointHash(vec3i(far, cell.y, cell.z), salt)),
        u.x,
      ),
      mix(
        unitOf(pointHash(vec3i(near, cell.y, cell.z + 1), salt)),
        unitOf(pointHash(vec3i(far, cell.y, cell.z + 1), salt)),
        u.x,
      ),
      u.z,
    );
  let over =
    mix(
      mix(
        unitOf(pointHash(vec3i(near, cell.y + 1, cell.z), salt)),
        unitOf(pointHash(vec3i(far, cell.y + 1, cell.z), salt)),
        u.x,
      ),
      mix(
        unitOf(pointHash(vec3i(near, cell.y + 1, cell.z + 1), salt)),
        unitOf(pointHash(vec3i(far, cell.y + 1, cell.z + 1), salt)),
        u.x,
      ),
      u.z,
    );
  return mix(under, over, u.y);
}

/// The cloud a cell of the field holds, its \`radius\` 0 where it holds none.
fn cloudIn(cell: vec2i) -> Cloud {
  let word = cellHash(vec2i(wrapped(cell.x, TILE_CELLS), cell.y), CLOUD_SALT);
  let size = unitOf(hashOf(word, 1u));
  let ragged = unitOf(hashOf(word, 2u));
  let broad = mix(CLOUD_RADIUS_LEAST, CLOUD_RADIUS_MOST, size * size);
  let room = 0.5 * CLOUD_CELL - broad * CLOUD_BOUND;
  let nudge =
    vec2f(unitOf(hashOf(word, 3u)), unitOf(hashOf(word, 4u))) * 2.0 - 1.0;
  let centre = (vec2f(cell) + 0.5) * CLOUD_CELL + nudge * room;

  // The lane is the island's, not the field's: it stands still while the
  // clouds go down it, open where the sun's beam crosses the slab and for a
  // way either side of the island, closing far off.
  let toSun = -(centre.x + cloudDrift());
  let open =
    smoothstep(LANE_SHUT_BEHIND, LANE_OPEN_BEHIND, toSun) * (1.0 - smoothstep(
      LANE_OPEN_AHEAD,
      LANE_SHUT_AHEAD,
      toSun,
    ));
  let clear = LANE_CLEAR * open;
  let edge = clear + LANE_SPREAD * (0.35 + 0.65 * ragged);
  let laned =
    mix(
      1.0,
      smoothstep(clear, edge, abs(centre.y)),
      smoothstep(0.0, 0.2, open),
    );
  let away = length(vec2f(toSun, centre.y));
  let stands = laned * (1.0 - smoothstep(0.8 * CLOUD_REACH, CLOUD_REACH, away));
  if (unitOf(word) > CLOUD_CHANCE || stands < 0.3) {
    return Cloud(centre, 0.0, 0.0, 0u, 0.0);
  }

  let radius = broad * stands;
  // The broad ones are the ones that tower.
  let tower =
    mix(0.7, 1.25, unitOf(hashOf(word, 5u))) + 0.8
      * smoothstep(0.6, 1.0, size)
      * ragged;
  let tall = min(radius * tower, (CLOUD_CEILING - CLOUD_BASE) / CLOUD_BOUND);
  return Cloud(centre, radius, tall, hashOf(word, 7u), 0.0);
}
`,
  OUTDOOR_FRAME,
  HASH,
  CLOUD_NOISE_NUMBERS,
);
