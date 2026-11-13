import type { Named } from '@/kernel/shared/typings';

import { assemble, type Wgsl } from '@/cube/shared/lib/wgsl';
import {
  AERIAL,
  CUBE_SHADOW,
  DAYLIGHT,
  ISLAND_HEIGHT,
  OUTDOOR_STAGE,
  SKY,
  WATER_LEVEL,
} from '@/cube/shared/outside';
import { SAND_SHADER } from '@/cube/shared/sand';
import { SEA } from '@/cube/shared/sea';
import { SKY_CLOUD_SHADER, SKY_SHADER } from '@/cube/shared/sky';

import { outsideLensSource } from './outside-lens';
import { SHELL_SHADER } from './shell-shader';

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

/** Every outdoor shader's whole source, by its name, the lens's among them. */
export const outdoorSources = (): Array<Named & { source: string }> => [
  ...Object.entries(OUTDOOR_SHADERS).map(([name, roots]) => ({
    name,
    source: outdoorSource(roots),
  })),
  { name: 'lens', source: outsideLensSource() },
];
