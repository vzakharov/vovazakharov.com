import { wgsl } from '../lib/wgsl';
import { CLEAR_SKY } from '../sky/clear-sky';

/**
 * `aerial(colour: vec3f, viewDir: vec3f, metres: f32) -> vec3f`: `colour`, the
 * light of a surface `metres` off along unit `viewDir` from the eye, as it
 * arrives through the air between. Every distant outdoor surface is passed
 * through it. What the air takes it gives back as the sky's own light at the
 * horizon on that bearing, so a surface far enough off is the horizon.
 */
export const AERIAL = wgsl(
  'outside/aerial',
  /* wgsl */ `
fn aerial(colour: vec3f, viewDir: vec3f, metres: f32) -> vec3f {
  let through = airThrough(metres);
  let horizon = clearSky(vec3f(viewDir.x, 0.0, viewDir.z));
  return colour * through + horizon * (1.0 - through);
}
`,
  CLEAR_SKY,
);
