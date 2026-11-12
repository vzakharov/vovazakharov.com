/// <reference types="@webgpu/types" />

import { AIR_WGSL } from './air';
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

${AIR_WGSL}
${SKY_VIEW_WGSL}
${SUN_WGSL}

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
  var out: Scene;
  out.light = vec4f(sky, 1e4);
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

export type Backdrop = { draw: (pass: GPURenderPassEncoder) => void };

/** The sky behind everything, drawn first in the scene pass at the far plane. */
export async function createBackdrop(
  device: GPUDevice,
  targets: Targets,
  tables: AirTables,
  skyView: GPUTexture,
): Promise<Backdrop> {
  const shader = await compiled(device, 'sky backdrop', SHADER);
  const float: GPUBindGroupLayoutEntry['texture'] = {};
  const layout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: float },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: float },
      { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
      { binding: 3, visibility: GPUShaderStage.FRAGMENT, texture: float },
    ],
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
    ],
  });
  return {
    draw: (pass) => {
      pass.setPipeline(pipeline);
      pass.setBindGroup(1, group);
      pass.draw(3);
    },
  };
}
