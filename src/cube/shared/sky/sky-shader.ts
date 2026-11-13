import { f32, wgsl } from '../lib/wgsl';
import { FAR_METRES } from '../outside/frame';
import { OUTDOOR_STAGE } from '../outside/stage';
import { WATER_BODY } from '../sea/water-body-wgsl';
import { CLEAR_SKY } from './clear-sky';
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
 *
 * Under the horizon the backdrop shows only where no surface stands in the
 * way: past the far plane, or along a ray that is already in the water or
 * meets the still sea short of it without crossing a surface — an eye under
 * a crest or under the sea. That ray runs on through water, so the backdrop
 * is the water's body, seen through the air between the eye and the still
 * sea.
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
  if (dir.y < 0.0) {
    let wets = max(frame.eye.y, 0.0) / -dir.y;
    if (wets < ${f32(FAR_METRES)}) {
      let air = airThrough(wets);
      return lit(drownedBody() * air + sky.rgb * (vec3f(1.0) - air), SKY_METRES);
    }
  }
  return lit(sky.rgb + sunDisc(dir, edge) * sky.a, SKY_METRES);
}
`,
  OUTDOOR_STAGE,
  SUN_GLOW,
  CLEAR_SKY,
  WATER_BODY,
);
