/// <reference types="@webgpu/types" />

import { asError } from '@/kernel/shared/lib/error-class';
import type { CanDispose, Sized, WithId } from '@/kernel/shared/typings';

import type { Clock } from '@/cube/shared/lib/clock';
import type { Rgb } from '@/cube/shared/lib/colour';

import type { FloorRange, Scenery } from '../lib/mesh';
import { UNIFORM_FLOATS } from '../lib/shader';
import { createBloom } from './bloom';
import { createPrograms, DEPTH_FORMAT, type Preparing } from './programs';
import { createReflection, type Seen } from './reflection';

/** What one frame is seen from and when, and what shows where nothing is. */
export type Shot = Clock &
  Seen & {
    /** Scene light, as the faces are lit. */
    clear: Rgb;
    /** The floor whose lens the frame is seen through; it must be prepared. */
    lens: number;
  };

/**
 * Faces of one floor sharing one texture: `scenery` holds them, and `image`
 * is drawn once per `id`, the first time the id is uploaded since an upload
 * without it.
 */
export type Boards = WithId & {
  image: () => GPUCopyExternalImageSource & { width: number; height: number };
  scenery: Scenery;
};

export type Renderer = CanDispose &
  Preparing & {
    /** Replaces the rooms drawn. */
    upload: (scenery: Scenery) => void;
    /**
     * Replaces what moves among the rooms, drawn with them; its floors must be
     * prepared, as an uploaded room's are.
     */
    uploadMoving: (scenery: Scenery) => void;
    /** Replaces the boards, drawn after the rooms. */
    uploadBoards: (boards: readonly Boards[]) => void;
    draw: (shot: Shot) => void;
    /** Resolves once the GPU has finished every frame submitted so far. */
    drawn: () => Promise<void>;
    /** The adapter's vendor and architecture. */
    readonly adapter: string;
  };

/** How far off the scene's `a` says the air is, where no face is drawn. */
const NOWHERE = 1e4;

/** The depth a frame is drawn through, remade when the canvas changes size. */
type Targets = Sized & { depth: GPUTexture };

/** A run of a vertex buffer and the pipeline that draws it. */
type Run = FloorRange & { pipeline: GPURenderPipeline };

type Drawn = { buffer: GPUBuffer; runs: readonly Run[] };

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
 * or no adapter for it. Each floor is drawn by its own shader, `sourceOf` its
 * WGSL, compiled the first time the floor is prepared. `onLost` hears the
 * device going away.
 */
export async function createRenderer(
  canvas: HTMLCanvasElement,
  sourceOf: (n: number) => string,
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

  const {
    layouts,
    prepare,
    of: programOf,
  } = createPrograms(device, format, sourceOf);

  const uniforms = device.createBuffer({
    size: UNIFORM_FLOATS * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const uniformGroup = device.createBindGroup({
    layout: layouts.uniform,
    entries: [{ binding: 0, resource: { buffer: uniforms } }],
  });
  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
  });

  const drawnOf = (
    { data, ranges }: Scenery,
    kind: 'faces' | 'boards',
  ): Drawn | null => {
    if (data.byteLength === 0) return null;
    const buffer = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(buffer, 0, data);
    return {
      buffer,
      runs: ranges.map((range) => ({
        ...range,
        pipeline: programOf(range.n)[kind],
      })),
    };
  };

  let rooms: Drawn | null = null;
  let moving: Drawn | null = null;
  let boards: Array<Drawn & { group: GPUBindGroup }> = [];
  let targets: Targets | null = null;
  const bloom = createBloom(device);
  const reflection = createReflection(device);
  /** Each board texture by its id, and the bind group sampling it. */
  const textures = new Map<
    string,
    { texture: GPUTexture; group: GPUBindGroup }
  >();

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
      layout: layouts.board,
      entries: [
        { binding: 0, resource: texture.createView() },
        { binding: 1, resource: sampler },
      ],
    });
    textures.set(id, { texture, group });
    return group;
  };

  const targetsOf = (): Targets => {
    const { width, height } = canvas;
    if (targets?.width === width && targets.height === height) return targets;
    targets?.depth.destroy();
    targets = {
      width,
      height,
      depth: device.createTexture({
        size: [width, height],
        format: DEPTH_FORMAT,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      }),
    };
    return targets;
  };

  const drawRuns = (pass: GPURenderPassEncoder, { buffer, runs }: Drawn) => {
    pass.setVertexBuffer(0, buffer);
    for (const { pipeline, firstVertex, count } of runs) {
      pass.setPipeline(pipeline);
      pass.draw(count, 1, firstVertex);
    }
  };

  return {
    adapter: `${adapter.info.vendor} ${adapter.info.architecture}`.trim(),
    prepare,
    upload: (scenery) => {
      const next = drawnOf(scenery, 'faces');
      rooms?.buffer.destroy();
      rooms = next;
    },
    uploadMoving: (scenery) => {
      const next = drawnOf(scenery, 'faces');
      moving?.buffer.destroy();
      moving = next;
    },
    uploadBoards: (next) => {
      const made = next.flatMap((board) => {
        const drawn = drawnOf(board.scenery, 'boards');
        return drawn === null ? [] : [{ ...drawn, group: textureOf(board) }];
      });
      for (const { buffer } of boards) buffer.destroy();
      boards = made;
      // A texture the boards no longer show goes, so a long walk holds only
      // the floors in view; one back in view is painted again.
      const kept = new Set(next.map(({ id }) => id));
      for (const [id, { texture }] of textures) {
        if (kept.has(id)) continue;
        texture.destroy();
        textures.delete(id);
      }
    },
    draw: ({ viewProjection, eye, clear, lens, seconds, hour }) => {
      const { width, height, depth } = targetsOf();
      const data = new Float32Array(UNIFORM_FLOATS);
      data.set(viewProjection, 0);
      data.set([...eye, 1], 16);
      data.set([seconds, hour, width, height], 20);
      device.queue.writeBuffer(uniforms, 0, data);
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: reflection.attachments(width, height, {
          r: clear[0],
          g: clear[1],
          b: clear[2],
          a: NOWHERE,
        }),
        depthStencilAttachment: {
          view: depth.createView(),
          depthClearValue: 0,
          depthLoadOp: 'clear',
          depthStoreOp: 'discard',
        },
      });
      pass.setBindGroup(0, uniformGroup);
      if (rooms !== null) drawRuns(pass, rooms);
      if (moving !== null) drawRuns(pass, moving);
      for (const board of boards) {
        pass.setBindGroup(1, board.group);
        drawRuns(pass, board);
      }
      pass.end();
      const sceneView = reflection.run(encoder, { viewProjection, eye });
      const glow = bloom.run(encoder, sceneView, width, height);
      const framed = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      });
      framed.setPipeline(programOf(lens).lens);
      framed.setBindGroup(0, uniformGroup);
      framed.setBindGroup(
        1,
        device.createBindGroup({
          layout: layouts.lens,
          entries: [
            { binding: 2, resource: sceneView },
            { binding: 3, resource: glow },
            { binding: 4, resource: sampler },
          ],
        }),
      );
      framed.draw(3);
      framed.end();
      device.queue.submit([encoder.finish()]);
    },
    drawn: async () => device.queue.onSubmittedWorkDone(),
    dispose: () => {
      rooms?.buffer.destroy();
      moving?.buffer.destroy();
      targets?.depth.destroy();
      reflection.dispose();
      bloom.dispose();
      for (const { buffer } of boards) buffer.destroy();
      for (const { texture } of textures.values()) texture.destroy();
      device.destroy();
    },
  };
}
