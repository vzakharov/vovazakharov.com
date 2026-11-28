export {
  DOOR_ASPECT,
  type DoorPlace,
  doorStations,
  type Furnishing,
  FURNISHINGS,
  type House,
  onStem,
  paintedSpots,
  windowSlots,
} from './model/house';
export { OPENING_FEET } from './model/placement';
export {
  type Planted,
  type Spore,
  SPROUT_START,
  type WithMushrooms,
} from './model/planted';
export { type Laid, laidOf, placeIn, sizeOn } from './ui/clump-layout';
export type { Opener } from './ui/clump-shade';
export { doorHitArea } from './ui/door-reach';
export { tappedDoor } from './ui/door-tap';
export {
  paintDoor,
  paintHouse,
  paintWindow,
  type ShownWindow,
  SHUT_WINDOW,
  type WindowSwing,
} from './ui/draw-house';
export { iconGenes, iconSize, SPECIES_ICON_HEIGHT } from './ui/icon-genes';
export { coversShown, occupantsOn } from './ui/mushroom-cover';
export { moveMushroom } from './ui/mushroom-frame';
export {
  containsMushroom,
  drawnMushrooms,
  shownMushrooms,
} from './ui/mushroom-hits';
export {
  type Body,
  paintLit,
  type Shown,
  stepsHere,
  unplacedShown,
} from './ui/mushroom-shown';
export { drawnUnder, flowerTakes } from './ui/mushroom-tap';
export { coveredAt, WindowGlow, windowMiddles } from './ui/window-glow';
export {
  type HousePart,
  tappedPart,
  windowFace,
  windowReaches,
} from './ui/window-reach';
export { type Lights, windowsLit } from './ui/windows-lit';
