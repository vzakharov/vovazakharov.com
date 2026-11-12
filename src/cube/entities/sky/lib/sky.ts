/// <reference types="@webgpu/types" />

import { createBackdrop } from './backdrop';
import { skyView } from './sky-view';
import { airTables } from './tables';

type Targets = Parameters<typeof createBackdrop>[1];

/** What the sky needs to know of a frame before the scene pass. */
type Moment = { seconds: number; eye: readonly [number, number, number] };

export type Sky = {
  prepare: (encoder: GPUCommandEncoder, moment: Moment) => void;
  draw: (pass: GPURenderPassEncoder) => void;
  dispose: () => void;
};

export async function createSky(
  device: GPUDevice,
  targets: Targets,
): Promise<Sky> {
  const tables = airTables(device);
  const view = await skyView(device, tables);
  const backdrop = await createBackdrop(device, targets, tables, view);
  return {
    prepare: () => undefined,
    draw: backdrop.draw,
    dispose: () => {
      for (const texture of [tables.transmittance, tables.scatter, view]) {
        texture.destroy();
      }
    },
  };
}
