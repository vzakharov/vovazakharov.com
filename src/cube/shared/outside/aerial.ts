import { wgsl } from '../lib/wgsl';

/**
 * `aerial(colour: vec3f, viewDir: vec3f, metres: f32) -> vec3f`: `colour`, the
 * light of a surface `metres` off along unit `viewDir` from the eye, as it
 * arrives through the air between. Every distant outdoor surface is passed
 * through it.
 */
export const AERIAL = wgsl(
  'outside/aerial',
  /* wgsl */ `
fn aerial(colour: vec3f, viewDir: vec3f, metres: f32) -> vec3f {
  return colour;
}
`,
);
