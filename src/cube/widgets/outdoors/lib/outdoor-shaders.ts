import { assemble, type Wgsl } from '@/cube/shared/shader';
import { ISLAND_HEIGHT, WATER_LEVEL } from '@/cube/entities/island';

import { AERIAL } from './aerial.shader';
import { CUBE_SHADOW } from './cube-shadow.shader';
import { DAYLIGHT } from './daylight.shader';
import { OUTDOOR_STAGE } from './outdoor-stage.shader';
import { SAND_SHADER } from './sand-shader.shader';
import { SEA } from './sea.shader';
import { SHELL_SHADER } from './shell-shader.shader';
import { SKY } from './sky.shader';
import { SKY_CLOUD_SHADER } from './sky-cloud-shader.shader';
import { SKY_SHADER } from './sky-shader.shader';

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
