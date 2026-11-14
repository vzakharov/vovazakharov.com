// Generated from hash.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from './wgsl';

export const HASH = wgsl(
  'cube/shared/shader/hash',
  /* wgsl */ `
fn mix32(x: u32) -> u32 {
  var h = x;
  h ^= h >> 16u;
  h *= 0x7feb352du;
  h ^= h >> 15u;
  h *= 0x846ca68bu;
  h ^= h >> 16u;
  return h;
}

/// \`a\` and \`b\` hashed into one word.
fn hashOf(a: u32, b: u32) -> u32 {
  return mix32(a ^ mix32(b + 0x9e3779b9u));
}

/// A word as a number in [0, 1).
fn unitOf(h: u32) -> f32 {
  return f32(h >> 8u) / 16777216.0;
}

/// The word of lattice cell \`cell\` under \`salt\`.
fn cellHash(cell: vec2i, salt: u32) -> u32 {
  return hashOf(hashOf(bitcast<u32>(cell.x), bitcast<u32>(cell.y)), salt);
}

/// The word of lattice point \`point\` under \`salt\` in one round of the
/// mixer: for a lattice read many times a pixel, where \`cellHash\`'s four
/// rounds a point are the whole cost.
fn pointHash(point: vec3i, salt: u32) -> u32 {
  let spread =
    bitcast<vec3u>(point) * vec3u(0x9e3779b1u, 0x85ebca77u, 0xc2b2ae3du);
  return mix32(spread.x + spread.y + spread.z + salt);
}

/// Smooth noise in [0, 1), one lattice cell per unit of \`p\`.
fn valueNoise(p: vec2f, salt: u32) -> f32 {
  let cell = vec2i(floor(p));
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let a = unitOf(cellHash(cell, salt));
  let b = unitOf(cellHash(cell + vec2i(1, 0), salt));
  let c = unitOf(cellHash(cell + vec2i(0, 1), salt));
  let d = unitOf(cellHash(cell + vec2i(1, 1), salt));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

/// \`octaves\` of valueNoise, each twice as fine and half as strong, in [0, 1).
fn fbm(p: vec2f, salt: u32, octaves: i32) -> f32 {
  var sum = 0.0;
  var weight = 0.5;
  var at = p;
  for (var octave = 0; octave < octaves; octave++) {
    sum += weight * valueNoise(at, salt + u32(octave));
    at *= 2.0;
    weight *= 0.5;
  }
  return sum / (1.0 - 2.0 * weight);
}

/// Cells of a unit lattice, one point in each: x is the distance to the
/// nearest point, y that point's own random number in [0, 1).
fn worley(p: vec2f, salt: u32) -> vec2f {
  let cell = vec2i(floor(p));
  var nearest = vec2f(8.0, 0.0);
  for (var dy = -1; dy <= 1; dy++) {
    for (var dx = -1; dx <= 1; dx++) {
      let other = cell + vec2i(dx, dy);
      let word = cellHash(other, salt);
      let point = vec2f(other) + vec2f(unitOf(word), unitOf(mix32(word)));
      let distance = length(point - p);
      if (distance < nearest.x) {
        nearest = vec2f(distance, unitOf(mix32(word ^ 0xa5a5a5a5u)));
      }
    }
  }
  return nearest;
}

/// How far \`p\` stands from the nearest wall between \`worley\`'s cells: 0 on
/// the web of walls, rising into each cell.
fn cellWalls(p: vec2f, salt: u32) -> f32 {
  let cell = vec2i(floor(p));
  var first = 8.0;
  var second = 8.0;
  for (var dy = -1; dy <= 1; dy++) {
    for (var dx = -1; dx <= 1; dx++) {
      let other = cell + vec2i(dx, dy);
      let word = cellHash(other, salt);
      let distance =
        length(vec2f(other) + vec2f(unitOf(word), unitOf(mix32(word))) - p);
      if (distance < first) {
        second = first;
        first = distance;
      } else if (distance < second) {
        second = distance;
      }
    }
  }
  return second - first;
}
`,
);
