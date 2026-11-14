// Generated from pattern.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE } from '../../../kit';

export const PATTERN = wgsl(
  'cube/entities/theme/edge/pattern/lib/pattern',
  /* wgsl */ `
/// A colour's brightness as an eye weighs it.
fn luma(colour: vec3f) -> f32 {
  return dot(colour, vec3f(0.2126, 0.7152, 0.0722));
}

/// The pure colour at \`hue\` turns round the wheel: 0 red, a third green.
fn spectrum(hue: f32) -> vec3f {
  return
    clamp(
      abs(fract(hue + vec3f(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0) - 1.0,
      vec3f(0.0),
      vec3f(1.0),
    );
}

/// 1 on the lines of a square grid \`pitch\` metres apart, each \`width\`
/// metres wide and never thinner than a pixel, 0 between them; it fades out
/// where the grid is finer than the pixels showing it.
fn ruled(uv: vec2f, pitch: f32, width: f32) -> f32 {
  let at = uv / pitch;
  let pixel = fwidth(at);
  let off = abs(fract(at - 0.5) - 0.5);
  let half = max(vec2f(width * 0.5 / pitch), pixel * 0.6);
  let line = 1.0 - smoothstep(half, half + pixel, off);
  let fade = 1.0 - smoothstep(0.25, 0.6, max(pixel.x, pixel.y));
  return max(line.x, line.y) * fade;
}

/// 1 on one diagonal of every square of that grid, the line that makes two
/// triangles of it.
fn slashed(uv: vec2f, pitch: f32, width: f32) -> f32 {
  let at = uv / pitch;
  let across = (fract(at.x) - fract(at.y)) * 0.7071;
  let pixel = fwidth((at.x - at.y) * 0.7071);
  let half = max(width * 0.5 / pitch, pixel * 0.6);
  let fade = 1.0 - smoothstep(0.25, 0.6, pixel);
  return (1.0 - smoothstep(half, half + pixel, abs(across))) * fade;
}

/// A chequerboard of squares \`size\` metres across, 0 or 1, going to an even
/// grey where the squares are finer than a pixel.
fn chequer(uv: vec2f, size: f32) -> f32 {
  let at = uv / size;
  let pixel = max(fwidth(at), vec2f(1e-5));
  let wave = abs(fract(at * 0.5) - 0.5) * 2.0;
  let square = clamp((wave - 0.5) / pixel, vec2f(-0.5), vec2f(0.5)) * 2.0;
  let fade = 1.0 - smoothstep(0.5, 1.0, max(pixel.x, pixel.y));
  return 0.5 + 0.5 * square.x * square.y * fade;
}

/// Blocks \`size\` metres laid in running bond, every other course half a
/// block along: x the block's own number, 0 to 1, y the metres to its
/// nearest joint.
fn bonded(uv: vec2f, size: vec2f, salt: u32) -> vec2f {
  let row = floor(uv.y / size.y);
  let at =
    vec2f(uv.x / size.x + 0.5 * (row - 2.0 * floor(row * 0.5)), uv.y / size.y);
  let f = fract(at);
  let edge = min(f, 1.0 - f) * size;
  return vec2f(unitOf(cellHash(vec2i(floor(at)), salt)), min(edge.x, edge.y));
}

/// Metres across the floor a point is from the middle of its room.
fn fromMiddle(s: Surf) -> f32 {
  return length(s.p.xz - ROOM.xz * 0.5);
}
`,
  CORE,
  HASH,
);
