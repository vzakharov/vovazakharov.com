import { assemble, type Wgsl } from '@/cube/shared/shader';
import { ISLAND_HEIGHT, WATER_LEVEL } from '@/cube/entities/island';

import {
  AERIAL,
  CUBE_SHADOW,
  DAYLIGHT,
  OUTDOOR_STAGE,
  SKY,
} from '../../../stage';
import {
  SAND_SHADER,
  SEA,
  SHELL_SHADER,
  SKY_CLOUD_SHADER,
  SKY_SHADER,
} from '../../../surface';

/**
 * Every outdoor shader by name, as the roots it is assembled from: a layer
 * compiles its own from here, and `pnpm shaders:cube` compiles them all.
 * `seam` is no layer's: the pieces every layer may call, compiled together.
 */
export const OUTDOOR_SHADERS = {
  seam: [
    OUTDOOR_STAGE,
    SKY,
    AERIAL,
    DAYLIGHT,
    ISLAND_HEIGHT,
    WATER_LEVEL,
    CUBE_SHADOW,
  ],
  sky: [SKY_SHADER],
  skyClouds: [SKY_CLOUD_SHADER],
  sand: [SAND_SHADER],
  shell: [SHELL_SHADER],
  sea: [SEA],
} as const satisfies Record<string, readonly Wgsl[]>;

/** The line every outdoor shader opens with: its materials branch freely. */
const HEAD = 'diagnostic(off, derivative_uniformity);';

/** `roots` and what they need, as one outdoor shader's whole source. */
export const outdoorSource = (roots: readonly Wgsl[]): string =>
  `${HEAD}\n${assemble(roots)}`;
