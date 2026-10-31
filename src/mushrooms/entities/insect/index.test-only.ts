export {
  hop,
  HOP_EVERY,
  HOP_REACH,
  jitter,
  LEAST_TREMBLE,
  rubbing,
  trembleSize,
} from './model/buzz-rest';
export { FRAME_MARGIN, type Framed, unframed } from './model/flight-frame';
export { nearerSide } from './model/flight-in';
export {
  BUTTERFLY_COLOURS,
  BUTTERFLY_RANGES,
  EYE_RADIUS,
  EYE_RINGS,
  PATTERN_TURN,
} from './model/insect-genes';
export { LIGHT_STEP, litCrest, litTurn } from './model/insect-light';
export {
  drinking,
  hopAt,
  PIVOT_SHARE,
  proboscis,
  restTurn,
  SIP_DEPTH,
} from './model/insect-motion';
export {
  ABDOMEN,
  type BodySide,
  eyeCentre,
  headOf,
  WING_PAIRS,
  wingOutline,
} from './model/insect-outline';
export { TURN_RATE } from './model/insect-steering';
export { inBody, PROBOSCIS_STEPS, proboscisLine } from './model/proboscis';
export { offAloft, PAST_BROW, reachesScreen } from './ui/insect-away';
export type { LegFlight } from './ui/insect-drawn';
export {
  aloftFramed,
  SEAT_FADE,
  type SeatEnds,
  sinkingAloft,
  SKIM,
  type Veer,
  veered,
  veeredAlong,
  veerOf,
} from './ui/insect-frame';
export { drawnFlier, drawnSitter, seatedZoom } from './ui/insect-seat';
export { shadowOf } from './ui/insect-shadow';
export { sinkingOf } from './ui/insect-sink';
