/// <reference types="@webgpu/types" />

import { shortTurn } from '@/cube/shared/lib/turn';
import type { Vec3 } from '@/cube/shared/lib/vec';

import type { OutdoorFrame } from '../../../stage';
import { RINGS, SEAS, SPOKES } from '../../../surface';
import { createWaveField } from '../../wave';
import { OUTDOOR_SHADERS } from '../lib/outdoor-shaders';
import type { LayerMaker } from './outdoor-layer';

/** How much wider than the screen's own sweep the sector of rings is laid. */
const SECTOR_MARGIN = 1.15;
const AROUND = 2 * Math.PI;
/** Points along each edge of the screen at which its sweep is measured. */
const EDGE_POINTS = 9;
/**
 * The slope of the steepest ray that still comes down to the sea: a crest
 * near the eye stands a little over the horizon.
 */
const RISES = 0.05;

/**
 * The mesh's triangles: two per cell between neighbouring rings and spokes,
 * wound so the side that faces up is the front.
 */
function cells(): Uint32Array<ArrayBuffer> {
  const indices = new Uint32Array((RINGS - 1) * SPOKES * 6);
  const row = SPOKES + 1;
  let at = 0;
  for (let ring = 0; ring < RINGS - 1; ring += 1) {
    for (let spoke = 0; spoke < SPOKES; spoke += 1) {
      const corner = ring * row + spoke;
      const out = corner + row;
      indices.set([corner, corner + 1, out, corner + 1, out + 1, out], at);
      at += 6;
    }
  }
  return indices;
}

/** The direction from `frame`'s eye through clip point (`x`, `y`). */
function through({ inverse, eye }: OutdoorFrame, x: number, y: number): Vec3 {
  const [px = 0, py = 0, pz = 0, w = 1] = [0, 1, 2, 3].map(
    (row) =>
      x * (inverse[row] ?? 0) +
      y * (inverse[4 + row] ?? 0) +
      0.5 * (inverse[8 + row] ?? 0) +
      (inverse[12 + row] ?? 0),
  );
  return [px / w - eye[0], py / w - eye[1], pz / w - eye[2]];
}

/**
 * The bearing of the middle of the sector of sea `frame` can show, and the
 * sector's whole angle: every ray through the screen's edge that comes down
 * to the sea lies within it.
 */
function sweep(frame: OutdoorFrame): { yaw: number; sector: number } {
  const [x, , z] = through(frame, 0, 0);
  const yaw = Math.atan2(z, x);
  let widest = 0;
  for (let i = 0; i < EDGE_POINTS; i += 1) {
    const along = (2 * i) / (EDGE_POINTS - 1) - 1;
    for (const [cx, cy] of [
      [-1, along],
      [1, along],
      [along, -1],
      [along, 1],
    ] as const) {
      const [rx, ry, rz] = through(frame, cx, cy);
      if (ry > RISES * Math.hypot(rx, rz)) continue;
      const turn = Math.atan2(rz, rx) - yaw;
      widest = Math.max(widest, Math.abs(shortTurn(turn)));
    }
  }
  const sector = 2 * widest * SECTOR_MARGIN;
  // Past this the point under the eye is on screen, or nearly: all round.
  return { yaw, sector: sector > 0.7 * AROUND ? AROUND : sector };
}

/**
 * The sea: the wave field brought to the frame's moment, then the mesh of
 * rings under the eye drawn with it into the scene pass.
 */
export const seaLayer: LayerMaker = async ({
  device,
  shader,
  pipeline: scenePipeline,
}) => {
  const field = createWaveField(device, SEAS);
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
    module: await shader('sea', OUTDOOR_SHADERS.sea),
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
      const { yaw, sector } = sweep(frame);
      // Whole spokes only: the mesh turns in steps it cannot be seen to take.
      const step = sector / SPOKES;
      grid.set([Math.round(yaw / step) * step, sector]);
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
