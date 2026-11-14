/// <reference types="@webgpu/types" />

import { OUTDOOR_SHADERS } from '../lib/outdoor-shaders';
import { SHELL_VERTEX_FLOATS, shellVertices } from '../lib/shell-mesh';
import type { LayerMaker } from './outdoor-layer';

/** A shell vertex's attributes, in buffer order, as floats each. */
const ATTRIBUTES = [3, 3, 2, 1] as const;

const FORMATS = {
  1: 'float32',
  2: 'float32x2',
  3: 'float32x3',
} as const satisfies Record<(typeof ATTRIBUTES)[number], GPUVertexFormat>;

const FLOAT_BYTES = Float32Array.BYTES_PER_ELEMENT;

function vertexLayout(): GPUVertexBufferLayout {
  let offset = 0;
  const attributes = ATTRIBUTES.map((floats, shaderLocation) => {
    const attribute = { shaderLocation, offset, format: FORMATS[floats] };
    offset += floats * FLOAT_BYTES;
    return attribute;
  });
  return { arrayStride: SHELL_VERTEX_FLOATS * FLOAT_BYTES, attributes };
}

/**
 * The shell layer: the cube's six faces, the doorway's reveal and the ladder,
 * drawn solid. Its faces are culled in the shader by the way they look, so
 * the rooms show through the doorway whichever way the eye's matrix winds.
 */
export const shellLayer: LayerMaker = async ({ device, shader, pipeline }) => {
  const vertices = shellVertices();
  const buffer = device.createBuffer({
    label: 'shell vertices',
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(buffer, 0, vertices);
  const drawn = await pipeline({
    label: 'shell',
    module: await shader('shell', OUTDOOR_SHADERS.shell),
    depth: 'solid',
    buffers: [vertexLayout()],
    cullMode: 'none',
  });
  return {
    draw: (pass) => {
      pass.setPipeline(drawn);
      pass.setVertexBuffer(0, buffer);
      pass.draw(vertices.length / SHELL_VERTEX_FLOATS);
    },
    dispose: () => {
      buffer.destroy();
    },
  };
};
