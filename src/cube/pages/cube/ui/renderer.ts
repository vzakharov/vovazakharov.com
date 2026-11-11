/// <reference types="@webgpu/types" />

import { asError } from '@/kernel/shared/lib/error-class';
import type { CanDispose } from '@/kernel/shared/typings';

import type { Vec3 } from '@/cube/entities/world';

import { VERTEX_FLOATS } from '../lib/mesh';
import type { Rgb } from '../lib/palette';
import { SHADER } from './shader';

/** What one frame is lit and fogged with, besides the camera. */
type Air = {
  eye: Vec3;
  /** Fog density per room side of the eye's floor. */
  density: number;
  fog: Rgb;
  ambient: Rgb;
};

export type Renderer = CanDispose & {
  /** Replaces the vertex buffer with `vertices` (`pack`'s layout). */
  upload: (vertices: Float32Array<ArrayBuffer>) => void;
  /** Draws a frame, `viewProjection` column-major. */
  draw: (viewProjection: Float32Array, air: Air) => void;
  /** Resolves once the GPU has finished every frame submitted so far. */
  drawn: () => Promise<void>;
  /** The adapter's vendor and architecture. */
  readonly adapter: string;
};

const UNIFORM_FLOATS = 16 + 4 * 3;
/** Float depth, cleared to 0 and kept where greater: `viewProjection` reverses it. */
const DEPTH_FORMAT: GPUTextureFormat = 'depth32float';

const float3 = (location: number, offset: number): GPUVertexAttribute => ({
  shaderLocation: location,
  offset: offset * 4,
  format: 'float32x3',
});

/** Hands `onLost` the device's loss, unless the renderer itself destroyed it. */
async function watchLoss(
  device: GPUDevice,
  onLost: (error: Error) => void,
): Promise<void> {
  const lost = await device.lost;
  if (lost.reason !== 'destroyed') {
    onLost(new Error(`WebGPU device lost: ${lost.message}`));
  }
}

/**
 * A WebGPU renderer over `canvas`, or null where the browser has no WebGPU
 * or no adapter for it. `onLost` hears the device going away.
 */
export async function createRenderer(
  canvas: HTMLCanvasElement,
  onLost: (error: Error) => void,
): Promise<Renderer | null> {
  if (!('gpu' in navigator)) return null;
  const adapter = await navigator.gpu.requestAdapter();
  if (adapter === null) return null;
  const device = await adapter.requestDevice();
  watchLoss(device, onLost).catch((error: unknown) => {
    onLost(asError(error));
  });
  const context = canvas.getContext('webgpu');
  if (context === null) return null;
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'opaque' });

  const shader = device.createShaderModule({ code: SHADER });
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shader,
      entryPoint: 'vertexMain',
      buffers: [
        {
          arrayStride: VERTEX_FLOATS * 4,
          attributes: [float3(0, 0), float3(1, 3), float3(2, 6)],
        },
      ],
    },
    fragment: {
      module: shader,
      entryPoint: 'fragmentMain',
      targets: [{ format }],
    },
    primitive: { topology: 'triangle-list', cullMode: 'back' },
    depthStencil: {
      format: DEPTH_FORMAT,
      depthWriteEnabled: true,
      depthCompare: 'greater',
    },
  });
  const uniforms = device.createBuffer({
    size: UNIFORM_FLOATS * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniforms } }],
  });

  let vertices: GPUBuffer | null = null;
  let count = 0;
  let depth: GPUTexture | null = null;

  const depthView = (): GPUTextureView => {
    const { width, height } = canvas;
    if (depth?.width !== width || depth.height !== height) {
      depth?.destroy();
      depth = device.createTexture({
        size: [width, height],
        format: DEPTH_FORMAT,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });
    }
    return depth.createView();
  };

  return {
    adapter: `${adapter.info.vendor} ${adapter.info.architecture}`.trim(),
    upload: (data) => {
      vertices?.destroy();
      count = data.length / VERTEX_FLOATS;
      vertices = device.createBuffer({
        size: Math.max(data.byteLength, 4),
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(vertices, 0, data);
    },
    draw: (viewProjection, { eye, density, fog, ambient }) => {
      const data = new Float32Array(UNIFORM_FLOATS);
      data.set(viewProjection, 0);
      data.set([...eye, density, ...fog, 1, ...ambient, 1], 16);
      device.queue.writeBuffer(uniforms, 0, data);
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: { r: fog[0], g: fog[1], b: fog[2], a: 1 },
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
        depthStencilAttachment: {
          view: depthView(),
          depthClearValue: 0,
          depthLoadOp: 'clear',
          depthStoreOp: 'discard',
        },
      });
      if (vertices !== null && count > 0) {
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.setVertexBuffer(0, vertices);
        pass.draw(count);
      }
      pass.end();
      device.queue.submit([encoder.finish()]);
    },
    drawn: async () => device.queue.onSubmittedWorkDone(),
    dispose: () => {
      vertices?.destroy();
      depth?.destroy();
      device.destroy();
    },
  };
}
