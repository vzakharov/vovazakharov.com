/// <reference types="@webgpu/types" />

import { CLOUDS, WIND_AXIS } from '../model/cloud-field';
import { EYE_RADIUS } from '../model/sky-light';
import { AIR } from '../model/atmosphere';
import { AIR_WGSL, f } from './air';
import { type CloudMoment, type Panorama, PANORAMA_WGSL } from './panorama';
import { SKY_VIEW_WGSL } from './sky-view';
import { SUN_WGSL } from './sun-disc';
import { type AirTables, compiled } from './tables';

/** The frame's uniforms as every outdoor pipeline declares them at group 0. */
export const FRAME_WGSL = /* wgsl */ `
struct OutdoorFrame {
  viewProjection: mat4x4f,
  inverse: mat4x4f,
  eye: vec4f,
  sun: vec4f,
  clock: vec4f,
};
@group(0) @binding(0) var<uniform> frame: OutdoorFrame;
`;

const SHADER = /* wgsl */ `
${FRAME_WGSL}
@group(1) @binding(0) var transmittanceTable: texture_2d<f32>;
@group(1) @binding(1) var scatterTable: texture_2d<f32>;
@group(1) @binding(2) var tableSampler: sampler;
@group(1) @binding(3) var skyView: texture_2d<f32>;
@group(1) @binding(4) var cloudA: texture_2d<f32>;
@group(1) @binding(5) var cloudB: texture_2d<f32>;
@group(1) @binding(6) var awayA: texture_2d<f32>;
@group(1) @binding(7) var awayB: texture_2d<f32>;
@group(1) @binding(8) var panoramaSampler: sampler;
/// xy: the two paintings' ages in seconds; zw: the share of each in the frame.
@group(1) @binding(9) var<uniform> moment: vec4f;

${AIR_WGSL}
${SKY_VIEW_WGSL}
${SUN_WGSL}
${PANORAMA_WGSL}

/// Kilometres a second the clouds go down the wind.
const WIND = vec3f(${f(WIND_AXIS[0])}, 0.0, ${f(WIND_AXIS[1])}) * ${f((CLOUDS.tile * CLOUDS.tilesPerHour) / 3600)};
/// Where the paintings were painted from, in km of W.
const PAINTED_FROM = vec3f(0.0, ${f(EYE_RADIUS - AIR.ground)}, 0.0);

/// A painting of the clouds along \`dir\`, \`age\` seconds after it was
/// painted: each cloud has since gone down the wind and the eye has walked,
/// so the painting is read where that cloud was seen from where it was painted.
fn cloudsIn(cloud: texture_2d<f32>, away: texture_2d<f32>, dir: vec3f, age: f32) -> vec4f {
  let shift = frame.eye.xyz * 0.001 - PAINTED_FROM - WIND * age;
  var seen = dir;
  for (var i = 0; i < 2; i++) {
    let far = textureSampleLevel(away, panoramaSampler, panoramaUv(seen), 0.0).r;
    seen = normalize(dir * far + shift);
  }
  let painted = textureSampleLevel(cloud, panoramaSampler, panoramaUv(seen), 0.0);
  // Past the painting's top edge and under the horizon there is no cloud.
  let lift = asin(clamp(seen.y, -1.0, 1.0)) / PANORAMA_LIFT;
  let inside = (1.0 - smoothstep(0.94, 1.0, lift)) * step(0.0, lift);
  return mix(vec4f(0.0, 0.0, 0.0, 1.0), painted, inside);
}

/// The clouds along \`dir\` now: rgb their light, a what shows through them.
fn cloudsAt(dir: vec3f) -> vec4f {
  return cloudsIn(cloudA, awayA, dir, moment.x) * moment.z
    + cloudsIn(cloudB, awayB, dir, moment.y) * moment.w;
}

struct Sight {
  @builtin(position) clip: vec4f,
  @location(0) ndc: vec2f,
};

@vertex
fn sightMain(@builtin(vertex_index) index: u32) -> Sight {
  let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  var out: Sight;
  // Depth 0 is the far plane: whatever is drawn after this wins.
  out.clip = vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
  out.ndc = out.clip.xy;
  return out;
}

struct Scene {
  @location(0) light: vec4f,
  @location(1) mirror: vec4f,
  @location(2) plane: vec4f,
};

fn sightOf(ndc: vec2f) -> vec3f {
  let far = frame.inverse * vec4f(ndc, 0.0, 1.0);
  return normalize(far.xyz / far.w - frame.eye.xyz);
}

@fragment
fn backdropMain(in: Sight) -> Scene {
  let dir = sightOf(in.ndc);
  let sun = frame.sun.xyz;
  let edge = length(sightOf(in.ndc + vec2f(0.0, 2.0 / frame.clock.w)) - dir);
  let sky = clearSky(dir, sun) + aureole(dir, sun) + sunDisc(dir, sun, edge);
  let clouds = cloudsAt(dir);
  var out: Scene;
  out.light = vec4f(sky * clouds.a + clouds.rgb, 1e4);
  out.mirror = vec4f(0.0);
  out.plane = vec4f(0.0);
  return out;
}
`;

type Targets = {
  /** The scene pass's three colour formats and its depth's. */
  colours: readonly GPUTextureFormat[];
  depth: GPUTextureFormat;
  /** Group 0's layout: the frame's uniforms. */
  frame: GPUBindGroupLayout;
};

export type Backdrop = {
  /** Tells the backdrop how the paintings blend this frame. */
  show: (moment: CloudMoment) => void;
  draw: (pass: GPURenderPassEncoder) => void;
  dispose: () => void;
};

/** The sky behind everything, drawn first in the scene pass at the far plane. */
export async function createBackdrop(
  device: GPUDevice,
  targets: Targets,
  tables: AirTables,
  skyView: GPUTexture,
  panorama: Panorama,
): Promise<Backdrop> {
  const shader = await compiled(device, 'sky backdrop', SHADER);
  const float: GPUBindGroupLayoutEntry['texture'] = {};
  const layout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: float },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: float },
      { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
      { binding: 3, visibility: GPUShaderStage.FRAGMENT, texture: float },
      ...[4, 5, 6, 7].map((binding) => ({
        binding,
        visibility: GPUShaderStage.FRAGMENT,
        texture: float,
      })),
      { binding: 8, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
      { binding: 9, visibility: GPUShaderStage.FRAGMENT, buffer: {} },
    ],
  });
  const moment = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [targets.frame, layout],
    }),
    vertex: { module: shader, entryPoint: 'sightMain' },
    fragment: {
      module: shader,
      entryPoint: 'backdropMain',
      targets: targets.colours.map((format) => ({ format })),
    },
    depthStencil: {
      format: targets.depth,
      depthCompare: 'always',
      depthWriteEnabled: false,
    },
  });
  const group = device.createBindGroup({
    layout,
    entries: [
      { binding: 0, resource: tables.transmittance.createView() },
      { binding: 1, resource: tables.scatter.createView() },
      { binding: 2, resource: tables.sampler },
      { binding: 3, resource: skyView.createView() },
      { binding: 4, resource: panorama.clouds[0] },
      { binding: 5, resource: panorama.clouds[1] },
      { binding: 6, resource: panorama.aways[0] },
      { binding: 7, resource: panorama.aways[1] },
      {
        binding: 8,
        resource: device.createSampler({
          magFilter: 'linear',
          minFilter: 'linear',
          addressModeU: 'repeat',
        }),
      },
      { binding: 9, resource: { buffer: moment } },
    ],
  });
  return {
    show: ({ ages, shares }) => {
      device.queue.writeBuffer(moment, 0, new Float32Array([...ages, ...shares]));
    },
    dispose: () => {
      moment.destroy();
    },
    draw: (pass) => {
      pass.setPipeline(pipeline);
      pass.setBindGroup(1, group);
      pass.draw(3);
    },
  };
}
