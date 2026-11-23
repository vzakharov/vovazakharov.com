// Generated from sea-damp.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/gpu/shared/shader';

import { ISLAND_SEA } from './island-sea.shader.generated';

export const SEA_DAMP = wgsl(
  'island/pages/island/lib/sea-damp',
  /* wgsl */ `
/// \`lit\` darkened where a sheet has just left the sand at \`bed\`.
fn seaDamp(lit: vec4f, world: vec3f, bed: f32, swell: vec2f) -> vec4f {
  return vec4f(lit.rgb * seaDampTint(world, bed, swell), lit.a);
}
`,
  ISLAND_SEA,
);
