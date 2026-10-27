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
export {
  MUSHROOM_SPECIES,
  type MushroomGenes,
  mushroomGenes,
  type Species,
} from './model/mushroom-genes';
export {
  capOnCanvas,
  TAP_PARTS,
  type TapArea,
  tapArea,
  toCanvas,
} from './model/mushroom-outline';
export { capFrame, capSeat, splayed } from './model/mushroom-pose';
export { capSurface, stemHalfWidth } from './model/mushroom-profile';
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
export { drawMushroom } from './ui/draw-mushroom';
export { iconGenes, iconSize, SPECIES_ICON_HEIGHT } from './ui/icon-genes';
export { coversShown, occupantsOn } from './ui/mushroom-cover';
export { moveMushroom } from './ui/mushroom-frame';
export {
  containsMushroom,
  drawnMushrooms,
  shownMushrooms,
} from './ui/mushroom-hits';
export { mushroomLights } from './ui/mushroom-light';
export { MushroomSelection, type Puffing } from './ui/mushroom-selection';
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
