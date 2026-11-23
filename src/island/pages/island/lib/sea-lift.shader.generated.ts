// Generated from sea-lift.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/gpu/shared/shader';

import { ISLAND_SEA } from './island-sea.shader.generated';

export const SEA_LIFT = wgsl(
  'island/pages/island/lib/sea-lift',
  /* wgsl */ `
/// The vertex \`local\` of a mesh at \`origin\`, lifted along the up of an eye at
/// \`eye\` by the swell's level over a floor at \`bed\`.
fn seaLift(
  local: vec3f,
  origin: vec3f,
  eye: vec3f,
  bed: f32,
  swell: vec2f,
) -> vec3f {
  let world = local + origin;
  return local + normalize(eye + world) * seaVertexLevel(world, bed, swell);
}
`,
  ISLAND_SEA,
);
