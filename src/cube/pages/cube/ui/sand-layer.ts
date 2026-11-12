/// <reference types="@webgpu/types" />

import { SAND_SHADER, sandIndices } from '@/cube/shared/sand';

import type { LayerMaker } from './outdoor-layer';

/**
 * The island's sand: one indexed draw of the ring mesh, whose vertices the
 * shader places round the eye, so the layer holds nothing that changes.
 */
export const sandLayer: LayerMaker = async ({ device, shader, pipeline }) => {
  const indices = sandIndices();
  const buffer = device.createBuffer({
    label: 'sand indices',
    size: indices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(buffer, 0, indices);
  const drawn = await pipeline({
    label: 'sand',
    module: await shader('sand', [SAND_SHADER]),
    depth: 'solid',
    cullMode: 'none',
  });
  return {
    draw(pass) {
      pass.setPipeline(drawn);
      pass.setIndexBuffer(buffer, 'uint32');
      pass.drawIndexed(indices.length);
    },
    dispose() {
      buffer.destroy();
    },
  };
};
