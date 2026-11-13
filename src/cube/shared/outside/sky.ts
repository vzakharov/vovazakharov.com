import { wgsl } from '../lib/wgsl';
import { CLOUDS_WGSL } from '../sky/clouds';

/**
 * `skyRadiance(dir: vec3f, lod: f32) -> vec3f`: the sky's light along unit
 * `dir` at this instant, without the sun's own disc and glare. At `lod` 0 it
 * is the sky the backdrop draws, clouds marched in full, which costs what a
 * backdrop pixel does; from 1 up the clouds are a few samples of where they
 * stand, for a reflection or the light a rough face gathers.
 */
export const SKY = wgsl(
  'outside/sky',
  /* wgsl */ `
fn skyRadiance(dir: vec3f, lod: f32) -> vec3f {
  let clouds = cloudVeil(dir);
  var behind = clearSky(dir) + aureole(dir);
  if (lod < 0.5) { behind += sunDisc(dir, 0.0005); }
  return behind * clouds.a + clouds.rgb;
}
`,
  CLOUDS_WGSL,
);
