import { f32, type Wgsl, wgsl } from '@/cube/shared/lib/wgsl';
import {
  OUTDOOR_STAGE,
  SKY_MAP,
  SKY_MAPPING,
  SUN,
} from '@/cube/shared/outside';

/**
 * A stand-in sky: a warm horizon under a blue zenith, a glow round the sun
 * and its disc. `fragmentMain` is the backdrop; `mapFragment` paints the sky
 * map, without the disc, which a mirror shows by the sun's own light.
 */
const SKY_SHADER = wgsl(
  'sky/stand-in',
  /* wgsl */ `
fn skyColour(dir: vec3f) -> vec3f {
  let horizon = vec3f(3.2, 2.0, 1.1);
  let zenith = vec3f(0.5, 0.9, 1.9);
  let towards = max(dot(dir, SUN_DIR), 0.0);
  let glow = SUN_LIGHT * (0.25 * pow(towards, 8.0) + 1.5 * pow(towards, 64.0));
  let above = mix(horizon, zenith, pow(max(dir.y, 0.0), 0.45)) + glow;
  return mix(above, vec3f(0.25, 0.3, 0.4), smoothstep(0.0, -0.1, dir.y));
}

@fragment
fn fragmentMain(@builtin(position) at: vec4f) -> Scene {
  let dir = rayThrough(at.xy);
  let disc = smoothstep(0.99996, 0.99999, dot(dir, SUN_DIR));
  return lit(skyColour(dir) + SUN_LIGHT * 40.0 * disc, SKY_METRES);
}

@fragment
fn mapFragment(@builtin(position) at: vec4f) -> @location(0) vec4f {
  let uv = at.xy / vec2f(${f32(SKY_MAP.width)}, ${f32(SKY_MAP.height)});
  return vec4f(skyColour(skyDir(uv)), 1.0);
}
`,
  OUTDOOR_STAGE,
  SKY_MAPPING,
  SUN,
);

/** What the sky layer's shader is assembled from. */
export const SKY_ROOTS: readonly Wgsl[] = [SKY_SHADER];
