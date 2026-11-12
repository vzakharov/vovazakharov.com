// What gets painted on a working building: stencilled digits, and where
// along a wall a mark goes so it reads the right way round from inside.

import package::cube::entities::theme::kit::lib::core::{ROOM, Surf, toSides, closedAt};

/// Metres along a wall from its left end, as someone in its room facing it
/// reads it: unlike `s.uv.x` it is never mirrored and starts at the corner.
fn wallAlong(s: Surf) -> f32 {
  let right = vec2f(s.normal.z, -s.normal.x);
  return dot(s.p.xz, right) + select(0.0, ROOM.x, right.x + right.y < 0.0);
}

/// Metres from a floor's point to the nearest closed wall of its room; 9
/// in a room with none.
fn wallInset(s: Surf) -> f32 {
  let toSide = toSides(s);
  var inset = 9.0;
  for (var side = 0u; side < 4u; side++) {
    if (closedAt(s, side)) {
      inset = min(inset, toSide[side]);
    }
  }
  return inset;
}

/// How far `p` is from the stroke between `a` and `b`.
fn strokeTo(p: vec2f, a: vec2f, b: vec2f) -> f32 {
  let along = clamp(dot(p - a, b - a) / dot(b - a, b - a), 0.0, 1.0);
  return length(p - mix(a, b, along));
}

/// 1 on the paint of digit `n` stencilled into the box x 0..1, y 0..2 (y
/// up), 0 off it: seven strokes with the stencil's bridges between them.
fn stencilDigit(p: vec2f, n: u32) -> f32 {
  if (p.x < -0.2 || p.x > 1.2 || p.y < -0.2 || p.y > 2.2) {
    return 0.0;
  }
  // Strokes lit per digit: top, the right pair, bottom, the left pair, middle.
  var lit =
    array<u32, 10>(
      0x3fu,
      0x06u,
      0x5bu,
      0x4fu,
      0x66u,
      0x6du,
      0x7du,
      0x07u,
      0x7fu,
      0x6fu,
    );
  var starts =
    array<vec2f, 7>(
      vec2f(0.0, 2.0),
      vec2f(1.0, 2.0),
      vec2f(1.0, 1.0),
      vec2f(0.0, 0.0),
      vec2f(0.0, 0.0),
      vec2f(0.0, 1.0),
      vec2f(0.0, 1.0),
    );
  var ends =
    array<vec2f, 7>(
      vec2f(1.0, 2.0),
      vec2f(1.0, 1.0),
      vec2f(1.0, 0.0),
      vec2f(1.0, 0.0),
      vec2f(0.0, 1.0),
      vec2f(0.0, 2.0),
      vec2f(1.0, 1.0),
    );
  let strokes = lit[n % 10u];
  var near = 9.0;
  for (var i = 0u; i < 7u; i++) {
    if (((strokes >> i) & 1u) == 0u) {
      continue;
    }
    let bridge = normalize(ends[i] - starts[i]) * 0.16;
    near = min(near, strokeTo(p, starts[i] + bridge, ends[i] - bridge));
  }
  let soft = clamp(fwidth(p.x), 0.002, 0.2);
  return 1.0 - smoothstep(0.1 - soft, 0.1 + soft, near);
}

/// 1 on every other stripe of a slanted hazard band, stripes `pitch` apart.
fn hazard(at: vec2f, pitch: f32) -> f32 {
  let stripe = fract((at.x + at.y) / pitch);
  let soft = clamp(fwidth(at.x + at.y) / pitch, 0.002, 0.5);
  return
    smoothstep(0.5 - soft, 0.5 + soft, stripe) * (1.0 - smoothstep(
      1.0 - soft,
      1.0,
      stripe,
    ));
}
