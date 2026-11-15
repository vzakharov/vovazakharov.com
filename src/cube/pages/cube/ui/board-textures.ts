/// <reference types="@webgpu/types" />

import type { CanDispose, WithId } from '@/kernel/shared/typings';

import type { Scenery } from '../lib/mesh';

/**
 * Faces of one floor sharing one texture: `scenery` holds them, and `image`
 * is drawn once per `id`, the first time the id is uploaded since an upload
 * without it.
 */
export type Boards = WithId & {
  image: () => GPUCopyExternalImageSource & { width: number; height: number };
  scenery: Scenery;
};

/** The boards' textures, each painted once and kept while it is shown. */
export type BoardTextures = CanDispose & {
  /** The bind group sampling `boards`' texture, painted if it is not held. */
  groupOf: (boards: Boards) => GPUBindGroup;
  /**
   * Lets go of every texture whose id `kept` lacks, so a long walk holds
   * only the floors in view; one back in view is painted again.
   */
  keepOnly: (kept: ReadonlySet<string>) => void;
};

/** Board textures on `device`, each bound by `layout` with `sampler`. */
export function createBoardTextures(
  device: GPUDevice,
  layout: GPUBindGroupLayout,
  sampler: GPUSampler,
): BoardTextures {
  const textures = new Map<
    string,
    { texture: GPUTexture; group: GPUBindGroup }
  >();
  return {
    groupOf: ({ id, image }) => {
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
        layout,
        entries: [
          { binding: 0, resource: texture.createView() },
          { binding: 1, resource: sampler },
        ],
      });
      textures.set(id, { texture, group });
      return group;
    },
    keepOnly: (kept) => {
      for (const [id, { texture }] of textures) {
        if (kept.has(id)) continue;
        texture.destroy();
        textures.delete(id);
      }
    },
    dispose: () => {
      for (const { texture } of textures.values()) texture.destroy();
      textures.clear();
    },
  };
}
