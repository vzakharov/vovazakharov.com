// Generated from water-light.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/gpu/shared/shader/wgsl';

import { WATER_OPTICS } from './water-optics';

export const WATER_LIGHT = wgsl(
  'nature/shared/water/water-light',
  /* wgsl */ `
/// What water returns of light meeting it head on.
const HEAD_ON = 0.0204;
/// What the water's body shows an eye inside it, of the light falling on it.
const DROWNED = vec3f(0.035, 0.13, 0.15);

/// What water reflects of light meeting it at \`cosine\`.
fn fresnel(cosine: f32) -> f32 {
  let away = 1.0 - clamp(cosine, 0.0, 1.0);
  let fifth = away * away * away * away * away;
  return HEAD_ON + (1.0 - HEAD_ON) * fifth;
}

/// What water \`depth\` metres deep keeps of light crossing it, per channel,
/// scattered light that goes on the same way counted in.
fn kept(depth: f32) -> vec3f {
  return exp(-ABSORB * max(depth, 0.0));
}
`,
  WATER_OPTICS,
);
