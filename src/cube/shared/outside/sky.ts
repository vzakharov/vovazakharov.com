import { wgsl } from '../lib/wgsl';
import { OUTDOOR_FRAME } from './outdoor-frame';
import { SUN } from './sun';

/**
 * `skyRadiance(dir: vec3f, lod: f32) -> vec3f`: the sky's light along unit
 * `dir` at the frame's clock, without the sun's disc — a function of the two
 * alone, read from no texture. `lod` trades detail for cost: 0 as the backdrop
 * draws it, higher blurrier and cheaper, for a rough mirror or a face's fill.
 */
export const SKY = wgsl(
  'outside/sky',
  /* wgsl */ `
fn skyRadiance(dir: vec3f, lod: f32) -> vec3f {
  let horizon = vec3f(3.2, 2.0, 1.1);
  let zenith = vec3f(0.5, 0.9, 1.9);
  let blur = clamp(lod / 8.0, 0.0, 1.0);
  let towards = max(dot(dir, SUN_DIR), 0.0);
  let glow = SUN_LIGHT
    * (0.25 * pow(towards, 8.0) + 1.5 * (1.0 - blur) * pow(towards, 64.0));
  let above = mix(horizon, zenith, pow(max(dir.y, 0.0), 0.45)) + glow;
  let below = vec3f(0.25, 0.3, 0.4);
  let sharp = mix(above, below, smoothstep(0.0, -0.1, dir.y));
  let soft = mix(below, mix(horizon, zenith, 0.5), 0.5 + 0.5 * dir.y);
  return mix(sharp, soft, blur);
}
`,
  SUN,
  OUTDOOR_FRAME,
);
