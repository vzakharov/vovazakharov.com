// Generated from daylight.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '../shader';
import { CUBE_SHADOW } from './cube-shadow.shader';
import { SUN } from './sun';

export const DAYLIGHT = wgsl(
  'cube/shared/outside/daylight',
  /* wgsl */ `
/// The light on a matte face at \`p\` in the world frame: the sun where the
/// cube's shadow lets it through, and the sky's fill, more of it the more of
/// the sky the face looks at.
fn daylight(p: vec3f, normal: vec3f) -> vec3f {
  let sun = SUN_LIGHT * max(dot(normal, SUN_DIR), 0.0) * cubeShadow(p);
  return sun + SKY_FILL * (0.5 + 0.5 * normal.y);
}
`,
  SUN,
  CUBE_SHADOW,
);
