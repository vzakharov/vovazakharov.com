import type { CanDispose, Timed } from '@/kernel/shared/typings';

import { RINGS, SPOKES } from '../lib/sea-surface-wgsl';
import { seaShader } from '../lib/sea-wgsl';
import { SEA_SEED, SEAS } from '../model/sea-state';
import { createWaveField } from './wave-field';

/** What the scene pass gives the sea to draw into and with. */
export type SeaScene = {
  /** WGSL declaring `frame` (group 0) and the scene's shared functions. */
  listing: string;
  frame: GPUBindGroupLayout;
  targets: readonly GPUTextureFormat[];
  depth: GPUTextureFormat;
};

/** Where the eye is and which way it faces, for laying the mesh under it. */
export type SeaView = Timed & {
  /** Radians from +x toward +z. */
  yaw: number;
  /** Radians above the horizon. */
  elevation: number;
};

export type SeaLayer = CanDispose & {
  /** Encodes the wave field's passes for this frame. */
  prepare: (encoder: GPUCommandEncoder, view: SeaView) => void;
  /** Draws the sea into the scene pass, group 0 already set. */
  draw: (pass: GPURenderPassEncoder) => void;
};

/** The sector of rings laid ahead of a level eye, and round one looking down. */
const AHEAD = (150 * Math.PI) / 180;
const AROUND = 2 * Math.PI;
/** Below this elevation the eye sees water behind its own feet. */
const LOOKING_DOWN = -0.6;

/** The mesh's triangles: two per cell between neighbouring rings and spokes. */
function cells(): Uint32Array {
  const indices = new Uint32Array((RINGS - 1) * SPOKES * 6);
  const row = SPOKES + 1;
  let at = 0;
  for (let ring = 0; ring < RINGS - 1; ring += 1) {
    for (let spoke = 0; spoke < SPOKES; spoke += 1) {
      const corner = ring * row + spoke;
      indices.set(
        [corner, corner + row, corner + 1, corner + 1, corner + row, corner + row + 1],
        at,
      );
      at += 6;
    }
  }
  return indices;
}

export function createSeaLayer(
  device: GPUDevice,
  scene: SeaScene,
  shore: string,
): SeaLayer {
  const field = createWaveField(device, SEAS, SEA_SEED);
  const module = device.createShaderModule({
    code: seaShader(scene.listing, shore),
  });
  const own = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {},
      },
      {
        binding: 1,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        sampler: {},
      },
      ...[2, 3, 4].map((binding) => ({
        binding,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        texture: { viewDimension: '2d-array' as const },
      })),
    ],
  });
  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [scene.frame, own],
    }),
    vertex: { module, entryPoint: 'seaVertex' },
    fragment: {
      module,
      entryPoint: 'seaFragment',
      targets: scene.targets.map((format) => ({ format })),
    },
    primitive: { topology: 'triangle-list', cullMode: 'none' },
    depthStencil: {
      format: scene.depth,
      depthCompare: 'greater',
      depthWriteEnabled: true,
    },
  });

  const grid = new Float32Array(4);
  const gridBuffer = device.createBuffer({
    size: grid.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const indices = cells();
  const indexBuffer = device.createBuffer({
    size: indices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(indexBuffer, 0, indices);
  const group = device.createBindGroup({
    layout: own,
    entries: [
      { binding: 0, resource: { buffer: gridBuffer } },
      {
        binding: 1,
        resource: device.createSampler({
          addressModeU: 'repeat',
          addressModeV: 'repeat',
          magFilter: 'linear',
          minFilter: 'linear',
          mipmapFilter: 'linear',
          maxAnisotropy: 16,
        }),
      },
      { binding: 2, resource: field.shift },
      { binding: 3, resource: field.slope },
      { binding: 4, resource: field.moment },
    ],
  });

  return {
    prepare: (encoder, { seconds, yaw, elevation }) => {
      field.run(encoder, { seconds });
      const sector = elevation < LOOKING_DOWN ? AROUND : AHEAD;
      // Whole spokes only: the mesh turns in steps it cannot be seen to take.
      const step = sector / SPOKES;
      grid.set([Math.round(yaw / step) * step, sector]);
      device.queue.writeBuffer(gridBuffer, 0, grid);
    },
    draw: (pass) => {
      pass.setPipeline(pipeline);
      pass.setBindGroup(1, group);
      pass.setIndexBuffer(indexBuffer, 'uint32');
      pass.drawIndexed(indices.length);
    },
    dispose: () => {
      field.dispose();
      gridBuffer.destroy();
      indexBuffer.destroy();
    },
  };
}
