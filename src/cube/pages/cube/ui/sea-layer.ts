/// <reference types="@webgpu/types" />

import { OUTDOOR_SHADERS } from '../lib/outdoor-shaders';
import { drawing, type LayerMaker } from './outdoor-layer';

/**
 * The sea: one triangle over the screen whose fragments find the water along
 * their rays and write its depth, so the sand and the cube stand in front.
 */
export const seaLayer: LayerMaker = async ({ shader, pipeline }) =>
  drawing(
    await pipeline({
      label: 'sea',
      module: await shader('sea', OUTDOOR_SHADERS.sea),
      depth: 'solid',
      vertex: 'backdropVertex',
    }),
    3,
  );
