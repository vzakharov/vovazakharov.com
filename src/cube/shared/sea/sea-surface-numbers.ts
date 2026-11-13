import { f32, wgsl } from '../shader/wgsl';
import { TILE } from './cascade';
import { RINGS } from './sea-tables';

/** Metres: the radius at which the mesh's rings stop growing by a fixed step. */
const HUB = 0.5;
/** Metres: how far out the last ring lies. */
const REACH = 20_000;
/** How much wider each ring is than the last, as a rate per ring. */
const GROWTH = Math.log(REACH / HUB + 1) / (RINGS - 1);

/**
 * The mesh's hub and growth, and the texels along a wave map's side, as WGSL
 * constants: `SEA_HUB`, `SEA_GROWTH`, `WAVE_TILE`.
 */
export const SEA_SURFACE_NUMBERS = wgsl(
  'sea/surface-numbers',
  /* wgsl */ `
const SEA_HUB = ${f32(HUB)};
const SEA_GROWTH = ${f32(GROWTH)};
const WAVE_TILE = ${f32(TILE)};
`,
);
