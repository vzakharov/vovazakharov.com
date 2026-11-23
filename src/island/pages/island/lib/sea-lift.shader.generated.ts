// Generated from sea-lift.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/gpu/shared/shader';

import { ISLAND_SEA } from './island-sea.shader.generated';

export const SEA_LIFT = wgsl(
  'island/pages/island/lib/sea-lift',
  /* wgsl */ `
/// The vertex \`local\` of a mesh at \`origin\`, lifted along the up of an eye at
/// \`eye\` over a floor at \`bed\`: by the swell's level over water, and to just
/// over the sand ashore, where \`seaLies\` cuts the surface to the sheet's
/// outline a fragment at a time.
fn seaLift(
  local: vec3f,
  origin: vec3f,
  eye: vec3f,
  bed: f32,
  swell: vec2f,
) -> vec3f {
  let world = local + origin;
  var level = seaSwellAt(world, bed, swell);
  if (bed > 0.0) {
    level = max(level, seaNear(world) * (bed + SEA_SHEET_RIDES));
  }
  return local + normalize(eye + world) * level;
}
`,
  ISLAND_SEA,
);
