/// <reference types="@webgpu/types" />

import type { Vec3 } from '@/cube/shared/lib/vec';
import type { OutdoorFrame } from '@/cube/shared/outside';
import { RINGS, SEA, SEA_SEED, SEAS, SPOKES } from '@/cube/shared/sea';

import type { LayerMaker } from './outdoor-layer';
import { createWaveField } from './sea-wave-field';

/** The sector of rings laid ahead of a level eye, and round one looking down. */
const AHEAD = (150 * Math.PI) / 180;
const AROUND = 2 * Math.PI;
/** Below this, the sine of its elevation, the eye sees water behind its feet. */
const LOOKING_DOWN = -0.55;

/** The mesh's triangles: two per cell between neighbouring rings and spokes. */
function cells(): Uint32Array {
  const indices = new Uint32Array((RINGS - 1) * SPOKES * 6);
  const row = SPOKES + 1;
  let at = 0;
  for (let ring = 0; ring < RINGS - 1; ring += 1) {
    for (let spoke = 0; spoke < SPOKES; spoke += 1) {
      const corner = ring * row + spoke;
      const out = corner + row;
      indices.set([corner, out, corner + 1, corner + 1, out, out + 1], at);
      at += 6;
    }
  }
  return indices;
}

/** The unit direction `frame`'s eye looks along, through the screen's middle. */
function ahead({ inverse, eye }: OutdoorFrame): Vec3 {
  // Clip (0, 0, ½, 1) back in the world: a point straight ahead of the eye.
  const at = [0, 1, 2, 3].map(
    (row) => 0.5 * (inverse[8 + row] ?? 0) + (inverse[12 + row] ?? 0),
  );
  const [x = 0, y = 0, z = 0, w = 1] = at;
  const way = [x / w - eye[0], y / w - eye[1], z / w - eye[2]] as const;
  const length = Math.hypot(...way);
  return [way[0] / length, way[1] / length, way[2] / length];
}

/**
 * The sea: the wave field brought to the frame's moment, then the mesh of
 * rings under the eye drawn with it into the scene pass.
 */
export const createSeaLayer: LayerMaker = async ({
  device,
  shader,
  pipeline: scenePipeline,
}) => {
  const field = createWaveField(device, SEAS, SEA_SEED);
  const own = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: {} },
      {
        binding: 1,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        sampler: {},
      },
      ...[2, 3, 4].map((binding) => ({
        binding,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        texture: { viewDimension: '2d-array' as const },
      })),
    ],
  });
  const pipeline = await scenePipeline({
    label: 'sea',
    module: await shader('sea', [SEA]),
    depth: 'solid',
    vertex: 'seaVertex',
    fragment: 'seaFragment',
    groups: [own],
    cullMode: 'none',
  });

  const grid = new Float32Array(4);
  const gridBuffer = device.createBuffer({
    size: grid.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const indices = cells();
  const indexBuffer = device.createBuffer({
    size: indices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(indexBuffer, 0, indices);
  const group = device.createBindGroup({
    layout: own,
    entries: [
      { binding: 0, resource: { buffer: gridBuffer } },
      {
        binding: 1,
        resource: device.createSampler({
          addressModeU: 'repeat',
          addressModeV: 'repeat',
          magFilter: 'linear',
          minFilter: 'linear',
          mipmapFilter: 'linear',
          maxAnisotropy: 16,
        }),
      },
      { binding: 2, resource: field.shift },
      { binding: 3, resource: field.slope },
      { binding: 4, resource: field.moment },
    ],
  });

  return {
    prepare: (encoder, frame) => {
      field.run(encoder, frame);
      const [x, y, z] = ahead(frame);
      const sector = y < LOOKING_DOWN ? AROUND : AHEAD;
      // Whole spokes only: the mesh turns in steps it cannot be seen to take.
      const step = sector / SPOKES;
      grid.set([Math.round(Math.atan2(z, x) / step) * step, sector]);
      device.queue.writeBuffer(gridBuffer, 0, grid);
    },
    draw: (pass) => {
      pass.setPipeline(pipeline);
      pass.setBindGroup(1, group);
      pass.setIndexBuffer(indexBuffer, 'uint32');
      pass.drawIndexed(indices.length);
    },
    dispose: () => {
      field.dispose();
      gridBuffer.destroy();
      indexBuffer.destroy();
    },
  };
};
