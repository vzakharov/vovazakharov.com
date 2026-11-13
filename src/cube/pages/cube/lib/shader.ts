import { floorSource, themeOf } from '@/cube/entities/theme';

import { PASS_WGSL, VERTEX_WGSL } from './vertex';

/** The floats of `Uniforms` below: a matrix and three vectors. */
export const UNIFORM_FLOATS = 16 + 4 + 4 + 4;

/**
 * What every lens stands on, a floor's or the outside's: the frame's
 * uniforms, the scene and its glow to look at, one triangle over the screen,
 * and `lensOf`, the `Lens` of a pixel. A lens adds `lensFragment`.
 */
const LENS_STAGE = /* wgsl */ `
struct Uniforms {
  viewProjection: mat4x4f,
  /// The eye, in its own frame.
  eye: vec4f,
  /// Seconds into the shared clock's hour, which hour, and the screen's size.
  clock: vec4f,
  /// What the outside's lens is set to: its exposure, how far the eyelids
  /// are open, 0 shut to 1, and how far indoors the eye is, 0 to 1.
  lens: vec4f,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(1) @binding(2) var sceneTexture: texture_2d<f32>;
@group(1) @binding(3) var glowTexture: texture_2d<f32>;
@group(1) @binding(4) var lensSampler: sampler;

fn sceneAt(uv: vec2f) -> vec4f {
  return textureSampleLevel(sceneTexture, lensSampler, uv, 0.0);
}

fn glowAt(uv: vec2f) -> vec3f {
  return textureSampleLevel(glowTexture, lensSampler, uv, 0.0).rgb;
}

/// One triangle that covers the screen.
@vertex
fn lensVertex(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  return vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
}

fn lensOf(at: vec4f) -> Lens {
  var l: Lens;
  l.pixel = at.xy;
  l.size = uniforms.clock.zw;
  l.uv = at.xy / l.size;
  l.time = uniforms.clock.x;
  l.hour = u32(uniforms.clock.y);
  return l;
}
`;

/**
 * The entry points every floor shares, in two passes. The scene: the vertex
 * stage places a vertex and hands the rest on, and the fragment stages make
 * the `Surf` a theme reads and ask the theme for the point's material and
 * its light — a room's face from what it is made of, a board's from the
 * texture drawn on it — writing scene light, how far off the point is, and
 * the mirror the light left, which the frame fills before the lens.
 * The lens is `lens`, which defines `lensFragment` over the theme's own.
 */
const stage = (lens: string): string => /* wgsl */ `
${LENS_STAGE}

@group(1) @binding(0) var board: texture_2d<f32>;
@group(1) @binding(1) var boardSampler: sampler;

${VERTEX_WGSL}

@vertex
fn vertexMain(in: VertexIn) -> Varying {
  var out: Varying;
  out.clip = uniforms.viewProjection * vec4f(in.position, 1.0);
${PASS_WGSL}
  return out;
}

fn surfOf(in: Varying) -> Surf {
  var s: Surf;
  s.kind = in.kind;
  s.normal = normalize(in.normal);
  s.p = in.local * ROOM.x;
  s.cell = vec2u(in.cell, in.cell >> 8u) & vec2u(63u);
  let wide = vec2f(s.cell) * ROOM.xz + s.p.xz;
  if (abs(s.normal.y) > 0.5) {
    s.uv = wide;
  } else if (abs(s.normal.x) > abs(s.normal.z)) {
    s.uv = vec2f(wide.y, s.p.y);
  } else {
    s.uv = vec2f(wide.x, s.p.y);
  }
  s.seed = in.seed;
  s.flags = in.flags;
  let paint = vec3f(vec3u(in.paint >> 16u, in.paint >> 8u, in.paint) & vec3u(255u)) / 255.0;
  s.paint = pow(paint, vec3f(2.2));
  let to = in.position - uniforms.eye.xyz;
  s.far = length(to) * ROOM.x;
  s.view = normalize(to);
  s.pixel = in.clip.xy;
  s.screen = in.clip.xy / uniforms.clock.zw;
  s.time = uniforms.clock.x;
  s.hour = u32(uniforms.clock.y);
  return s;
}

/// A point as the scene pass writes it: its light and how far off it is,
/// and its mirror, the share it shows and what the lamps would put there,
/// then the plane it reflects off and how fast the reflection blurs.
struct Scene {
  @location(0) light: vec4f,
  @location(1) mirror: vec4f,
  @location(2) plane: vec4f,
};

/// \`light\`, the theme's for \`s\`, with the mirror it left.
fn sceneOf(s: Surf, light: vec3f) -> Scene {
  return Scene(
    vec4f(light, s.far),
    vec4f(mirroring.fallback, mirroring.strength),
    vec4f(mirroring.normal, mirroring.blur),
  );
}

@fragment
fn fragmentMain(in: Varying) -> Scene {
  let s = surfOf(in);
  var m = themeMaterial(s);
  if (s.kind == OWNED) {
    m = ownedMark(s, m);
  }
  return sceneOf(s, themeLight(s, m));
}

@fragment
fn boardFragment(in: Varying) -> Scene {
  let drawn = textureSample(board, boardSampler, in.tex).rgb;
  let s = surfOf(in);
  let m = matte(pow(drawn, vec3f(2.2)));
  return sceneOf(s, themeLight(s, m));
}

${lens}
`;

/** A floor's lens: each pixel what the theme's lens makes of the scene. */
const FLOOR_LENS = /* wgsl */ `
@fragment
fn lensFragment(@builtin(position) at: vec4f) -> @location(0) vec4f {
  return vec4f(themeLens(lensOf(at)), 1.0);
}`;

/** The whole shader of floor `n`. */
export const shaderOf = (n: number): string =>
  floorSource(themeOf(n), stage(FLOOR_LENS));

/**
 * Floor 1's whole shader with `lens` for its `lensFragment`: a lens that can
 * call floor 1's `themeLens`, for an eye passing between that room and the
 * outside.
 */
export const firstFloorThrough = (lens: string): string =>
  floorSource(themeOf(1), stage(lens));
