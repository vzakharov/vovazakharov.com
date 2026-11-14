// Generated from sky-shader.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

import { CLEAR_SKY } from './clear-sky.shader';
import { OUTDOOR_FRAME } from './outdoor-frame';
import { OUTDOOR_STAGE } from './outdoor-stage.shader';
import { SKY_SHADER_NUMBERS } from './sky-shader-numbers';
import { STAGE_NUMBERS } from './stage-numbers';
import { SUN_GLOW } from './sun-glow.shader';
import { WATER_BODY } from './water-body.shader';

export const SKY_SHADER = wgsl(
  'cube/widgets/outdoors/lib/sky-shader',
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
