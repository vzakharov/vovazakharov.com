/// <reference types="@webgpu/types" />

import { pick } from '@/kernel/shared/lib/collections';
import { asError } from '@/kernel/shared/lib/error-class';
import type { CanDispose, Sized } from '@/kernel/shared/typings';

import { SUN_DIR } from '@/cube/shared/cube-boundary';
import type { SeenAt } from '@/cube/shared/lib/clock';
import type { Rgb } from '@/cube/shared/lib/colour';
import type { Seen } from '@/cube/shared/lib/vec';
import type { Laddered } from '@/cube/entities/island';
import { createOutdoors, type Outdoors } from '@/cube/widgets/outdoors';

import { inverse } from '../lib/matrix';
import type { FloorRange, Scenery } from '../lib/mesh';
import type { OutsideLens } from '../lib/outside-lens';
import { createUniforms, uniformsOf } from '../lib/uniforms';
import { createBloom } from './bloom';
import { type Boards, createBoardTextures } from './board-textures';
import { createDrowsyEye } from './drowsy-eye';
import { createPassTimer, type Timed, timedOf } from './pass-timer';
import {
  createPrograms,
  DEPTH_FORMAT,
  type Preparing,
  SCENE_TARGETS,
} from './programs';
import { createReflection } from './reflection';
import { beginRepeat, encodeRepeats } from './slowdown';

/** What one frame is seen from and when, and what shows where nothing is. */
type Shot = SeenAt & {
  /** Scene light, as the faces are lit. */
  clear: Rgb;
  /**
   * The lens the frame is seen through: a floor's, which must be prepared, or
   * the outside's as it is set for this frame, the outside prepared.
   */
  lens: number | OutsideLens;
  /**
   * The same view of the world frame, where the frame shows the outside, which
   * must be prepared; null where it shows the cube's inside alone.
   */
  outdoors: (Seen & Laddered) | null;
  /** The share of the screen's own resolution the canvas holds, 1 at most. */
  detail: number;
};

/** What draws frames until it is disposed, timing them where the GPU can. */
export type Drawing = CanDispose & Timed;

export type Renderer = Drawing &
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
    /**
     * Resolves once the outside can be drawn and seen through its own lens;
     * rejects with the compiler's words on a shader that does not compile.
     */
    prepareOutside: () => Promise<void>;
    draw: (shot: Shot) => void;
    /** Resolves once the GPU has finished every frame submitted so far. */
    drawn: () => Promise<void>;
    /** The adapter's vendor and architecture. */
    readonly adapter: string;
  };

/** How far off the scene's `a` says the air is, where no face is drawn. */
const NOWHERE = 1e4;

/** The depth a frame is drawn through, remade when its size changes. */
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
  const timed = adapter.features.has('timestamp-query');
  const device = await adapter.requestDevice({
    requiredFeatures: timed ? ['timestamp-query'] : [],
  });
  watchLoss(device, onLost).catch((error: unknown) => {
    onLost(asError(error));
  });
  const timer = timed ? createPassTimer(device, onLost) : null;
  const context = canvas.getContext('webgpu');
  if (context === null) return null;
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'opaque' });

  const {
    layouts,
    prepare,
    outsideLens,
    of: programOf,
  } = createPrograms(device, format, sourceOf);
  /** The outside's layers and lens, once `prepareOutside` has made them. */
  let outside: { layers: Outdoors; lens: GPURenderPipeline } | null = null;
  let preparingOutside: Promise<void> | null = null;
  const makeOutside = async (): Promise<void> => {
    const [layers, lens] = await Promise.all([
      createOutdoors(device, {
        targets: SCENE_TARGETS,
        depthFormat: DEPTH_FORMAT,
      }),
      outsideLens(),
    ]);
    outside = { layers, lens };
  };
  const outsideMade = (): NonNullable<typeof outside> => {
    if (outside === null) {
      throw new Error('The outside is drawn before it was prepared');
    }
    return outside;
  };

  /** The frame's uniforms, as the lens reads them and as the low pass does. */
  const wholeUniforms = createUniforms(device, layouts.uniform);
  const lowUniforms = createUniforms(device, layouts.uniform);
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
  const drowsy = createDrowsyEye(device);
  const textures = createBoardTextures(device, layouts.board, sampler);

  const targetsOf = ({ width, height }: Sized): Targets => {
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
        return drawn === null
          ? []
          : [{ ...drawn, group: textures.groupOf(board) }];
      });
      for (const { buffer } of boards) buffer.destroy();
      boards = made;
      textures.keepOnly(new Set(next.map(({ id }) => id)));
    },
    prepareOutside: async () => {
      preparingOutside ??= makeOutside();
      return preparingOutside;
    },
    draw: ({
      viewProjection,
      eye,
      clear,
      lens,
      outdoors,
      detail,
      seconds,
      hour,
    }) => {
      const full = pick(canvas, 'width', 'height');
      const low = drowsy.lowPass(full);
      // The size the scene and mirrors are drawn at, and the view they are
      // drawn through: the low pass's where the eye is drowsy.
      const drawn = low ?? full;
      const shift = (m: Float32Array): Float32Array => low?.shift(m) ?? m;
      const throughFloor = typeof lens === 'number';
      const framing = {
        seconds,
        hour,
        outside: throughFloor ? null : lens,
      };
      device.queue.writeBuffer(
        wholeUniforms.buffer,
        0,
        uniformsOf({
          ...framing,
          ...full,
          viewProjection,
          eye,
          vignette: drowsy.vignette(),
        }),
      );
      const seen = { viewProjection: shift(viewProjection), eye };
      if (low !== null) {
        device.queue.writeBuffer(
          lowUniforms.buffer,
          0,
          uniformsOf({ ...framing, ...low, ...seen, vignette: 0 }),
        );
      }
      const sceneGroup = (low === null ? wholeUniforms : lowUniforms).group;
      const repeats = drowsy.repeats();
      const stamps = timer?.stamping() === true ? timer : null;
      const encoder = device.createCommandEncoder();
      const layers = outdoors === null ? null : outsideMade().layers;
      if (outdoors !== null) {
        const outdoorsShifted = shift(outdoors.viewProjection);
        layers?.prepare(
          encoder,
          {
            ...outdoors,
            viewProjection: outdoorsShifted,
            inverse: inverse(outdoorsShifted),
            sun: SUN_DIR,
            seconds,
            hour,
            ...drawn,
          },
          low === null ? detail : detail / low.share,
        );
      }
      const { depth } = targetsOf(drawn);
      encodeRepeats(repeats, (repeat) => {
        const pass = beginRepeat(
          encoder,
          {
            colorAttachments: reflection.attachments(
              drawn.width,
              drawn.height,
              { r: clear[0], g: clear[1], b: clear[2], a: NOWHERE },
            ),
            depthStencilAttachment: {
              view: depth.createView(),
              depthClearValue: 0,
              depthLoadOp: 'clear',
              depthStoreOp: 'discard',
            },
            ...(stamps === null ? {} : { timestampWrites: stamps.scene }),
          },
          repeat,
          drawn,
        );
        layers?.behind(pass);
        pass.setBindGroup(0, sceneGroup);
        if (rooms !== null) drawRuns(pass, rooms);
        if (moving !== null) drawRuns(pass, moving);
        for (const board of boards) {
          pass.setBindGroup(1, board.group);
          drawRuns(pass, board);
        }
        layers?.over(pass);
        pass.end();
      });
      const lit = encodeRepeats(repeats, (repeat) =>
        reflection.run(encoder, seen, stamps?.mirrors, repeat),
      );
      const sceneView =
        low === null
          ? lit
          : drowsy.resolve(
              encoder,
              lit,
              { viewProjection, eye },
              stamps?.resolve,
            );
      const glow = encodeRepeats(repeats, (repeat) =>
        bloom.run(encoder, sceneView, full.width, full.height, repeat),
      );
      const lensGroup = device.createBindGroup({
        layout: layouts.lens,
        entries: [
          { binding: 2, resource: sceneView },
          { binding: 3, resource: glow },
          { binding: 4, resource: sampler },
        ],
      });
      encodeRepeats(repeats, (repeat) => {
        const framed = beginRepeat(
          encoder,
          {
            colorAttachments: [
              {
                view: context.getCurrentTexture().createView(),
                loadOp: 'clear',
                storeOp: 'store',
              },
            ],
            ...(stamps === null ? {} : { timestampWrites: stamps.lens }),
          },
          repeat,
          full,
        );
        framed.setPipeline(
          throughFloor ? programOf(lens).lens : outsideMade().lens,
        );
        framed.setBindGroup(0, wholeUniforms.group);
        framed.setBindGroup(1, lensGroup);
        framed.draw(3);
        framed.end();
      });
      stamps?.copy(encoder, low !== null);
      device.queue.submit([encoder.finish()]);
      stamps?.read();
    },
    drawn: async () => device.queue.onSubmittedWorkDone(),
    ...timedOf(timer),
    dispose: () => {
      timer?.dispose();
      outside?.layers.dispose();
      rooms?.buffer.destroy();
      moving?.buffer.destroy();
      targets?.depth.destroy();
      reflection.dispose();
      drowsy.dispose();
      bloom.dispose();
      wholeUniforms.buffer.destroy();
      lowUniforms.buffer.destroy();
      for (const { buffer } of boards) buffer.destroy();
      textures.dispose();
      device.destroy();
    },
  };
}
