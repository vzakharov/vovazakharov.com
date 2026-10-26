export type { BeeGenes } from './model/bee-genes';
export { crawl, hop, jitter, rubbing, trembleSize } from './model/buzz-rest';
export type { Sight, Timed } from './model/flight';
export { type Aloft, centreOf, framedOf, panOf } from './model/flight-frame';
export { outOfView } from './model/flight-in';
export type { Span } from './model/flight-timing';
export type { FlyGenes } from './model/fly-genes';
export { dartAt, dartWay } from './model/insect-dart';
export {
  type ButterflyGenes,
  type Buzzing,
  INSECT_KINDS,
  insectGenes,
  type InsectKind,
  type OfKind,
  PICTOGRAM_SEED,
} from './model/insect-genes';
export { litTurn } from './model/insect-light';
export {
  aloft,
  carriedFrom,
  type Dip,
  drinkDip,
  landingBob,
  proboscis,
  type Stay,
  wingBeat,
} from './model/insect-motion';
export {
  type BodySide,
  buzzRoot,
  buzzTurn,
  wingspan,
} from './model/insect-outline';
export type { Airborne } from './model/insect-paths';
export { startLeg, steer } from './model/insect-steering';
export {
  caughtAloft,
  type Flier,
  isShying,
  type WithPlanted,
} from './model/insects';
export { isSeat } from './model/perch-room';
export { isBeeSown, type Sown, type Specked, specksAt } from './model/pollen';
export { inBody } from './model/proboscis';
export { wingsShut } from './model/roost';
export { BEE_VEINS, drawBee, paintBeeBody, paintBeeLegs } from './ui/draw-bee';
export { BODY_SIDES, type BuzzParts, paintWing } from './ui/draw-buzz';
export { drawFly, paintFlyBody, paintFlyLegs } from './ui/draw-fly';
export {
  drawInsect,
  type InsectParts,
  paintBody,
  paintProboscis,
  paintWings,
  type Proboscis,
  scaled,
} from './ui/draw-insect';
