import { wgsl } from '../shader/wgsl';
import { CUBE_SHADOW } from './cube-shadow';
import { SUN } from './sun';

/**
 * `daylight(p: vec3f, normal: vec3f) -> vec3f`: the light falling on a matte
 * face at `p` in the world frame, to be multiplied by what the face is made
 * of — the sun where the cube's shadow lets it through, and the sky's fill,
 * more of it the more of the sky the face looks at.
 */
export const DAYLIGHT = wgsl(
  'outside/daylight',
  /* wgsl */ `
fn daylight(p: vec3f, normal: vec3f) -> vec3f {
  let sun = SUN_LIGHT * max(dot(normal, SUN_DIR), 0.0) * cubeShadow(p);
  return sun + SKY_FILL * (0.5 + 0.5 * normal.y);
}
`,
  SUN,
  CUBE_SHADOW,
);
