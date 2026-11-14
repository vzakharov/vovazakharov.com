/// <reference types="@webgpu/types" />

import type { CanDispose } from '@/kernel/shared/typings';

import { createOutdoors, type Outdoors } from '@/cube/widgets/outdoors';

import { DEPTH_FORMAT, type Lensed, SCENE_TARGETS } from './programs';

/** The outside's layers, and the lens it is seen through. */
type Outside = Lensed & { layers: Outdoors };

/** The outside, made the first time it is prepared and kept from then. */
export type OutsideOnce = CanDispose & {
  /** Resolves once the outside is made: the same promise on every call. */
  prepare: () => Promise<void>;
  /** The outside made; throws where `prepare` has not resolved yet. */
  made: () => Outside;
};

export function outsideOnce(
  device: GPUDevice,
  lensOf: () => Promise<GPURenderPipeline>,
): OutsideOnce {
  let outside: Outside | null = null;
  let preparing: Promise<void> | null = null;
  const make = async (): Promise<void> => {
    const [layers, lens] = await Promise.all([
      createOutdoors(device, {
        targets: SCENE_TARGETS,
        depthFormat: DEPTH_FORMAT,
      }),
      lensOf(),
    ]);
    outside = { layers, lens };
  };
  return {
    prepare: async () => {
      preparing ??= make();
      return preparing;
    },
    made: () => {
      if (outside === null) {
        throw new Error('The outside is drawn before it was prepared');
      }
      return outside;
    },
    dispose: () => {
      outside?.layers.dispose();
    },
  };
}
