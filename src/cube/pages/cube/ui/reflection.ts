/// <reference types="@webgpu/types" />

import {
  common,
  d,
  tgpu,
  type TgpuBindGroup,
  type TgpuRenderPipeline,
} from 'typegpu';

import type { CanDispose, Sized } from '@/kernel/shared/typings';

import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import type { Vec3 } from '@/cube/entities/world';

import { inverse } from '../lib/matrix';
import { SCENE_FORMAT } from './bloom';
import {
  BLUR_LEVELS,
  halveMain,
  halving,
  reflecting,
  reflectionMain,
  View,
} from './reflection-shader';

/**
 * The formats the scene pass writes after its light, in the order of the
 * `Scene` its fragment stages return (`../lib/shader.ts`): mirror, then plane.
 */
export const MIRROR_FORMATS = [
  'rgba16float',
  'rgba16float',
] as const satisfies readonly GPUTextureFormat[];

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
  textures: Array<{ destroy: () => void }>;
  /** The scene's levels, each drawn into alone; the first by the scene. */
  levels: GPUTextureView[];
  mirror: GPUTextureView;
  plane: GPUTextureView;
  lit: GPUTextureView;
  /** Each level but the first, read from the one above it. */
  halvings: Array<{
    into: GPUTextureView;
    read: TgpuBindGroup<(typeof halving)['entries']>;
  }>;
  /** What the reflection reads. */
  reflected: TgpuBindGroup<(typeof reflecting)['entries']>;
};

/** A view of `baseMipLevel` alone. */
const level = (baseMipLevel: number) => ({ baseMipLevel, mipLevelCount: 1 });

/** `columns`, a column-major 4×4 matrix, as the GPU reads one. */
const matrix = (columns: Float32Array): d.m4x4f => {
  const result = d.mat4x4f();
  for (const [index, value] of columns.entries()) result[index] = value;
  return result;
};

/** Records one pass of `pipeline`, reading `group`, over the whole of `into`. */
const cover = (
  encoder: GPUCommandEncoder,
  pipeline: TgpuRenderPipeline<d.Vec4f>,
  group: TgpuBindGroup,
  into: GPUTextureView,
): void => {
  pipeline
    .with(encoder)
    .with(group)
    .withColorAttachment({ view: into, loadOp: 'clear', storeOp: 'store' })
    .draw(3);
};

export function createReflection(device: GPUDevice): Reflection {
  const root = tgpu.initFromDevice({ device });
  const covering = (fragment: typeof halveMain): TgpuRenderPipeline<d.Vec4f> =>
    root.createRenderPipeline({
      vertex: common.fullScreenTriangle,
      fragment,
      targets: { format: SCENE_FORMAT },
    });
  const halve = covering(halveMain);
  const reflect = covering(reflectionMain);
  const linear = root.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
    mipmapFilter: 'linear',
  });
  const view = root.createBuffer(View).$usage('uniform');
  let frame: Frame | null = null;

  const target = (width: number, height: number, mipLevelCount = 1) =>
    root
      .createTexture({
        size: [width, height],
        format: SCENE_FORMAT,
        mipLevelCount,
      })
      .$usage('render', 'sampled');

  const fit = (width: number, height: number): Frame => {
    if (frame?.width === width && frame.height === height) return frame;
    for (const texture of frame?.textures ?? []) texture.destroy();
    const count = Math.min(
      BLUR_LEVELS,
      Math.floor(Math.log2(Math.max(width, height))) + 1,
    );
    const scene = target(width, height, count);
    const mirror = target(width, height);
    const plane = target(width, height);
    const lit = target(width, height);
    const levels = Array.from({ length: count }, (_, index) =>
      root.unwrap(scene.createView('render', level(index))),
    );
    frame = {
      width,
      height,
      textures: [scene, mirror, plane, lit],
      levels,
      mirror: root.unwrap(mirror.createView('render')),
      plane: root.unwrap(plane.createView('render')),
      lit: root.unwrap(lit.createView('render')),
      halvings: levels.slice(1).map((into, index) => ({
        into,
        read: root.createBindGroup(halving, {
          above: scene.createView(d.texture2d(d.f32), level(index)),
          aboveSampler: linear,
        }),
      })),
      reflected: root.createBindGroup(reflecting, {
        view,
        scene: scene.createView(d.texture2d(d.f32)),
        mirror: mirror.createView(d.texture2d(d.f32)),
        plane: plane.createView(d.texture2d(d.f32)),
        blurSampler: linear,
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
      const { width, height, halvings, levels, reflected, lit } = frame;
      // The focal length is the length of the projection's second row.
      const focal = Math.hypot(
        viewProjection[1] ?? 0,
        viewProjection[5] ?? 0,
        viewProjection[9] ?? 0,
      );
      view.write({
        viewProjection: matrix(viewProjection),
        inverse: matrix(inverse(viewProjection)),
        eye: d.vec4f(...eye, ROOM_METRES),
        size: d.vec4f(width, height, focal, levels.length - 1),
      });
      for (const { into, read } of halvings) cover(encoder, halve, read, into);
      cover(encoder, reflect, reflected, lit);
      return lit;
    },
    dispose: () => {
      for (const texture of frame?.textures ?? []) texture.destroy();
      view.destroy();
      root.destroy();
    },
  };
}
