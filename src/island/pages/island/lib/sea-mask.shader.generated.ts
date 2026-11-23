// Generated from sea-mask.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/gpu/shared/shader';

import { ISLAND_SEA } from './island-sea.shader.generated';

export const SEA_MASK = wgsl(
  'island/pages/island/lib/sea-mask',
  /* wgsl */ `
/// \`seaLies\`, under the name a material's mask calls.
fn seaMask(world: vec3f, bed: f32, swell: vec2f) -> bool {
  return seaLies(world, bed, swell);
}
`,
  ISLAND_SEA,
);
