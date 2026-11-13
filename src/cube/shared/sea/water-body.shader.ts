// Generated from water-body.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { OUTDOOR_FRAME } from '../outside/outdoor-frame';
import { SUN } from '../outside/sun';
import { wgsl } from '../shader/wgsl';
import { WATER_OPTICS } from './water-optics';

export const WATER_BODY = wgsl(
  'cube/shared/sea/water-body',
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
);
