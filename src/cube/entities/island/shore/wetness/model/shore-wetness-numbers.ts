import { f32, wgsl } from '@/cube/shared/shader';

/** Waves back that are asked whether they wetted a point. */
export const WAVES_BACK = 6;
/** What a point no asked wave reached answers, seconds. */
export const NEVER_WET = 1e3;
/** Seconds over which sand the water has left goes from soaked to dry. */
export const DRIES = 28;
/** Seconds between which the film of water left on the sand sinks away. */
export const FILM = [0.4, 5] as const;

/** The numbers above as WGSL constants, the film's as two. */
export const SHORE_WETNESS_NUMBERS = wgsl(
  'outside/shore-wetness-numbers',
  /* wgsl */ `
const WAVES_BACK = ${f32(WAVES_BACK)};
const NEVER_WET = ${f32(NEVER_WET)};
const DRY_SECONDS = ${f32(DRIES)};
const FILM_FROM = ${f32(FILM[0])};
const FILM_TO = ${f32(FILM[1])};
`,
);
