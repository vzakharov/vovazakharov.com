import type { Named } from '@/kernel/shared/typings';

import { assemble, type Wgsl } from '@/cube/shared/lib/wgsl';
import {
  AERIAL,
  CUBE_SHADOW,
  ISLAND_HEIGHT,
  OUTDOOR_STAGE,
  SKY,
  WATER_LEVEL,
} from '@/cube/shared/outside';
import { SAND_SHADER } from '@/cube/shared/sand';
import { SKY_CLOUD_SHADER, SKY_SHADER } from '@/cube/shared/sky';

/**
 * Every outdoor shader by name, as the roots it is assembled from: a layer
 * compiles its own from here, and `pnpm shaders:cube` compiles them all.
 * `seam` is no layer's: the pieces every layer may call, compiled together.
 */
export const OUTDOOR_SHADERS = {
  seam: [OUTDOOR_STAGE, SKY, AERIAL, ISLAND_HEIGHT, WATER_LEVEL, CUBE_SHADOW],
  sand: [SAND_SHADER],
  sky: [SKY_SHADER],
  skyClouds: [SKY_CLOUD_SHADER],
} as const satisfies Record<string, readonly Wgsl[]>;

export type OutdoorShader = keyof typeof OUTDOOR_SHADERS;

/** The whole source of outdoor shader `name`. */
export const outdoorSource = (name: OutdoorShader): string =>
  assemble(OUTDOOR_SHADERS[name]);

/** Every outdoor shader's whole source, by its name. */
export const outdoorSources = (): Array<Named & { source: string }> =>
  Object.entries(OUTDOOR_SHADERS).map(([name, roots]) => ({
    name,
    source: assemble(roots),
  }));
