/// <reference types="@webgpu/types" />

import type { Sized } from '@/kernel/shared/typings';

import { SKY_CLOUD_SHADER, SKY_SHADER } from '@/cube/shared/sky';

import type { LayerMaker } from './outdoor-layer';

const CLOUD_FORMAT: GPUTextureFormat = 'rgba16float';

/** The frame's clouds as drawn, and the group the backdrop reads them by. */
type CloudTarget = Sized & {
  texture: GPUTexture;
  view: GPUTextureView;
  group: GPUBindGroup;
};

/**
 * The sky: each frame's clouds marched into a target `scale` times smaller
 * than the screen each way, then the backdrop, which lays them over the clear
 * air and the sun. The target is this frame's alone; nothing in it outlives
 * the frame.
 */
export const skyLayerAt =
  (scale: number): LayerMaker =>
  async ({ device, frame, shader, pipeline }) => {
    const frameLayout = device.createBindGroupLayout({
      label: 'sky clouds frame',
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: {} },
      ],
    });
    const cloudModule = await shader('sky clouds', [SKY_CLOUD_SHADER]);
    const marched = await device.createRenderPipelineAsync({
      label: 'sky clouds',
      layout: device.createPipelineLayout({ bindGroupLayouts: [frameLayout] }),
      vertex: { module: cloudModule, entryPoint: 'cloudVertex' },
      fragment: {
        module: cloudModule,
        entryPoint: 'cloudFragment',
        targets: [{ format: CLOUD_FORMAT }],
      },
    });
    const frameGroup = device.createBindGroup({
      layout: frameLayout,
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
      module: await shader('sky', [SKY_SHADER]),
      depth: 'backdrop',
      vertex: 'backdropVertex',
      groups: [cloudLayout],
    });

    let target: CloudTarget | null = null;
    const targetFor = (screen: Sized): CloudTarget => {
      const width = Math.max(1, Math.ceil(screen.width / scale));
      const height = Math.max(1, Math.ceil(screen.height / scale));
      if (target?.width === width && target.height === height) return target;
      target?.texture.destroy();
      const texture = device.createTexture({
        label: 'sky clouds',
        size: [width, height],
        format: CLOUD_FORMAT,
        usage:
          GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });
      const view = texture.createView();
      target = {
        width,
        height,
        texture,
        view,
        group: device.createBindGroup({
          layout: cloudLayout,
          entries: [
            { binding: 0, resource: view },
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
              view: targetFor(screen).view,
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
        target?.texture.destroy();
      },
    };
  };

/**
 * The sky as the game draws it: a quarter of the screen each way is what the
 * march can afford every frame, and a cloud's edge is soft at that scale.
 */
export const skyLayer = skyLayerAt(4);
