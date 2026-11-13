// Generated from aerial.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '../shader';
import { CLEAR_SKY } from '../sky';

export const AERIAL = wgsl(
  'cube/shared/outside/aerial',
  /* wgsl */ `
/// \`colour\`, the light of a surface \`metres\` off along unit \`viewDir\` from the
/// eye, as it arrives through the air between. What the air takes it gives
/// back as the sky's own light at the horizon on that bearing.
fn aerial(colour: vec3f, viewDir: vec3f, metres: f32) -> vec3f {
  let through = airThrough(metres);
  let horizon = clearSky(vec3f(viewDir.x, 0.0, viewDir.z));
  return colour * through + horizon * (1.0 - through);
}
`,
  CLEAR_SKY,
);
