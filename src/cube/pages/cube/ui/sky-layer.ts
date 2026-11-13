/// <reference types="@webgpu/types" />

import { OUTDOOR_SHADERS } from '../lib/outdoor-shaders';
import { drawing, type LayerMaker } from './outdoor-layer';

/** The sky: the backdrop every other layer is drawn over. */
export const skyLayer: LayerMaker = async ({ shader, pipeline }) =>
  drawing(
    await pipeline({
      label: 'sky',
      module: await shader('sky', OUTDOOR_SHADERS.sky),
      depth: 'backdrop',
      vertex: 'backdropVertex',
    }),
    3,
  );
