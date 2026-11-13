import { type Wgsl, wgsl } from '@/cube/shared/lib/wgsl';
import { OUTDOOR_STAGE, SKY, SUN } from '@/cube/shared/outside';

/** The sky as the backdrop: `skyRadiance` at its sharpest, and the sun's disc. */
const SKY_SHADER = wgsl(
  'sky/stand-in',
  /* wgsl */ `
@fragment
fn fragmentMain(@builtin(position) at: vec4f) -> Scene {
  let dir = rayThrough(at.xy);
  let disc = smoothstep(0.99996, 0.99999, dot(dir, SUN_DIR));
  return lit(skyRadiance(dir, 0.0) + SUN_LIGHT * 40.0 * disc, SKY_METRES);
}
`,
  OUTDOOR_STAGE,
  SKY,
  SUN,
);

/** What the sky layer's shader is assembled from. */
export const SKY_ROOTS: readonly Wgsl[] = [SKY_SHADER];
