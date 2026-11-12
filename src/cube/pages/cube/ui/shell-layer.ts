/// <reference types="@webgpu/types" />

import { OUTDOOR_SHADERS } from '../lib/outdoor-shaders';
import { drawing, type LayerMaker } from './outdoor-layer';

/** Six faces of two triangles. */
const VERTICES = 36;

/** The cube from outside: its six faces, placed by the shader itself. */
export const shellLayer: LayerMaker = async ({ shader, pipeline }) =>
  drawing(
    await pipeline({
      label: 'shell',
      module: await shader('shell', OUTDOOR_SHADERS.shell),
      depth: 'solid',
    }),
    VERTICES,
  );
