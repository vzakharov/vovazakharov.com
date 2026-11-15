/// <reference types="@webgpu/types" />

import type { CanDispose, Sized } from '@/kernel/shared/typings';

import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import type { Seen } from '@/cube/shared/lib/vec';

import { inverse } from '../lib/matrix';
import { cover, SCENE_FORMAT } from './bloom';
import { createHalver, type MipChain } from './mips';
import {
  BLUR_LEVELS,
  REFLECTION_SHADER,
  VIEW_FLOATS,
} from './reflection-shader';
import { type Repeat, UNREPEATED } from './slowdown';

/**
 * The formats the scene pass writes after its light, in the order of the
 * `Scene` its fragment stages return (`../lib/shader.ts`): mirror, then plane.
 */
export const MIRROR_FORMATS = [
  'rgba16float',
  'rgba16float',
] as const satisfies readonly GPUTextureFormat[];

export type Reflection = CanDispose & {
  /**
   * The scene pass's colour attachments for a frame `width` by `height`,
   * light cleared to `clear`, every mirror cleared to none.
   */
  attachments: (
    width: number,
    height: number,
    clear: GPUColor,
  ) => GPURenderPassColorAttachment[];
  /**
   * Records the passes that fill the mirrors of the scene last drawn into
   * `attachments`, seen as `seen`, and gives back the view of the frame they
   * end in: the scene's light, mirrors filled, and its depth as the scene had.
   * `stamp` is written by the last of them; `repeat` is which of the stage's
   * encodings they are.
   */
  run: (
    encoder: GPUCommandEncoder,
    seen: Seen,
    stamp?: GPURenderPassTimestampWrites,
    repeat?: Repeat,
  ) => GPUTextureView;
};

type Frame = Sized & {
  textures: GPUTexture[];
  /** The scene and its blur levels; the first level is what is drawn into. */
  chain: MipChain;
  mirror: GPUTextureView;
  plane: GPUTextureView;
  lit: GPUTextureView;
  reflecting: GPUBindGroup;
};

/** A pass of `code`'s `entry` over the whole screen, into scene light. */
const covering = (
  device: GPUDevice,
  code: string,
  entry: string,
): GPURenderPipeline => {
  const shader = device.createShaderModule({ code });
  return device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: shader, entryPoint: 'vertexMain' },
    fragment: {
      module: shader,
      entryPoint: entry,
      targets: [{ format: SCENE_FORMAT }],
    },
  });
};

export function createReflection(device: GPUDevice): Reflection {
  const halver = createHalver(device, SCENE_FORMAT);
  const reflect = covering(device, REFLECTION_SHADER, 'reflectionMain');
  const linear = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
    mipmapFilter: 'linear',
  });
  const view = device.createBuffer({
    size: VIEW_FLOATS * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  let frame: Frame | null = null;

  const target = (
    width: number,
    height: number,
    format: GPUTextureFormat,
    mipLevelCount = 1,
  ): GPUTexture =>
    device.createTexture({
      size: [width, height],
      format,
      mipLevelCount,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });

  const fit = (width: number, height: number): Frame => {
    if (frame?.width === width && frame.height === height) return frame;
    for (const texture of frame?.textures ?? []) texture.destroy();
    const count = Math.min(
      BLUR_LEVELS,
      Math.floor(Math.log2(Math.max(width, height))) + 1,
    );
    const scene = target(width, height, SCENE_FORMAT, count);
    const [mirrorFormat, planeFormat] = MIRROR_FORMATS;
    const mirror = target(width, height, mirrorFormat);
    const plane = target(width, height, planeFormat);
    const lit = target(width, height, SCENE_FORMAT);
    const mirrorView = mirror.createView();
    const planeView = plane.createView();
    frame = {
      width,
      height,
      textures: [scene, mirror, plane, lit],
      chain: halver(scene),
      mirror: mirrorView,
      plane: planeView,
      lit: lit.createView(),
      reflecting: device.createBindGroup({
        layout: reflect.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: view } },
          { binding: 1, resource: scene.createView() },
          { binding: 2, resource: mirrorView },
          { binding: 3, resource: planeView },
          { binding: 4, resource: linear },
        ],
      }),
    };
    return frame;
  };

  return {
    attachments: (width, height, clear) => {
      const { chain, mirror, plane } = fit(width, height);
      const [drawn] = chain.levels;
      if (drawn === undefined) throw new Error('The scene has no levels');
      const none = { r: 0, g: 0, b: 0, a: 0 };
      return [
        { view: drawn, clearValue: clear },
        { view: mirror, clearValue: none },
        { view: plane, clearValue: none },
      ].map(
        (attachment): GPURenderPassColorAttachment => ({
          ...attachment,
          loadOp: 'clear',
          storeOp: 'store',
        }),
      );
    },
    run: (encoder, { viewProjection, eye }, stamp, repeat = UNREPEATED) => {
      if (frame === null) throw new Error('No scene was drawn to reflect');
      const { width, height, chain, reflecting, lit } = frame;
      // The focal length is the length of the projection's second row.
      const focal = Math.hypot(
        viewProjection[1] ?? 0,
        viewProjection[5] ?? 0,
        viewProjection[9] ?? 0,
      );
      const data = new Float32Array(VIEW_FLOATS);
      data.set(viewProjection, 0);
      data.set(inverse(viewProjection), 16);
      data.set([...eye, ROOM_METRES], 32);
      data.set([width, height, focal, chain.levels.length - 1], 36);
      device.queue.writeBuffer(view, 0, data);
      chain.fill(encoder, repeat);
      cover(encoder, reflect, reflecting, lit, {
        stamp,
        scissored: { repeat, width, height },
      });
      return lit;
    },
    dispose: () => {
      for (const texture of frame?.textures ?? []) texture.destroy();
      view.destroy();
    },
  };
}
