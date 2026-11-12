/// <reference types="@webgpu/types" />

import { OUTDOOR_SHADERS } from '../lib/outdoor-shaders';
import { drawing, type LayerMaker } from './outdoor-layer';

/** The ground plan the stand-in's grid covers, in metres, and its cell. */
const WEST = -80;
const EAST = 30;
const NORTH = -35;
const SOUTH = 35;
const CELL = 1;

/** The grid's triangles as `x, z` pairs, each facing up. */
function grid(): Float32Array<ArrayBuffer> {
  const points: number[] = [];
  for (let x = WEST; x < EAST; x += CELL) {
    for (let z = NORTH; z < SOUTH; z += CELL) {
      const [east, south] = [x + CELL, z + CELL];
      points.push(x, z, x, south, east, z, east, z, x, south, east, south);
    }
  }
  return new Float32Array(points);
}

/** The island's sand: a grid the shader lifts to the island's height. */
export const sandLayer: LayerMaker = async ({ device, shader, pipeline }) => {
  const data = grid();
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(buffer, 0, data);
  return drawing(
    await pipeline({
      label: 'sand',
      module: await shader('sand', OUTDOOR_SHADERS.sand),
      depth: 'solid',
      buffers: [
        {
          arrayStride: 8,
          attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }],
        },
      ],
    }),
    data.length / 2,
    buffer,
  );
};
