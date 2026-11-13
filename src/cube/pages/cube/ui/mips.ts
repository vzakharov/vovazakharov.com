/// <reference types="@webgpu/types" />

import { cover } from './bloom';
import { HALVE_SHADER } from './reflection-shader';

/** A texture's mip levels, each viewed alone, the first the one drawn into. */
export type MipChain = {
  levels: GPUTextureView[];
  /** Records the passes that fill each level but the first from the one above. */
  fill: (encoder: GPUCommandEncoder) => void;
};

/** `texture`'s chain; the texture must be a render attachment of `format`. */
export type Halver = (texture: GPUTexture) => MipChain;

/** Halves textures of `format` down their mips, a bilinear tap a texel. */
export function createHalver(
  device: GPUDevice,
  format: GPUTextureFormat,
): Halver {
  const shader = device.createShaderModule({ code: HALVE_SHADER });
  const halve = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: shader, entryPoint: 'vertexMain' },
    fragment: {
      module: shader,
      entryPoint: 'halveMain',
      targets: [{ format }],
    },
  });
  const linear = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
  });
  return (texture) => {
    const levels = Array.from({ length: texture.mipLevelCount }, (_, level) =>
      texture.createView({ baseMipLevel: level, mipLevelCount: 1 }),
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
    return {
      levels,
      fill: (encoder) => {
        for (const { into, read } of halving) cover(encoder, halve, read, into);
      },
    };
  };
}
