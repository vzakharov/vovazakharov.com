import { f32, wgsl } from '../shader/wgsl';

/**
 * Metres from the island's crest between which the swell's ordered train,
 * which `waterLevel` draws, gives way to the open sea's own random swell.
 */
export const TRAIN_ENDS = [140, 260] as const;

/**
 * Still depths, metres, over which the swell cascade's waves die out toward
 * the beach: a wave cannot stand in water much shallower than it is long.
 */
export const SWELL_DIES_OVER = [0.3, 3] as const;

/** The numbers above as WGSL constants, each pair as two. */
export const SEA_SHORE_NUMBERS = wgsl(
  'sea/shore-numbers',
  /* wgsl */ `
const OFFSHORE_FROM = ${f32(TRAIN_ENDS[0])};
const OFFSHORE_TO = ${f32(TRAIN_ENDS[1])};
const SWELL_DIES_FROM = ${f32(SWELL_DIES_OVER[0])};
const SWELL_DIES_TO = ${f32(SWELL_DIES_OVER[1])};
`,
);
