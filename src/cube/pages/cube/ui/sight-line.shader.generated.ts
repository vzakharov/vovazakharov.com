// Generated from sight-line.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

export const SIGHT_LINE = wgsl(
  'cube/pages/cube/ui/sight-line',
  /* wgsl */ `
/// The way from \`eye\` through \`uv\` on the screen, unit length; \`inverse\` takes
/// clip space back to the frame the mesh is in.
fn sightThrough(inverse: mat4x4f, eye: vec3f, uv: vec2f) -> vec3f {
  let along = inverse * vec4f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 0.5, 1.0);
  return normalize(along.xyz / along.w - eye);
}
`,
);
