/// <reference types="@webgpu/types" />

import type { CanDispose } from '@/kernel/shared/typings';

import { assemble } from '@/cube/shared/shader';

import { BLOOM_LEVELS } from './bloom-numbers';
import { BLOOM_PASS } from './bloom-pass.shader';

/** What the scene is drawn into: light past white, and room in `a` for depth. */
export const SCENE_FORMAT: GPUTextureFormat = 'rgba16float';

type Covering = {
  /** Leaves what `into` holds for the pass to add to, rather than clearing. */
  keeps?: boolean;
  /** Where the GPU stamps the pass's start or end. */
  stamp?: GPURenderPassTimestampWrites;
};

/** Records one pass of `pipeline`, reading `group`, over the whole of `into`. */
export function cover(
  encoder: GPUCommandEncoder,
  pipeline: GPURenderPipeline,
  group: GPUBindGroup,
  into: GPUTextureView,
  { keeps = false, stamp }: Covering = {},
): void {
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      { view: into, loadOp: keeps ? 'load' : 'clear', storeOp: 'store' },
    ],
    ...(stamp === undefined ? {} : { timestampWrites: stamp }),
  });
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, group);
  pass.draw(3);
  pass.end();
}

type Level = { texture: GPUTexture; view: GPUTextureView; read: GPUBindGroup };

export type Bloom = CanDispose & {
  /**
   * Records the passes that spread the bright parts of `scene`, a `width` by
   * `height` frame, and gives back the view they end in.
   */
  run: (
    encoder: GPUCommandEncoder,
    scene: GPUTextureView,
    width: number,
    height: number,
  ) => GPUTextureView;
};

export function createBloom(device: GPUDevice): Bloom {
  const shader = device.createShaderModule({ code: assemble([BLOOM_PASS]) });
  const layout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
    ],
  });
  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
  });
  const pipeline = (fragment: string, adds: boolean): GPURenderPipeline =>
    device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [layout] }),
      vertex: { module: shader, entryPoint: 'vertexMain' },
      fragment: {
        module: shader,
        entryPoint: fragment,
        targets: [
          {
            format: SCENE_FORMAT,
            ...(adds
              ? {
                  blend: {
                    color: { srcFactor: 'one', dstFactor: 'one' },
                    alpha: { srcFactor: 'one', dstFactor: 'one' },
                  },
                }
              : {}),
          },
        ],
      },
    });
  const bright = pipeline('bright', false);
  const down = pipeline('down', false);
  const up = pipeline('up', true);

  const reading = (view: GPUTextureView): GPUBindGroup =>
    device.createBindGroup({
      layout,
      entries: [
        { binding: 0, resource: view },
        { binding: 1, resource: sampler },
      ],
    });

  let levels: Level[] = [];
  let size = '';
  /** The scene view the first pass reads, kept while the scene's is. */
  let from: { view: GPUTextureView; read: GPUBindGroup } | null = null;

  const fit = (width: number, height: number): void => {
    const key = `${String(width)}x${String(height)}`;
    if (key === size) return;
    size = key;
    for (const { texture } of levels) texture.destroy();
    levels = Array.from({ length: BLOOM_LEVELS }, (_, level) => {
      const texture = device.createTexture({
        size: [
          Math.max(1, width >> (level + 1)),
          Math.max(1, height >> (level + 1)),
        ],
        format: SCENE_FORMAT,
        usage:
          GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });
      const view = texture.createView();
      return { texture, view, read: reading(view) };
    });
  };

  return {
    run: (encoder, scene, width, height) => {
      fit(width, height);
      if (from?.view !== scene) from = { view: scene, read: reading(scene) };
      const [first, ...rest] = levels;
      if (first === undefined) throw new Error('The bloom has no levels');
      cover(encoder, bright, from.read, first.view);
      let above = first;
      for (const level of rest) {
        cover(encoder, down, above.read, level.view);
        above = level;
      }
      for (const level of levels.toReversed().slice(1)) {
        cover(encoder, up, above.read, level.view, { keeps: true });
        above = level;
      }
      return first.view;
    },
    dispose: () => {
      for (const { texture } of levels) texture.destroy();
    },
  };
}
