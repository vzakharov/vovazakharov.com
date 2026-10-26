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
  answerTap,
  entered,
  FLEE_EVERY,
  left,
  type Mice,
  miceAt,
  outingTarget,
  retarget,
  type RunDoor,
  scattered,
} from './model/mouse-run';
export {
  courseOf,
  endOf,
  hop,
  runAt,
  type RunEnd,
  type RunMoment,
  type Runner,
  runnerAt,
  type RunOpening,
} from './model/mouse-run-clock';
export {
  facingAlong,
  type RunPath,
  runPathLength,
  sideOf,
} from './model/mouse-run-course';
export {
  MUSHROOM_SPECIES,
  type MushroomGenes,
  mushroomGenes,
  type Species,
  type Spotted,
} from './model/mushroom-genes';
export {
  capOnCanvas,
  TAP_PARTS,
  type TapArea,
  tapArea,
  toCanvas,
} from './model/mushroom-outline';
export {
  capFrame,
  capSeat,
  type Splayed,
  splayed,
} from './model/mushroom-pose';
export {
  capSurface,
  type Chorded,
  CURVE_STEPS,
  curveSteps,
  stemHalfWidth,
} from './model/mushroom-profile';
export type { Burrows, NightRun } from './model/night-runs';
export {
  pathLength,
  PEEK_SPAN,
  peekPath,
  peekWindow,
  type TripPhase,
  tripSpan,
  tripWindows,
  WINDOW_SWING,
  wormBody,
  wormClock,
  wormGirth,
  wormPath,
  wormPeek,
  type WormPose,
  wormTarget,
  wormTrip,
} from './model/worm';
export { doorHitArea, mouseHead } from './ui/door-reach';
export { tappedDoor } from './ui/door-tap';
export {
  paintDoor,
  paintHouse,
  paintWindow,
  paintWindows,
  type ShownWindow,
  SHUT_WINDOW,
  windowPlace,
  type WindowSwing,
} from './ui/draw-house';
export { paintRunner } from './ui/draw-mouse';
export {
  drawMushroom,
  drawMushroomShadow,
  drawSelection,
  drawSelectionRing,
  type RingGraphics,
} from './ui/draw-mushroom';
export type { ShownWorm } from './ui/draw-worm';
export { iconGenes, iconSize, SPECIES_ICON_HEIGHT } from './ui/icon-genes';
export {
  flowerLight,
  type MushroomLights,
  mushroomLights,
} from './ui/mushroom-light';
export type { HazedGraphics } from './ui/mushroom-paint';
export {
  drawnHolds,
  drawnUnder,
  flowerTakes,
  type MushroomTarget,
  type WithTapArea,
} from './ui/mushroom-tap';
export { mushroomTints } from './ui/mushroom-tints';
export {
  type HousePart,
  tappedPart,
  windowFace,
  windowReaches,
} from './ui/window-reach';
