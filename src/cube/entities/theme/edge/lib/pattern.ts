import { CORE, wgsl } from '../../kit';

/**
 * What the edge's floors are drawn in once textures give out: ruled lines,
 * squares and plain spectra, each softened to what a pixel can hold so a
 * grid running to the horizon does not shimmer.
 */
export const PATTERN = wgsl(
  'edge/pattern',
  /* wgsl */ `
/// A colour's brightness as an eye weighs it.
fn luma(colour: vec3f) -> f32 {
  return dot(colour, vec3f(0.2126, 0.7152, 0.0722));
}

/// The pure colour at \`hue\` turns round the wheel: 0 red, a third green.
fn spectrum(hue: f32) -> vec3f {
  return clamp(abs(fract(hue + vec3f(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0) - 1.0, vec3f(0.0), vec3f(1.0));
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

/// Metres along the room's own wall a wall point is, 0 to the room's side.
fn alongWall(s: Surf) -> f32 {
  return select(s.p.x, s.p.z, abs(s.normal.x) > abs(s.normal.z));
}
`,
  CORE,
);
