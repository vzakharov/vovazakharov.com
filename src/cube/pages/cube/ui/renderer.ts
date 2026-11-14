/// <reference types="@webgpu/types" />

import { pick } from '@/kernel/shared/lib/collections';
import { asError } from '@/kernel/shared/lib/error-class';
import type { CanDispose } from '@/kernel/shared/typings';

import { SUN_DIR } from '@/cube/shared/cube-boundary';
import type { SeenAt } from '@/cube/shared/lib/clock';
import type { Seen } from '@/cube/shared/lib/vec';
import type { Laddered } from '@/cube/entities/island';

import { inverse } from '../lib/matrix';
import type { FloorRange, Scenery } from '../lib/mesh';
import type { OutsideLens } from '../lib/outside-lens';
import { createUniforms, uniformsOf } from '../lib/uniforms';
import { createBloom } from './bloom';
import { type Boards, createBoardTextures } from './board-textures';
import { createDrowsyEye, type Drowsing } from './drowsy-eye';
import { outsideOnce } from './outside';
import { createPassTimer, type Timed, timedOf } from './pass-timer';
import { createPrograms, type Preparing } from './programs';
import { createReflection } from './reflection';
import { beginScene, type Cleared, createDepthTarget } from './scene-pass';
import { beginRepeat, encodeRepeats } from './slowdown';
import { createUnderlay } from './underlay';

/** What one frame is seen from and when, and what shows where nothing is. */
type Shot = SeenAt &
  Cleared & {
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
    /** Whether the body is out of doors, waking: the rooms then drowse too. */
    waking: boolean;
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
  const outside = outsideOnce(device, outsideLens);

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
  const bloom = createBloom(device);
  /** The scene pass's targets, and the rooms' drawn whole over the outside. */
  const reflection = createReflection(device);
  const sharp = createReflection(device);
  const depth = createDepthTarget(device);
  const sharpDepth = createDepthTarget(device);
  const underlay = createUnderlay(device);
  const drowsy = createDrowsyEye(device);
  const textures = createBoardTextures(device, layouts.board, sampler);

  const drawRuns = (pass: GPURenderPassEncoder, { buffer, runs }: Drawn) => {
    pass.setVertexBuffer(0, buffer);
    for (const { pipeline, firstVertex, count } of runs) {
      pass.setPipeline(pipeline);
      pass.draw(count, 1, firstVertex);
    }
  };
  /** The rooms, what moves in them and the boards, seen through `group`. */
  const drawRooms = (pass: GPURenderPassEncoder, group: GPUBindGroup) => {
    pass.setBindGroup(0, group);
    if (rooms !== null) drawRuns(pass, rooms);
    if (moving !== null) drawRuns(pass, moving);
    for (const board of boards) {
      pass.setBindGroup(1, board.group);
      drawRuns(pass, board);
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
    prepareOutside: outside.prepare,
    draw: ({
      viewProjection,
      eye,
      clear,
      lens,
      outdoors,
      detail,
      waking,
      seconds,
      hour,
    }) => {
      const full = pick(canvas, 'width', 'height');
      // Out of doors the eye wakes on all it sees; indoors only the outside,
      // through the doorway, is drowsy.
      const drowsing: Drowsing | null =
        outdoors === null ? null : waking ? 'all' : 'outside';
      const low = drowsy.lowPass(full, drowsing);
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
      const layers = outdoors === null ? null : outside.made().layers;
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
      // The outside alone in the low pass, the rooms drawn whole over it.
      const split = low?.drowsing === 'outside';
      const shot = { reflection, depth, clear, size: drawn };
      encodeRepeats(repeats, (repeat) => {
        const stamp = stamps?.scene;
        const pass = beginScene(encoder, { ...shot, stamp }, repeat);
        layers?.behind(pass);
        if (!split) drawRooms(pass, sceneGroup);
        layers?.over(pass);
        pass.end();
      });
      const lit = encodeRepeats(repeats, (repeat) =>
        reflection.run(encoder, seen, stamps?.mirrors, repeat),
      );
      const whole = { viewProjection, eye };
      const resolved =
        low === null
          ? lit
          : drowsy.resolve(encoder, lit, whole, stamps?.resolve);
      const sharpShot = { reflection: sharp, depth: sharpDepth, size: full };
      const sceneView = split
        ? encodeRepeats(repeats, (repeat) => {
            const pass = beginScene(encoder, { ...sharpShot, clear }, repeat);
            underlay.draw(pass, resolved, whole, full);
            drawRooms(pass, wholeUniforms.group);
            pass.end();
            return sharp.run(encoder, whole, undefined, repeat);
          })
        : resolved;
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
          throughFloor ? programOf(lens).lens : outside.made().lens,
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
      outside.dispose();
      rooms?.buffer.destroy();
      moving?.buffer.destroy();
      depth.dispose();
      sharpDepth.dispose();
      reflection.dispose();
      sharp.dispose();
      underlay.dispose();
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
