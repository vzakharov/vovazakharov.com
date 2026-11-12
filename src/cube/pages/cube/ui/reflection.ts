/// <reference types="@webgpu/types" />

import type { CanDispose, Sized } from '@/kernel/shared/typings';

import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import type { Vec3 } from '@/cube/entities/world';

import { inverse } from '../lib/matrix';
import { SCENE_FORMAT } from './bloom';
import {
  BLUR_LEVELS,
  HALVE_SHADER,
  REFLECTION_SHADER,
  VIEW_FLOATS,
} from './reflection-shader';

/**
 * The formats the scene pass writes after its light: a point's mirror —
 * the lamps' light standing in for its reflection, and the share it shows —
 * then the plane it reflects off and how fast the reflection blurs.
 */
export const MIRROR_FORMATS: readonly GPUTextureFormat[] = [
  'rgba16float',
  'rgba16float',
];

/** Where the scene is seen from, as the reflections need it. */
export type Seen = {
  /** Column-major. */
  viewProjection: Float32Array;
  /** The eye, in its own frame. */
  eye: Vec3;
};

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
   */
  run: (encoder: GPUCommandEncoder, seen: Seen) => GPUTextureView;
};

type Frame = Sized & {
  textures: GPUTexture[];
  /** The scene's levels, each viewed alone; the first is what is drawn into. */
  levels: GPUTextureView[];
  mirror: GPUTextureView;
  plane: GPUTextureView;
  lit: GPUTextureView;
  /** Each level but the first, read from the one above it. */
  halving: Array<{ into: GPUTextureView; read: GPUBindGroup }>;
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

/** Records one covering pass of `pipeline`, reading `group`, into `into`. */
function cover(
  encoder: GPUCommandEncoder,
  pipeline: GPURenderPipeline,
  group: GPUBindGroup,
  into: GPUTextureView,
): void {
  const pass = encoder.beginRenderPass({
    colorAttachments: [{ view: into, loadOp: 'clear', storeOp: 'store' }],
  });
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, group);
  pass.draw(3);
  pass.end();
}

export function createReflection(device: GPUDevice): Reflection {
  const halve = covering(device, HALVE_SHADER, 'halveMain');
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
    const [mirrorFormat = 'rgba16float', planeFormat = 'rgba16float'] =
      MIRROR_FORMATS;
    const mirror = target(width, height, mirrorFormat);
    const plane = target(width, height, planeFormat);
    const lit = target(width, height, SCENE_FORMAT);
    const levels = Array.from({ length: count }, (_, level) =>
      scene.createView({ baseMipLevel: level, mipLevelCount: 1 }),
    );
    const halving = levels.slice(1).map((into, index) => ({
      into,
      read: device.createBindGroup({
        layout: halve.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: levels[index] ?? into },
          { binding: 1, resource: linear },
        ],
      }),
    }));
    const mirrorView = mirror.createView();
    const planeView = plane.createView();
    frame = {
      width,
      height,
      textures: [scene, mirror, plane, lit],
      levels,
      mirror: mirrorView,
      plane: planeView,
      lit: lit.createView(),
      halving,
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
      const { levels, mirror, plane } = fit(width, height);
      const [drawn] = levels;
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
    run: (encoder, { viewProjection, eye }) => {
      if (frame === null) throw new Error('No scene was drawn to reflect');
      const { width, height, halving, levels, reflecting, lit } = frame;
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
      data.set([width, height, focal, levels.length - 1], 36);
      device.queue.writeBuffer(view, 0, data);
      for (const { into, read } of halving) cover(encoder, halve, read, into);
      cover(encoder, reflect, reflecting, lit);
      return lit;
    },
    dispose: () => {
      for (const texture of frame?.textures ?? []) texture.destroy();
      view.destroy();
    },
  };
}
