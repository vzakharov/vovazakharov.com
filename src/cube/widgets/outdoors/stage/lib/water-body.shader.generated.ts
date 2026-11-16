// Generated from water-body.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/gpu/shared/shader';

import { WATER_LIGHT, WATER_OPTICS } from '@/nature/shared/water';

import { SUN } from '@/cube/shared/cube-boundary';

import { OUTDOOR_FRAME } from './outdoor-frame';

export const WATER_BODY = wgsl(
  'cube/widgets/outdoors/stage/lib/water-body',
  /* wgsl */ `
/// The sun's light let in per unit of level surface.
fn sunEntering() -> vec3f {
  return SUN_LIGHT * frame.sun.y * (1.0 - fresnel(frame.sun.y));
}

/// The body in the open sun: the colour a ray running on through water
/// comes to, whatever lies at its end.
fn drownedBody() -> vec3f {
  return DROWNED * (sunEntering() + SKY_FILL);
}

/// \`colour\` seen through \`metres\` of water, whose scattering blurs a thing
/// out of sight long before it is dark.
fn throughWater(colour: vec3f, metres: f32) -> vec3f {
  let keeps = exp(-ATTENUATE * max(metres, 0.0));
  return colour * keeps + drownedBody() * (vec3f(1.0) - keeps);
}

/// The metres of the segment from \`a\` to \`b\` that lie under the still sea.
fn underStill(a: vec3f, b: vec3f) -> f32 {
  let low = min(a.y, b.y);
  let high = max(a.y, b.y);
  return clamp(-low / max(high - low, 1e-4), 0.0, 1.0) * length(b - a);
}
`,
  OUTDOOR_FRAME,
  SUN,
  WATER_OPTICS,
  WATER_LIGHT,
);
