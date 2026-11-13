/// <reference types="@webgpu/types" />

import type { Sized } from '@/kernel/shared/typings';

import { OUTDOOR_SHADERS } from '../lib/outdoor-shaders';
import type { LayerMaker } from './outdoor-layer';

const CLOUD_FORMAT: GPUTextureFormat = 'rgba16float';

/** The frame's sky as drawn, and the group the backdrop reads it by. */
type SkyTarget = Sized & {
  sky: GPUTexture;
  group: GPUBindGroup;
};

/**
 * The sky: each frame's air and clouds, all but the sun's disc, drawn into a
 * target `scale` times smaller than the screen each way, then the backdrop,
 * which reads that and adds the disc at the screen's own sharpness. The
 * target is this frame's alone; nothing in it outlives the frame.
 */
export const skyLayerAt =
  (scale: number): LayerMaker =>
  async ({ device, layout, frame, shader, pipeline }) => {
    const cloudModule = await shader('sky clouds', OUTDOOR_SHADERS.skyClouds);
    const marched = await device.createRenderPipelineAsync({
      label: 'sky clouds',
      layout: device.createPipelineLayout({ bindGroupLayouts: [layout] }),
      vertex: { module: cloudModule, entryPoint: 'cloudVertex' },
      fragment: {
        module: cloudModule,
        entryPoint: 'cloudFragment',
        targets: [{ format: CLOUD_FORMAT }],
      },
    });
    const frameGroup = device.createBindGroup({
      layout,
      entries: [{ binding: 0, resource: { buffer: frame } }],
    });

    const cloudLayout = device.createBindGroupLayout({
      label: 'sky backdrop clouds',
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
      ],
    });
    const sampler = device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
    });
    const drawn = await pipeline({
      label: 'sky',
      module: await shader('sky', OUTDOOR_SHADERS.sky),
      depth: 'backdrop',
      vertex: 'backdropVertex',
      groups: [cloudLayout],
    });

    let target: SkyTarget | null = null;
    const targetFor = (screen: Sized): SkyTarget => {
      const width = Math.max(1, Math.ceil(screen.width / scale));
      const height = Math.max(1, Math.ceil(screen.height / scale));
      if (target?.width === width && target.height === height) return target;
      target?.sky.destroy();
      const texture = device.createTexture({
        label: 'sky clouds',
        size: [width, height],
        format: CLOUD_FORMAT,
        usage:
          GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });
      target = {
        width,
        height,
        sky: texture,
        group: device.createBindGroup({
          layout: cloudLayout,
          entries: [
            { binding: 0, resource: texture.createView() },
            { binding: 1, resource: sampler },
          ],
        }),
      };
      return target;
    };

    return {
      prepare(encoder, screen) {
        const pass = encoder.beginRenderPass({
          label: 'sky clouds',
          colorAttachments: [
            {
              view: targetFor(screen).sky.createView(),
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        });
        pass.setPipeline(marched);
        pass.setBindGroup(0, frameGroup);
        pass.draw(3);
        pass.end();
      },
      draw(pass) {
        if (target === null) return;
        pass.setPipeline(drawn);
        pass.setBindGroup(1, target.group);
        pass.draw(3);
      },
      dispose() {
        target?.sky.destroy();
      },
    };
  };

/**
 * The sky as the game draws it: a quarter of the screen each way is what the
 * march can afford every frame, and a cloud's edge is soft at that scale.
 */
export const skyLayer = skyLayerAt(4);
