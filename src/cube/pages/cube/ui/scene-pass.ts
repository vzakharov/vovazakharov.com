/// <reference types="@webgpu/types" />

import type { CanDispose, Sized } from '@/kernel/shared/typings';

import type { Rgb } from '@/cube/shared/lib/colour';

import { DEPTH_FORMAT } from './programs';
import type { Reflection } from './reflection';
import { beginRepeat, type Repeat } from './slowdown';

/** How far off the scene's `a` says the air is, where no face is drawn. */
const NOWHERE = 1e4;

/** A depth target, remade when the frame it is asked for changes size. */
export type DepthTarget = CanDispose & {
  of: (size: Sized) => GPUTextureView;
};

export function createDepthTarget(device: GPUDevice): DepthTarget {
  let made: (Sized & { texture: GPUTexture; view: GPUTextureView }) | null =
    null;
  return {
    of: ({ width, height }) => {
      if (made?.width === width && made.height === height) return made.view;
      made?.texture.destroy();
      const texture = device.createTexture({
        size: [width, height],
        format: DEPTH_FORMAT,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });
      made = { width, height, texture, view: texture.createView() };
      return made.view;
    },
    dispose: () => {
      made?.texture.destroy();
    },
  };
}

/** Scene light where no face is drawn, as the faces are lit. */
export type Cleared = { clear: Rgb };

/** One encoding of a scene pass: where it draws, and what it is stamped by. */
type SceneShot = Cleared & {
  reflection: Reflection;
  depth: DepthTarget;
  size: Sized;
  stamp?: GPURenderPassTimestampWrites | undefined;
};

/**
 * Begins `repeat`'s encoding of a scene pass into `reflection`'s targets at
 * `size`: the light cleared to `clear` and the air's distance, every mirror
 * to none, the depth to the far plane.
 */
export function beginScene(
  encoder: GPUCommandEncoder,
  { reflection, depth, clear: [r, g, b], size, stamp }: SceneShot,
  repeat: Repeat,
): GPURenderPassEncoder {
  return beginRepeat(
    encoder,
    {
      colorAttachments: reflection.attachments(size.width, size.height, {
        r,
        g,
        b,
        a: NOWHERE,
      }),
      depthStencilAttachment: {
        view: depth.of(size),
        depthClearValue: 0,
        depthLoadOp: 'clear',
        depthStoreOp: 'discard',
      },
      ...(stamp === undefined ? {} : { timestampWrites: stamp }),
    },
    repeat,
    size,
  );
}
