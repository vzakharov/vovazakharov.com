import type { Sized } from '@/kernel/shared/typings';

import type { Vec2, Vec3 } from '../lib/vec';
import { f32, wgsl } from '../lib/wgsl';

/**
 * The sky map: the whole sky's radiance as an equirectangular `rgba16float`
 * texture with every mip, bound at group 0, bindings 1 and 2, beside the
 * frame. Its u runs once round the horizon from west through north, its v
 * from the zenith down to the nadir.
 */
export const SKY_MAP: Sized = { width: 1024, height: 512 };

/** Where direction `dir`, a unit vector, falls in the sky map, 0 to 1. */
export const skyUv = ([x, y, z]: Vec3): Vec2 => [
  Math.atan2(z, x) / (2 * Math.PI) + 0.5,
  Math.acos(Math.min(Math.max(y, -1), 1)) / Math.PI,
];

/** The unit direction the sky map holds at `uv`: `skyUv` undone. */
export function skyDir([u, v]: Vec2): Vec3 {
  const round = (u - 0.5) * 2 * Math.PI;
  const down = v * Math.PI;
  return [
    Math.sin(down) * Math.cos(round),
    Math.cos(down),
    Math.sin(down) * Math.sin(round),
  ];
}

/**
 * `skyUv(dir) -> vec2f` and `skyDir(uv) -> vec3f`, the twins of the functions
 * above: what the sky map's own painter needs, with no map bound.
 */
export const SKY_MAPPING = wgsl(
  'outside/sky-mapping',
  /* wgsl */ `
fn skyUv(dir: vec3f) -> vec2f {
  return vec2f(
    atan2(dir.z, dir.x) / ${f32(2 * Math.PI)} + 0.5,
    acos(clamp(dir.y, -1.0, 1.0)) / ${f32(Math.PI)},
  );
}

fn skyDir(uv: vec2f) -> vec3f {
  let round = (uv.x - 0.5) * ${f32(2 * Math.PI)};
  let down = uv.y * ${f32(Math.PI)};
  return vec3f(sin(down) * cos(round), cos(down), sin(down) * sin(round));
}
`,
);

/**
 * `skyRadiance(dir: vec3f, lod: f32) -> vec3f`: the sky map along unit `dir`,
 * `lod` mips down, for a reflection or the light a rough face gathers.
 */
export const SKY = wgsl(
  'outside/sky',
  /* wgsl */ `
@group(0) @binding(1) var skyMap: texture_2d<f32>;
@group(0) @binding(2) var skySampler: sampler;

fn skyRadiance(dir: vec3f, lod: f32) -> vec3f {
  return textureSampleLevel(skyMap, skySampler, skyUv(dir), lod).rgb;
}
`,
  SKY_MAPPING,
);
