/// <reference types="@webgpu/types" />

import { asError } from '@/kernel/shared/lib/error-class';
import type { CanDispose, WithId } from '@/kernel/shared/typings';

import { SIGN_VERTEX_FLOATS, VERTEX_FLOATS } from '../lib/mesh';
import type { Rgb } from '../lib/palette';
import { SHADER } from './shader';

/** What one frame is lit with and cleared to, besides the camera. */
type Air = {
  clear: Rgb;
  ambient: Rgb;
};

/**
 * Signs sharing one texture: `vertices` in `packSigns`' layout, and `image`,
 * drawn once per `id` the first time the id is uploaded.
 */
export type Boards = WithId & {
  image: () => GPUCopyExternalImageSource & { width: number; height: number };
  vertices: Float32Array<ArrayBuffer>;
};

export type Renderer = CanDispose & {
  /** Replaces the vertex buffer with `vertices` (`pack`'s layout). */
  upload: (vertices: Float32Array<ArrayBuffer>) => void;
  /** Replaces the signs, drawn after the rooms. */
  uploadBoards: (boards: readonly Boards[]) => void;
  /** Draws a frame, `viewProjection` column-major. */
  draw: (viewProjection: Float32Array, air: Air) => void;
  /** Resolves once the GPU has finished every frame submitted so far. */
  drawn: () => Promise<void>;
  /** The adapter's vendor and architecture. */
  readonly adapter: string;
};

const UNIFORM_FLOATS = 16 + 4;
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
  const pipelineOf = (
    [vertexEntry, fragmentEntry]: readonly [string, string],
    layout: GPUVertexBufferLayout,
  ): GPURenderPipeline =>
    device.createRenderPipeline({
      layout: 'auto',
      vertex: { module: shader, entryPoint: vertexEntry, buffers: [layout] },
      fragment: {
        module: shader,
        entryPoint: fragmentEntry,
        targets: [{ format }],
      },
      primitive: { topology: 'triangle-list', cullMode: 'back' },
      depthStencil: {
        format: DEPTH_FORMAT,
        depthWriteEnabled: true,
        depthCompare: 'greater',
      },
    });
  const pipeline = pipelineOf(['vertexMain', 'fragmentMain'], {
    arrayStride: VERTEX_FLOATS * 4,
    attributes: [float3(0, 0), float3(1, 3), float3(2, 6)],
  });
  const signPipeline = pipelineOf(['signVertex', 'signFragment'], {
    arrayStride: SIGN_VERTEX_FLOATS * 4,
    attributes: [
      float3(0, 0),
      float3(1, 3),
      { shaderLocation: 2, offset: 6 * 4, format: 'float32x2' },
    ],
  });
  const uniforms = device.createBuffer({
    size: UNIFORM_FLOATS * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniforms } }],
  });
  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
  });

  let vertices: GPUBuffer | null = null;
  let count = 0;
  let depth: GPUTexture | null = null;
  /** Each board texture by its id, and the bind group sampling it. */
  const textures = new Map<
    string,
    { texture: GPUTexture; group: GPUBindGroup }
  >();
  let boards: Array<{ group: GPUBindGroup; buffer: GPUBuffer; count: number }> =
    [];

  const textureOf = ({ id, image }: Boards): GPUBindGroup => {
    const known = textures.get(id);
    if (known !== undefined) return known.group;
    const source = image();
    const texture = device.createTexture({
      size: [source.width, source.height],
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });
    device.queue.copyExternalImageToTexture({ source }, { texture }, [
      source.width,
      source.height,
    ]);
    const group = device.createBindGroup({
      layout: signPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: uniforms } },
        { binding: 1, resource: texture.createView() },
        { binding: 2, resource: sampler },
      ],
    });
    textures.set(id, { texture, group });
    return group;
  };

  const vertexBuffer = (data: Float32Array<ArrayBuffer>): GPUBuffer => {
    const buffer = device.createBuffer({
      size: Math.max(data.byteLength, 4),
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(buffer, 0, data);
    return buffer;
  };

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
      vertices = vertexBuffer(data);
    },
    uploadBoards: (next) => {
      for (const { buffer } of boards) buffer.destroy();
      boards = next
        .filter(({ vertices: data }) => data.length > 0)
        .map((board) => ({
          group: textureOf(board),
          buffer: vertexBuffer(board.vertices),
          count: board.vertices.length / SIGN_VERTEX_FLOATS,
        }));
    },
    draw: (viewProjection, { clear, ambient }) => {
      const data = new Float32Array(UNIFORM_FLOATS);
      data.set(viewProjection, 0);
      data.set([...ambient, 1], 16);
      device.queue.writeBuffer(uniforms, 0, data);
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: { r: clear[0], g: clear[1], b: clear[2], a: 1 },
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
      if (boards.length > 0) pass.setPipeline(signPipeline);
      for (const board of boards) {
        pass.setBindGroup(0, board.group);
        pass.setVertexBuffer(0, board.buffer);
        pass.draw(board.count);
      }
      pass.end();
      device.queue.submit([encoder.finish()]);
    },
    drawn: async () => device.queue.onSubmittedWorkDone(),
    dispose: () => {
      vertices?.destroy();
      depth?.destroy();
      for (const { buffer } of boards) buffer.destroy();
      for (const { texture } of textures.values()) texture.destroy();
      device.destroy();
    },
  };
}
