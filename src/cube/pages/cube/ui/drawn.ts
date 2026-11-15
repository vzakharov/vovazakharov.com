/// <reference types="@webgpu/types" />

import type { FloorRange, Scenery } from '../lib/mesh';

/** A run of a vertex buffer and the pipeline that draws it. */
type Run = FloorRange & { pipeline: GPURenderPipeline };

/** A scenery on the GPU: its vertices, and each floor's run of them. */
export type Drawn = { buffer: GPUBuffer; runs: readonly Run[] };

/**
 * `scenery` on `device`, each floor's run drawn by `pipelineOf` that floor;
 * null for a scenery with no vertex.
 */
export function drawnOf(
  device: GPUDevice,
  { data, ranges }: Scenery,
  pipelineOf: (n: number) => GPURenderPipeline,
): Drawn | null {
  if (data.byteLength === 0) return null;
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(buffer, 0, data);
  return {
    buffer,
    runs: ranges.map((range) => ({ ...range, pipeline: pipelineOf(range.n) })),
  };
}

export function drawRuns(
  pass: GPURenderPassEncoder,
  { buffer, runs }: Drawn,
): void {
  pass.setVertexBuffer(0, buffer);
  for (const { pipeline, firstVertex, count } of runs) {
    pass.setPipeline(pipeline);
    pass.draw(count, 1, firstVertex);
  }
}
