import { f32, vecf, wgsl } from '../lib/wgsl';
import { CLOUD_VEIL } from '../sky/cloud-veil';
import { SKY_FILL } from './sun';

/** The widest lobe a caller asks for: a quarter of the sphere. */
const WIDEST_LOD = 8;

/**
 * `skyRadiance(dir: vec3f, lod: f32) -> vec3f`: the sky's light along unit
 * `dir` at this instant, gathered over a lobe that doubles in width with each
 * unit of `lod`, from a mirror's at 0 to a quarter of the sphere at 8.
 *
 * - Under 1 it is the sky a mirror shows: the fitted air, the glow round the
 *   sun, the ice cloud and each cumulus where it stands, lit as a whole
 *   rather than marched. The sun's own disc is in it at 0 and gone by a half.
 * - From 1 up it is a few dozen operations: the air smoothed, the sun's halo,
 *   the clouds as the cover they make toward the horizon, all drawn toward
 *   the whole sky's mean as the lobe widens.
 *
 * Between a half and 1 the two are mixed, so a face whose roughness crosses
 * there shows no seam.
 */
export const SKY = wgsl(
  'outside/sky',
  /* wgsl */ `
fn skyMirrored(dir: vec3f, lod: f32) -> vec3f {
  let clouds = cloudVeil(dir);
  let air = clearSky(dir);
  let cirrus = cirrusAlong(dir, air);
  var behind = cirrus.rgb + cirrus.a * (air + aureole(dir));
  if (lod < 0.5) { behind += sunDisc(dir, 0.0005) * cirrus.a * (1.0 - smoothstep(0.0, 0.5, lod)); }
  return behind * clouds.a + clouds.rgb;
}

fn skyGathered(dir: vec3f, lod: f32) -> vec3f {
  let clouds = cloudGlance(dir);
  let sky = (skyGlance(dir) + sunHalo(dir)) * clouds.a + clouds.rgb;
  let wide = clamp((lod - 1.0) / ${f32(WIDEST_LOD - 1)}, 0.0, 1.0);
  return mix(sky, ${vecf(SKY_FILL)}, 0.7 * wide * wide);
}

fn skyRadiance(dir: vec3f, lod: f32) -> vec3f {
  if (lod >= 1.0) { return skyGathered(dir, lod); }
  let mirrored = skyMirrored(dir, lod);
  if (lod <= 0.5) { return mirrored; }
  return mix(mirrored, skyGathered(dir, lod), smoothstep(0.5, 1.0, lod));
}
`,
  CLOUD_VEIL,
);
