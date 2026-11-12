import { wgsl } from '../lib/wgsl';
import { OUTDOOR_STAGE } from '../outside/stage';
import { CLOUDS_WGSL } from './clouds';
import { SUN_GLOW } from './sun-glow';

/**
 * The clouds of this frame, drawn over the whole of a target smaller than the
 * screen: `cloudVertex` and `cloudFragment`, which writes the light the
 * clouds send and, in a, the share of the sky behind them that shows. Group 0
 * is the `OutdoorFrame` block alone.
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
  return cloudsAlong(rayThrough(across.screen * frame.clock.zw), jitter);
}
`,
  OUTDOOR_STAGE,
  CLOUDS_WGSL,
);

/**
 * The sky behind everything: the clear air, the sun in it, and over them the
 * frame's clouds from `cloudTarget`, the target `SKY_CLOUD_SHADER` drew.
 */
export const SKY_SHADER = wgsl(
  'sky/shader',
  /* wgsl */ `
@group(1) @binding(0) var cloudTarget: texture_2d<f32>;
@group(1) @binding(1) var cloudSampler: sampler;

@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> Scene {
  let dir = rayThrough(position.xy);
  let edge = length(fwidth(dir));
  let clouds = textureSampleLevel(cloudTarget, cloudSampler, position.xy / frame.clock.zw, 0.0);
  let behind = clearSky(dir) + aureole(dir) + sunDisc(dir, edge);
  return lit(behind * clouds.a + clouds.rgb, SKY_METRES);
}
`,
  OUTDOOR_STAGE,
  SUN_GLOW,
);
