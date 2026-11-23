// Generated from sea-shade.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/gpu/shared/shader';

import { ISLAND_SEA } from './island-sea.shader.generated';

export const SEA_SHADE = wgsl(
  'island/pages/island/lib/sea-shade',
  /* wgsl */ `
/// \`seaColour\`, under the name a material's colour calls.
fn seaShade(
  place: vec3f,
  field: vec3f,
  grain: vec3f,
  world: vec3f,
  eye: vec3f,
  sun: vec3f,
  bed: f32,
  under: vec3f,
  footprint: f32,
  seconds: f32,
  mirrored: vec3f,
  overhead: vec3f,
  swell: vec2f,
  bands: f32,
) -> vec3f {
  return
    seaColour(
      place,
      field,
      grain,
      world,
      eye,
      sun,
      bed,
      under,
      footprint,
      seconds,
      mirrored,
      overhead,
      swell,
      bands,
    );
}
`,
  ISLAND_SEA,
);
