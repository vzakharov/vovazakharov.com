import type { Vec2 } from '../lib/vec';
import { f32, vecf, wgsl } from '../lib/wgsl';

/** How high the surge lifts the sea, in metres. */
const SURGE = 0.12;
/** Surges an hour, a whole number so the hour's end meets its start. */
const SURGES = 300;
/** Metres from one surge's crest to the next. */
const SURGE_LENGTH = 60;
/** The unit direction the surge runs, on the ground plan: to the north-east. */
const SURGE_RUNS: Vec2 = [Math.SQRT1_2, -Math.SQRT1_2];

const HOUR = 3600;

/**
 * The sea's slow surface at `xz` in the world frame, `seconds` into the hour:
 * metres over the still sea, with the surge and the swash and no wind wave.
 * Where it is over `islandHeight` the sand is under water at that instant.
 */
export function waterLevel([x, z]: Vec2, seconds: number): number {
  const run = (x * SURGE_RUNS[0] + z * SURGE_RUNS[1]) / SURGE_LENGTH;
  const turn = (SURGES * seconds) / HOUR - run;
  return SURGE * Math.sin(2 * Math.PI * (turn - Math.floor(turn)));
}

/** `waterLevel(xz: vec2f, t: f32) -> f32`, the twin of the function above. */
export const WATER_LEVEL = wgsl(
  'outside/water-level',
  /* wgsl */ `
fn waterLevel(xz: vec2f, t: f32) -> f32 {
  let run = dot(xz, ${vecf(SURGE_RUNS)}) / ${f32(SURGE_LENGTH)};
  let turn = ${f32(SURGES)} * t / ${f32(HOUR)} - run;
  return ${f32(SURGE)} * sin(${f32(2 * Math.PI)} * fract(turn));
}
`,
);
