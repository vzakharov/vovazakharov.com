import { HASH, wgsl } from '../../kit';

/**
 * What the laboratory's floors share once the rooms are made of what the
 * small world is made of: packed spheres, and cells grown until they meet.
 */
export const SMALL_WORLD = wgsl(
  'laboratory/small-world',
  /* wgsl */ `
fn luma(colour: vec3f) -> f32 {
  return dot(colour, vec3f(0.2126, 0.7152, 0.0722));
}

/// A honeycomb of cells one unit apart: xy is the point's offset from the
/// nearest cell's middle, zw that middle.
fn honeycomb(p: vec2f) -> vec4f {
  let pitch = vec2f(1.0, 1.7320508);
  let a = p - pitch * floor(p / pitch) - pitch * 0.5;
  let shifted = p - pitch * 0.5;
  let b = shifted - pitch * floor(shifted / pitch) - pitch * 0.5;
  let off = select(b, a, dot(a, a) < dot(b, b));
  return vec4f(off, p - off);
}

/// The word of the honeycomb cell whose middle is \`middle\`.
fn combHash(middle: vec2f, salt: u32) -> u32 {
  return cellHash(vec2i(round(middle * vec2f(2.0, 1.1547005))), salt);
}

/// A ball of radius \`radius\` seen from above, \`off\` from its middle: its
/// height there, 1 at the top and 0 from its rim outward.
fn dome(off: vec2f, radius: f32) -> f32 {
  return sqrt(max(1.0 - dot(off, off) / (radius * radius), 0.0));
}

/// Cells of a unit lattice grown until they meet: x is how far the point is
/// inside its cell, 0 on the line where two meet, y and z are the cell's own
/// two random numbers in [0, 1), and w is the distance to the cell's middle.
fn shards(p: vec2f, salt: u32) -> vec4f {
  let cell = vec2i(floor(p));
  var first = 8.0;
  var second = 8.0;
  var nearest = 0u;
  for (var dy = -1; dy <= 1; dy++) {
    for (var dx = -1; dx <= 1; dx++) {
      let other = cell + vec2i(dx, dy);
      let word = cellHash(other, salt);
      let point = vec2f(other) + vec2f(unitOf(word), unitOf(mix32(word)));
      let distance = length(point - p);
      if (distance < first) {
        second = first;
        first = distance;
        nearest = word;
      } else if (distance < second) {
        second = distance;
      }
    }
  }
  return vec4f(second - first, unitOf(mix32(nearest ^ 0xa5a5a5a5u)), unitOf(mix32(nearest ^ 0x3c3c3c3cu)), first);
}
`,
  HASH,
);
