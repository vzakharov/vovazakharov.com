// Generated from sea-lies.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/gpu/shared/shader';

import { ISLAND_SEA } from './island-sea.shader.generated';

export const SEA_LIES = wgsl(
  'island/pages/island/lib/sea-lies',
  /* wgsl */ `
/// Whether water lies at a point: always over a floor under the still sea,
/// ashore only under a sheet.
fn seaLies(world: vec3f, bed: f32, swell: vec2f) -> bool {
  return bed <= 0.0 || seaSwellAt(world, bed, swell) - bed > SEA_SHEET_THINNEST;
}
`,
  ISLAND_SEA,
);
