// Generated from floor-stage.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';
import { CORE, STUFF } from '@/cube/entities/theme';

import { LENS_STAGE } from './lens-stage.shader.generated';
import { VERTEX } from './vertex';

export const FLOOR_STAGE = wgsl(
  'cube/pages/cube/lib/floor-stage',
  /* wgsl */ `
@group(1) @binding(0) var board: texture_2d<f32>;
@group(1) @binding(1) var boardSampler: sampler;

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
  let paint =
    vec3f(
      vec3u(in.paint >> 16u, in.paint >> 8u, in.paint) & vec3u(255u),
    ) / 255.0;
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
}

/// \`light\`, the theme's for \`s\`, with the mirror it left.
fn sceneOf(s: Surf, light: vec3f) -> Scene {
  return
    Scene(
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
`,
  LENS_STAGE,
  VERTEX,
  CORE,
  STUFF,
);
