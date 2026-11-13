// Generated from sky-shader.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { OUTDOOR_FRAME } from '../outside/outdoor-frame';
import { OUTDOOR_STAGE } from '../outside/outdoor-stage.shader';
import { STAGE_NUMBERS } from '../outside/stage-numbers';
import { WATER_BODY } from '../sea/water-body.shader';
import { wgsl } from '../shader/wgsl';
import { CLEAR_SKY } from './clear-sky.shader';
import { SKY_SHADER_NUMBERS } from './sky-shader-numbers';
import { SUN_GLOW } from './sun-glow.shader';

export const SKY_SHADER = wgsl(
  'cube/shared/sky/sky-shader',
  /* wgsl */ `
@group(1) @binding(0) var skyTarget: texture_2d<f32>;
@group(1) @binding(1) var skySampler: sampler;

@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> Scene {
  let dir = rayThrough(position.xy);
  let edge = length(fwidth(dir));
  let sky =
    textureSampleLevel(
      skyTarget,
      skySampler,
      position.xy / frame.clock.zw,
      0.0,
    );
  if (dir.y < 0.0) {
    let wets = max(frame.eye.y, 0.0) / -dir.y;
    if (wets < FAR_METRES) {
      let air = airThrough(wets);
      return
        lit(drownedBody() * air + sky.rgb * (vec3f(1.0) - air), SKY_METRES);
    }
  }
  return lit(sky.rgb + sunDisc(dir, edge) * sky.a, SKY_METRES);
}
`,
  OUTDOOR_FRAME,
  OUTDOOR_STAGE,
  STAGE_NUMBERS,
  WATER_BODY,
  CLEAR_SKY,
  SKY_SHADER_NUMBERS,
  SUN_GLOW,
);
