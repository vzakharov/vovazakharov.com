/// <reference types="@webgpu/types" />

import type { CanDispose } from '@/kernel/shared/typings';

import {
  OUTDOOR_FRAME_FLOATS,
  type OutdoorFrame,
  packOutdoorFrame,
  SKY_MAP,
} from '@/cube/shared/outside';

import { outdoorSource } from '../lib/outdoor-shaders';
import { SCENE_FORMAT } from './bloom';
import { createHalver } from './mips';
import {
  type LayerMaker,
  type LayerName,
  LAYERS,
  type OutdoorKit,
  type OutdoorLayer,
} from './outdoor-layer';
import { compiled, DEPTH_FORMAT, SCENE_TARGETS } from './programs';
import { sandLayer } from './sand-layer';
import { seaLayer } from './sea-layer';
import { shellLayer } from './shell-layer';
import { skyLayer } from './sky-layer';

const MAKERS: Record<LayerName, LayerMaker> = {
  sky: skyLayer,
  sand: sandLayer,
  shell: shellLayer,
  sea: seaLayer,
};

/** The layers the rooms are drawn over, and the ones drawn over the rooms. */
const BEHIND = LAYERS.filter((name) => name !== 'sea');
const OVER = LAYERS.filter((name) => name === 'sea');

/** The outside, drawn into the frames that show it. */
export type Outdoors = CanDispose & {
  /** Records every layer's own passes for a frame seen as `frame`. */
  prepare: (encoder: GPUCommandEncoder, frame: OutdoorFrame) => void;
  /** Draws into the scene pass what lies behind the rooms; group 0 is left its own. */
  behind: (pass: GPURenderPassEncoder) => void;
  /** Draws into the scene pass what lies over the rooms. */
  over: (pass: GPURenderPassEncoder) => void;
};

/**
 * The outside's layers on `device`, each made and its shaders compiled;
 * rejects with the compiler's words on one that does not compile.
 */
export async function createOutdoors(device: GPUDevice): Promise<Outdoors> {
  const frame = device.createBuffer({
    size: OUTDOOR_FRAME_FLOATS * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const skyMap = device.createTexture({
    size: [SKY_MAP.width, SKY_MAP.height],
    format: SCENE_FORMAT,
    mipLevelCount: Math.floor(Math.log2(SKY_MAP.width)) + 1,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
  });
  const layout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: {},
      },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
      { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
    ],
  });
  const group = device.createBindGroup({
    layout,
    entries: [
      { binding: 0, resource: { buffer: frame } },
      { binding: 1, resource: skyMap.createView() },
      {
        binding: 2,
        // Round the horizon the map meets itself; at the poles it does not.
        resource: device.createSampler({
          magFilter: 'linear',
          minFilter: 'linear',
          mipmapFilter: 'linear',
          addressModeU: 'repeat',
        }),
      },
    ],
  });

  const kit: OutdoorKit = {
    device,
    layout,
    frame,
    skyMap,
    mips: createHalver(device, SCENE_FORMAT),
    shader: async (label, roots) =>
      compiled(device, `The outdoor ${label} shader`, outdoorSource(roots)),
    pipeline: async ({
      label,
      module,
      depth,
      vertex = 'vertexMain',
      fragment = 'fragmentMain',
      buffers = [],
      groups = [],
      cullMode = 'back',
    }) =>
      device.createRenderPipelineAsync({
        label,
        layout: device.createPipelineLayout({
          bindGroupLayouts: [layout, ...groups],
        }),
        vertex: { module, entryPoint: vertex, buffers },
        fragment: { module, entryPoint: fragment, targets: SCENE_TARGETS },
        primitive: { topology: 'triangle-list', cullMode },
        depthStencil: {
          format: DEPTH_FORMAT,
          depthWriteEnabled: depth === 'solid',
          depthCompare: depth === 'solid' ? 'greater' : 'always',
        },
      }),
  };

  const made = await Promise.all(
    LAYERS.map(async (name) => [name, await MAKERS[name](kit)] as const),
  );
  const layers = new Map<LayerName, OutdoorLayer>(made);
  const draw = (pass: GPURenderPassEncoder, names: readonly LayerName[]) => {
    pass.setBindGroup(0, group);
    for (const name of names) layers.get(name)?.draw(pass);
  };

  return {
    prepare: (encoder, seen) => {
      device.queue.writeBuffer(frame, 0, packOutdoorFrame(seen));
      for (const layer of layers.values()) layer.prepare?.(encoder, seen);
    },
    behind: (pass) => {
      draw(pass, BEHIND);
    },
    over: (pass) => {
      draw(pass, OVER);
    },
    dispose: () => {
      for (const layer of layers.values()) layer.dispose();
      skyMap.destroy();
      frame.destroy();
    },
  };
}
