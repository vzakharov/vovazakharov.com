/// <reference types="@webgpu/types" />

import type { Sized } from '@/kernel/shared/typings';

import type { SeenAt } from '@/cube/shared/lib/clock';

import type { OutsideLens } from './outside-lens';

/** The floats of `lens-stage.wgsl`'s `Uniforms`: a matrix and four vectors. */
const UNIFORM_FLOATS = 16 + 4 + 4 + 4 + 4;

/** What one pass's `Uniforms` hold, as `lens-stage.wgsl` lays them out. */
type Framing = Sized &
  SeenAt & {
    /** The outside's lens as set for the frame; null for a floor's. */
    outside: OutsideLens | null;
    /** How far the drowsy eye darkens the frame's corners. */
    vignette: number;
  };

/** `framing` as the floats of a `Uniforms`. */
export function uniformsOf({
  viewProjection,
  eye,
  seconds,
  hour,
  width,
  height,
  outside,
  vignette,
}: Framing): Float32Array<ArrayBuffer> {
  const data = new Float32Array(UNIFORM_FLOATS);
  data.set(viewProjection, 0);
  data.set([...eye, 1], 16);
  data.set([seconds, hour, width, height], 20);
  if (outside !== null) {
    data.set([outside.exposure, outside.eyelids, outside.indoors ?? 0], 24);
  }
  data.set([vignette], 28);
  return data;
}

/** A buffer of `Uniforms` on `device`, and the group binding it by `layout`. */
export function createUniforms(
  device: GPUDevice,
  layout: GPUBindGroupLayout,
): { buffer: GPUBuffer; group: GPUBindGroup } {
  const buffer = device.createBuffer({
    size: UNIFORM_FLOATS * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const group = device.createBindGroup({
    layout,
    entries: [{ binding: 0, resource: { buffer } }],
  });
  return { buffer, group };
}
