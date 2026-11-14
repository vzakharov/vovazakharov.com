// What the leisure floors draw their patterns with: shapes as signed
// distances in metres, slabs, caustics, and the point seen through a wall of
// glass.

import package::cube::entities::theme::kit::lib::core::{ROOM, Surf};
import package::cube::shared::shader::hash::{unitOf, cellHash, valueNoise, cellWalls};

/// 1 where the signed distance `d` is negative, softened across a pixel.
fn inside(d: f32) -> f32 {
  let soft = max(fwidth(d), 0.0015);
  return 1.0 - smoothstep(-soft, soft, d);
}

/// 1 within a line `width` metres wide along the zero of `d`.
fn stroke(d: f32, width: f32) -> f32 {
  return inside(abs(d) - width * 0.5);
}

/// The distance to a box of half-size `half` whose corners round by `r`.
fn roundBox(p: vec2f, half: vec2f, r: f32) -> f32 {
  let q = abs(p) - half + r;
  return length(max(q, vec2f(0.0))) + min(max(q.x, q.y), 0.0) - r;
}

fn spun(p: vec2f, angle: f32) -> vec2f {
  let c = cos(angle);
  let n = sin(angle);
  return vec2f(c * p.x - n * p.y, n * p.x + c * p.y);
}

/// Oblong slabs laid in courses, each course `shift` of a slab along from
/// the one under it: x is 1 on a slab and 0 in a joint, y the slab's own
/// random number in [0, 1).
fn slabs(uv: vec2f, size: vec2f, joint: f32, salt: u32, shift: f32) -> vec2f {
  let course = floor(uv.y / size.y);
  let at = vec2f(uv.x / size.x + fract(course * shift), uv.y / size.y);
  let f = fract(at);
  let edge = min(min(f.x, 1.0 - f.x) * size.x, min(f.y, 1.0 - f.y) * size.y);
  let soft = max(fwidth(edge), 0.002);
  return
    vec2f(
      smoothstep(joint * 0.5, joint * 0.5 + soft, edge),
      unitOf(cellHash(vec2i(floor(at)), salt)),
    );
}

/// The web of light moving water throws, 0 to 1, at `t` seconds.
fn caustics(p: vec2f, t: f32) -> f32 {
  let warp =
    vec2f(
      valueNoise(p * 0.9 + t * 0.15, 221u),
      valueNoise(p * 0.9 - t * 0.12 + 7.3, 222u),
    );
  let a = cellWalls(p * 2.4 + warp * 0.9, 223u);
  let b = cellWalls(p * 3.3 - warp * 0.7 + vec2f(t * 0.08, 3.1), 224u);
  let web =
    pow(1.0 - smoothstep(0.0, 0.34, a), 2.0) + pow(
      1.0 - smoothstep(0.0, 0.3, b),
      2.0,
    );
  return 0.5 * web;
}

/// One of four colours by a number in [0, 1).
fn oneOf(u: f32, a: vec3f, b: vec3f, c: vec3f, d: vec3f) -> vec3f {
  return select(select(d, c, u < 0.75), select(b, a, u < 0.25), u < 0.5);
}

/// How much of a surface's fine detail survives its distance from the eye:
/// 1 up close, falling off sooner the smaller `reach` is.
fn fading(s: Surf, reach: f32) -> f32 {
  return 1.0 / (1.0 + s.far * s.far / reach);
}

/// The point `depth` metres behind a wall that the eye sees through it:
/// x metres along the wall, running on from room to room, and y metres up.
fn behind(s: Surf, depth: f32) -> vec2f {
  let world = vec2f(s.cell) * ROOM.xz + s.p.xz;
  let eastward = abs(s.normal.z) > 0.5;
  let along = select(world.y, world.x, eastward);
  let slide = select(s.view.z, s.view.x, eastward);
  let into = max(-dot(s.view, s.normal), 0.05);
  return vec2f(along + slide / into * depth, s.p.y + s.view.y / into * depth);
}
