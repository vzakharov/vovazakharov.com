/// <reference types="@webgpu/types" />

import { createBackdrop } from './backdrop';
import { cloudNoise } from './noise';
import { createPanorama } from './panorama';
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
  scale = 1,
): Promise<Sky> {
  const tables = airTables(device);
  const view = await skyView(device, tables);
  const noise = await cloudNoise(device);
  const panorama = await createPanorama(device, tables, view, noise, scale);
  const backdrop = await createBackdrop(device, targets, tables, view, panorama);
  return {
    prepare: (encoder, { seconds }) => {
      backdrop.show(panorama.advance(encoder, seconds));
    },
    draw: backdrop.draw,
    dispose: () => {
      panorama.dispose();
      backdrop.dispose();
      for (const texture of [noise.shape, noise.grain, noise.weather]) {
        texture.destroy();
      }
      for (const texture of [tables.transmittance, tables.scatter, view]) {
        texture.destroy();
      }
    },
  };
}
