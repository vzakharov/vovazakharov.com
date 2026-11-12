/// <reference types="@webgpu/types" />

import { compiled } from './tables';

/** What the noise is kept in: the one filterable format a compute pass may write. */
const NOISE_FORMAT: GPUTextureFormat = 'rgba8unorm';

/** Voxels along a side of the clouds' shape, of their fine grain, and texels of their weather. */
export const NOISE_SIZE = { shape: 128, grain: 32, weather: 256 } as const;

/**
 * Noise that tiles, each lattice value an integer hash: Perlin's gradient
 * noise and Worley's cells in three dimensions, and the sums of octaves
 * clouds are cut from, after Schneider's Perlin–Worley.
 */
const NOISE_WGSL = /* wgsl */ `
fn pcg3(p: vec3u) -> vec3u {
  var v = p * 1664525u + 1013904223u;
  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
  v ^= v >> vec3u(16u);
  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
  return v;
}

/// Three numbers in [0, 1) for lattice point \`cell\` of a lattice \`period\` wide.
fn latticeUnit(cell: vec3i, period: i32, salt: u32) -> vec3f {
  let wrapped = vec3u((cell % period + period) % period);
  return vec3f(pcg3(wrapped + vec3u(salt, salt * 7u, salt * 13u)) >> vec3u(8u)) / 16777216.0;
}

/// Perlin's noise in about [-1, 1], \`period\` cells to the tile.
fn gradientNoise(p: vec3f, period: i32, salt: u32) -> f32 {
  let cell = vec3i(floor(p));
  let f = fract(p);
  let u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  var corners: array<f32, 8>;
  for (var i = 0; i < 8; i++) {
    let o = vec3i(i & 1, (i >> 1) & 1, (i >> 2) & 1);
    let g = normalize(latticeUnit(cell + o, period, salt) * 2.0 - 1.0 + 1e-6);
    corners[i] = dot(g, f - vec3f(o));
  }
  let x0 = mix(corners[0], corners[1], u.x);
  let x1 = mix(corners[2], corners[3], u.x);
  let x2 = mix(corners[4], corners[5], u.x);
  let x3 = mix(corners[6], corners[7], u.x);
  return mix(mix(x0, x1, u.y), mix(x2, x3, u.y), u.z) * 1.6;
}

/// Worley's cells, turned over: 1 at a cell's point, 0 far from any.
fn cellNoise(p: vec3f, period: i32, salt: u32) -> f32 {
  let cell = vec3i(floor(p));
  var nearest = 8.0;
  for (var z = -1; z <= 1; z++) {
    for (var y = -1; y <= 1; y++) {
      for (var x = -1; x <= 1; x++) {
        let other = cell + vec3i(x, y, z);
        let away = vec3f(other) + latticeUnit(other, period, salt) - p;
        nearest = min(nearest, dot(away, away));
      }
    }
  }
  return 1.0 - clamp(sqrt(nearest), 0.0, 1.0);
}

/// Three octaves of cells from \`period\` to the tile.
fn cellSum(uvw: vec3f, period: i32, salt: u32) -> f32 {
  return 0.625 * cellNoise(uvw * f32(period), period, salt)
    + 0.25 * cellNoise(uvw * f32(period * 2), period * 2, salt + 1u)
    + 0.125 * cellNoise(uvw * f32(period * 4), period * 4, salt + 2u);
}

/// Octaves of Perlin's noise from \`period\` to the tile, in [0, 1].
fn gradientSum(uvw: vec3f, period: i32, octaves: i32, salt: u32) -> f32 {
  var sum = 0.0;
  var weight = 0.5;
  var cells = period;
  for (var i = 0; i < octaves; i++) {
    sum += weight * gradientNoise(uvw * f32(cells), cells, salt + u32(i));
    weight *= 0.5;
    cells *= 2;
  }
  return clamp(sum * 0.5 + 0.5, 0.0, 1.0);
}

fn remap(x: f32, a: f32, b: f32, c: f32, d: f32) -> f32 {
  return c + (x - a) / (b - a) * (d - c);
}
`;

const SHAPE_WGSL = /* wgsl */ `
${NOISE_WGSL}
@group(0) @binding(0) var into: texture_storage_3d<${NOISE_FORMAT}, write>;

/// r: the billows a cloud is cut from, Perlin's noise swollen by cells;
/// g, b, a: cells alone, each twice as fine, for wearing the billows' edges.
@compute @workgroup_size(4, 4, 4)
fn shapeMain(@builtin(global_invocation_id) id: vec3u) {
  let uvw = (vec3f(id) + 0.5) / f32(textureDimensions(into).x);
  let perlin = gradientSum(uvw, 4, 5, 11u);
  let billows = remap(perlin, 0.0, 1.0, cellSum(uvw, 4, 23u), 1.0);
  textureStore(into, id, vec4f(
    clamp(billows, 0.0, 1.0),
    cellSum(uvw, 8, 31u), cellSum(uvw, 16, 41u), cellSum(uvw, 32, 53u),
  ));
}

/// r: fine cells for the wisps at a cloud's edge; g: the same, coarser.
@compute @workgroup_size(4, 4, 4)
fn grainMain(@builtin(global_invocation_id) id: vec3u) {
  let uvw = (vec3f(id) + 0.5) / f32(textureDimensions(into).x);
  textureStore(into, id, vec4f(cellSum(uvw, 4, 61u), cellSum(uvw, 2, 71u), 0.0, 1.0));
}
`;

const WEATHER_WGSL = /* wgsl */ `
${NOISE_WGSL}
@group(0) @binding(0) var into: texture_storage_2d<${NOISE_FORMAT}, write>;

/// r: where clouds stand, as cells of a few kilometres with ragged rims;
/// g: how tall the cloud there grows; b: a slow unevenness of its base.
@compute @workgroup_size(8, 8)
fn weatherMain(@builtin(global_invocation_id) id: vec3u) {
  let uv = (vec2f(id.xy) + 0.5) / f32(textureDimensions(into).x);
  let uvw = vec3f(uv, 0.37);
  let cells = cellSum(uvw, 10, 83u);
  let ragged = gradientSum(uvw, 6, 5, 97u);
  let stands = remap(ragged, 0.0, 1.0, cells * 0.7, 1.0);
  let tall = gradientSum(uvw + vec3f(0.0, 0.0, 0.31), 3, 3, 101u);
  let base = gradientSum(uvw + vec3f(0.0, 0.0, 0.71), 8, 2, 113u);
  textureStore(into, id.xy, vec4f(clamp(stands, 0.0, 1.0), tall, base, 1.0));
}
`;

const MIP_WGSL = /* wgsl */ `
@group(0) @binding(0) var into: texture_storage_3d<${NOISE_FORMAT}, write>;
@group(0) @binding(1) var above: texture_3d<f32>;

/// Each voxel the mean of the eight above it.
@compute @workgroup_size(4, 4, 4)
fn mipMain(@builtin(global_invocation_id) id: vec3u) {
  var sum = vec4f(0.0);
  for (var i = 0u; i < 8u; i++) {
    sum += textureLoad(above, id * 2u + vec3u(i & 1u, (i >> 1u) & 1u, (i >> 2u) & 1u), 0);
  }
  textureStore(into, id, sum / 8.0);
}
`;

/** The clouds' three noises, and the sampler that tiles them. */
export type CloudNoise = Record<'shape' | 'grain' | 'weather', GPUTexture> & {
  sampler: GPUSampler;
};

const USAGE = GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING;

/** Fills the clouds' noise on the GPU: one dispatch a texture, and the shape's mips. */
export async function cloudNoise(device: GPUDevice): Promise<CloudNoise> {
  const cube = (side: number, mips: number): GPUTexture =>
    device.createTexture({
      size: [side, side, side],
      dimension: '3d',
      format: NOISE_FORMAT,
      mipLevelCount: mips,
      usage: USAGE,
    });
  const shape = cube(NOISE_SIZE.shape, Math.log2(NOISE_SIZE.shape) - 1);
  const grain = cube(NOISE_SIZE.grain, 1);
  const weather = device.createTexture({
    size: [NOISE_SIZE.weather, NOISE_SIZE.weather],
    format: NOISE_FORMAT,
    usage: USAGE,
  });

  const volumes = await compiled(device, 'cloud noise', SHAPE_WGSL);
  const flat = await compiled(device, 'cloud weather', WEATHER_WGSL);
  const halve = await compiled(device, 'cloud noise mips', MIP_WGSL);
  const encoder = device.createCommandEncoder();
  const fill = (
    module: GPUShaderModule,
    entryPoint: string,
    views: readonly GPUTextureView[],
    groups: readonly number[],
  ): void => {
    const pipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module, entryPoint },
    });
    const pass = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(
      0,
      device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: views.map((resource, binding) => ({ binding, resource })),
      }),
    );
    const [x = 1, y = 1, z = 1] = groups;
    pass.dispatchWorkgroups(x, y, z);
    pass.end();
  };
  const level = (texture: GPUTexture, mip: number): GPUTextureView =>
    texture.createView({ baseMipLevel: mip, mipLevelCount: 1 });
  const all = (side: number): number[] => Array<number>(3).fill(side / 4);

  fill(volumes, 'shapeMain', [level(shape, 0)], all(NOISE_SIZE.shape));
  fill(volumes, 'grainMain', [level(grain, 0)], all(NOISE_SIZE.grain));
  fill(flat, 'weatherMain', [weather.createView()], [
    NOISE_SIZE.weather / 8,
    NOISE_SIZE.weather / 8,
  ]);
  for (let mip = 1; mip < shape.mipLevelCount; mip++) {
    fill(
      halve,
      'mipMain',
      [level(shape, mip), level(shape, mip - 1)],
      all(Math.max(4, NOISE_SIZE.shape >> mip)),
    );
  }
  device.queue.submit([encoder.finish()]);

  return {
    shape,
    grain,
    weather,
    sampler: device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
      mipmapFilter: 'linear',
      addressModeU: 'repeat',
      addressModeV: 'repeat',
      addressModeW: 'repeat',
    }),
  };
}
