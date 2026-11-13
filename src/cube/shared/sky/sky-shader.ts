import { wgsl } from '../lib/wgsl';
import { OUTDOOR_STAGE } from '../outside/stage';
import { CLOUDS_WGSL } from './clouds';
import { SUN_GLOW } from './sun-glow';

/**
 * The sky of this frame without the sun's disc, drawn over the whole of a
 * target smaller than the screen: `cloudVertex` and `cloudFragment`, which
 * writes `skyAlong`. Group 0 is the `OutdoorFrame` block alone.
 */
export const SKY_CLOUD_SHADER = wgsl(
  'sky/cloud-shader',
  /* wgsl */ `
struct Across {
  @builtin(position) position: vec4f,
  /// The screen, 0 to 1 from its top left corner.
  @location(0) screen: vec2f,
};

@vertex
fn cloudVertex(@builtin(vertex_index) index: u32) -> Across {
  let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  return Across(vec4f(corner * 2.0 - 1.0, 0.0, 1.0), vec2f(corner.x, 1.0 - corner.y));
}

@fragment
fn cloudFragment(across: Across) -> @location(0) vec4f {
  let jitter = unitOf(cellHash(vec2i(across.position.xy), CLOUD_SALT + 10u));
  return skyAlong(rayThrough(across.screen * frame.clock.zw), jitter);
}
`,
  OUTDOOR_STAGE,
  CLOUDS_WGSL,
);

/**
 * The sky behind everything: `skyTarget`, the target `SKY_CLOUD_SHADER`
 * drew, and the sun's disc where the clouds let it through — the one thing
 * in the sky too sharp for the smaller target.
 */
export const SKY_SHADER = wgsl(
  'sky/shader',
  /* wgsl */ `
@group(1) @binding(0) var skyTarget: texture_2d<f32>;
@group(1) @binding(1) var skySampler: sampler;

@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> Scene {
  let dir = rayThrough(position.xy);
  let edge = length(fwidth(dir));
  let sky = textureSampleLevel(skyTarget, skySampler, position.xy / frame.clock.zw, 0.0);
  return lit(sky.rgb + sunDisc(dir, edge) * sky.a, SKY_METRES);
}
`,
  OUTDOOR_STAGE,
  SUN_GLOW,
);
