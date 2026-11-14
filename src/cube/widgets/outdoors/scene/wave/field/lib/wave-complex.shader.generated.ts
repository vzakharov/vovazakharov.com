// Generated from wave-complex.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

export const WAVE_COMPLEX = wgsl(
  'cube/widgets/outdoors/scene/wave/field/lib/wave-complex',
  /* wgsl */ `
fn times(a: vec2f, b: vec2f) -> vec2f {
  return vec2f(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

/// Two real fields' spectra as one complex one: \`a + i b\`.
fn paired(a: vec2f, b: vec2f) -> vec2f {
  return vec2f(a.x - b.y, a.y + b.x);
}
`,
);
