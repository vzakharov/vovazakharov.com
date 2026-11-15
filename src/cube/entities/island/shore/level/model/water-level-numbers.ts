import { f32, wgsl } from '@/cube/shared/shader';

import { SEA_GRAVITY } from '../../../sea';

/** The depth, metres, at which the swell begins to feel the bottom. */
export const SWELL_FEELS = 30;
/** The beach's slope the shore's timing is worked out for. */
export const BEACH_SLOPE = 1 / 12;
/** The least depth a wave is timed over, so it reaches the sand in the end. */
export const SHORE_SHALLOWEST = 0.3;
/** Seconds a wave loses between deep water and the sand. */
export const SHORE_LAG = Math.sqrt(SWELL_FEELS / SEA_GRAVITY) / BEACH_SLOPE;
/** How far either side the bed is read for which way the shore faces. */
export const SHORE_FACING_REACH = 4;
/** What the island's lee keeps of a wave's height. */
export const SHORE_LEE = 0.3;
/** Green's law, anchored where linear theory puts a shoaling swell. */
export const SHOALS_FROM = 4.55;
/** A broken wave's height as a share of the depth it runs in. */
export const SURF_SHARE = 0.62;
/** How far toward breaking a wave is between unbroken and a bore. */
export const BREAKS = [0.8, 1.15] as const;
/** How high a wave is thrown up the sand, as a share of its height. */
export const RUNUP_SHARE = 0.55;
/** The sheet's depth over Shen and Meyer's, whose lens is thinner than seen. */
export const SHEET_THICK = 1.5;
/** Seconds a sheet takes to gather at the still shoreline. */
export const SHEET_GATHERS = 0.5;
/** The depth of still water, metres, past which no sheet lifts the surface. */
export const SHEET_REACHES = 0.6;
/**
 * How far under the still sea a spent sheet's top is said to lie, and the
 * sheet depth under which it sinks there: a sheet draining off the sand
 * hands the surface back to the surf without a step.
 */
export const SHEET_SINKS = 0.1;
export const SHEET_SINKS_UNDER = 0.01;
/** How far under dry sand the level is said to lie. */
export const DRY_UNDER = 0.03;
/** The width, metres, the level's joins are rounded over. */
export const SHORE_ROUND = 0.012;

/** The numbers above as WGSL constants of those names, the breaks as two. */
export const WATER_LEVEL_NUMBERS = wgsl(
  'outside/water-level-numbers',
  /* wgsl */ `
const SWELL_FEELS = ${f32(SWELL_FEELS)};
const BEACH_SLOPE = ${f32(BEACH_SLOPE)};
const SHORE_SHALLOWEST = ${f32(SHORE_SHALLOWEST)};
const SHORE_LAG = ${f32(SHORE_LAG)};
const SHORE_FACING_REACH = ${f32(SHORE_FACING_REACH)};
const SHORE_LEE = ${f32(SHORE_LEE)};
const SHOALS_FROM = ${f32(SHOALS_FROM)};
const SURF_SHARE = ${f32(SURF_SHARE)};
const BREAKS_FROM = ${f32(BREAKS[0])};
const BREAKS_TO = ${f32(BREAKS[1])};
const RUNUP_SHARE = ${f32(RUNUP_SHARE)};
const SHEET_THICK = ${f32(SHEET_THICK)};
const SHEET_GATHERS = ${f32(SHEET_GATHERS)};
const SHEET_REACHES = ${f32(SHEET_REACHES)};
const SHEET_SINKS = ${f32(SHEET_SINKS)};
const SHEET_SINKS_UNDER = ${f32(SHEET_SINKS_UNDER)};
const DRY_UNDER = ${f32(DRY_UNDER)};
const SHORE_ROUND = ${f32(SHORE_ROUND)};
`,
);
