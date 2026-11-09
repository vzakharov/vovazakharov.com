export {
  EARTH_OPENING,
  type Eye as GlobeEye,
  eyeAt as globeEyeAt,
  type GroundAt as GlobeGroundAt,
  headingOf,
  heightOverGround,
  ISLAND_OPENING,
  MAX_HEIGHT,
  MIN_HEIGHT,
  type Opening,
  openingOf,
  step as stepOnGlobe,
  STILL,
  withHeading as withGlobeHeading,
  withHeight as withGlobeHeight,
} from './model/eye';
export { type LookHint, lookHint } from './model/look-hint';
export { poseOf as globePoseOf } from './model/pose';
export { bindEyeControls } from './ui/eye-controls';
