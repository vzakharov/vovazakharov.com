// Generated from island-ease.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '../shader/wgsl';

export const ISLAND_EASE = wgsl(
  'cube/shared/outside/island-ease',
  /* wgsl */ `
fn sq(v: f32) -> f32 {
  return v * v;
}

/// \`k\`-wide smooth \`max(a, 0)\`.
fn softPlus(a: f32, k: f32) -> f32 {
  return k * (max(a / k, 0.0) + log(1.0 + exp(-abs(a / k))));
}

fn softMin(a: f32, b: f32, k: f32) -> f32 {
  return a - softPlus(a - b, k);
}

fn softMax(a: f32, b: f32, k: f32) -> f32 {
  return a + softPlus(b - a, k);
}

/// A smooth step from 0 to 1 about \`v\` = 0, finite however large \`v\` is.
fn eased(v: f32) -> f32 {
  return 0.5 + 0.5 * tanh(clamp(v, -20.0, 20.0));
}
`,
);
