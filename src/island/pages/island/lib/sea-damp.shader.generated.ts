// Generated from sea-damp.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/gpu/shared/shader';

import { WETNESS } from '@/nature/shared/shore';

import { ISLAND_SEA } from './island-sea.shader.generated';

export const SEA_DAMP = wgsl(
  'island/pages/island/lib/sea-damp',
  /* wgsl */ `
/// \`lit\` at a point ashore over a floor at \`bed\`, dark where a sheet has just
/// left the sand, drying back to its own colour.
fn seaDamp(lit: vec4f, world: vec3f, bed: f32, swell: vec2f) -> vec4f {
  let near = seaNear(world);
  if (bed > 1.5 || near <= 0.0) {
    return lit;
  }
  let tau = seaTau(world, bed, swell);
  let damp = near * dampAfter(drySince(tau, bed, seaTongue(world, swell)));
  return vec4f(lit.rgb * mix(vec3f(1.0), vec3f(0.6, 0.57, 0.52), damp), lit.a);
}
`,
  ISLAND_SEA,
  WETNESS,
);
