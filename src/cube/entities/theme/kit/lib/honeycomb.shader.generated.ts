// Generated from honeycomb.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

import { CORE } from './core';

export const HONEYCOMB = wgsl(
  'cube/entities/theme/kit/lib/honeycomb',
  /* wgsl */ `
/// How far apart a unit-wide honeycomb's rows lie: √3/2.
const HEX_ROW = 0.8660254;

/// A honeycomb of cells one unit apart: xy is the point's offset from the
/// nearest cell's middle, zw that middle.
fn honeycomb(p: vec2f) -> vec4f {
  let pitch = vec2f(1.0, 2.0 * HEX_ROW);
  let a = repeated(p, pitch);
  let shifted = p - pitch * 0.5;
  let b = repeated(shifted, pitch);
  let off = select(b, a, dot(a, a) < dot(b, b));
  return vec4f(off, p - off);
}
`,
  CORE,
);
