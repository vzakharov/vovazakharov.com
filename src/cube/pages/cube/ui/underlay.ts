/// <reference types="@webgpu/types" />

import type { CanDispose, Sized } from '@/kernel/shared/typings';

import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import type { Seen } from '@/cube/shared/lib/vec';
import { assemble } from '@/cube/shared/shader';

import { inverse } from '../lib/matrix';
import { COVER } from './cover.shader.generated';
import { DEPTH_FORMAT, SCENE_TARGETS } from './programs';
import { UNDERLAY } from './underlay.shader.generated';

/** Floats of `underlay.wgsl`'s `Underlay`: two matrices, two vectors. */
const UNDERLAY_FLOATS = 16 + 16 + 4 + 4;

/**
 * Lays a resolved outside under the rooms of a scene pass, its depth with
 * it, so the rooms are drawn over it whole and hidden where it is nearer.
 */
export type Underlay = CanDispose & {
  /**
   * Draws `outside`, a full frame of `size` seen as `seen`, into `pass`,
   * which draws into the scene's targets and depth.
   */
  draw: (
    pass: GPURenderPassEncoder,
    outside: GPUTextureView,
    seen: Seen,
    size: Sized,
  ) => void;
};

export function createUnderlay(device: GPUDevice): Underlay {
  const shader = device.createShaderModule({
    code: assemble([UNDERLAY, COVER]),
  });
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: shader, entryPoint: 'vertexMain' },
    fragment: {
      module: shader,
      entryPoint: 'underlayMain',
      targets: SCENE_TARGETS,
    },
    depthStencil: {
      format: DEPTH_FORMAT,
      depthWriteEnabled: true,
      depthCompare: 'always',
    },
  });
  const uniforms = device.createBuffer({
    size: UNDERLAY_FLOATS * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  /** The bind group over each of the history's two frames, as laid lately. */
  const groups = new Map<GPUTextureView, GPUBindGroup>();
  const groupOf = (outside: GPUTextureView): GPUBindGroup => {
    const known = groups.get(outside);
    if (known !== undefined) return known;
    // A third view is a history remade: its old frames are gone.
    if (groups.size >= 2) groups.clear();
    const group = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: uniforms } },
        { binding: 1, resource: outside },
      ],
    });
    groups.set(outside, group);
    return group;
  };

  return {
    draw: (pass, outside, { viewProjection, eye }, { width, height }) => {
      const data = new Float32Array(UNDERLAY_FLOATS);
      data.set(viewProjection, 0);
      data.set(inverse(viewProjection), 16);
      data.set([...eye, ROOM_METRES], 32);
      data.set([width, height], 36);
      device.queue.writeBuffer(uniforms, 0, data);
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, groupOf(outside));
      pass.draw(3);
    },
    dispose: () => {
      uniforms.destroy();
      groups.clear();
    },
  };
}
