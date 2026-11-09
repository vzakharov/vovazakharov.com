export {
  type Eye,
  eyeAt,
  type GroundAt,
  IDLE,
  MAX_HEIGHT,
  MIN_HEIGHT,
  step,
  withHeading,
  withHeight,
} from './model/eye';
export {
  EARTH_OPENING,
  type Eye as GlobeEye,
  eyeAt as globeEyeAt,
  type GroundAt as GlobeGroundAt,
  headingOf,
  heightOverGround,
  ISLAND_OPENING,
  type Opening,
  openingOf,
  step as stepOnGlobe,
  STILL,
  withHeading as withGlobeHeading,
  withHeight as withGlobeHeight,
} from './model/globe-eye';
export { poseOf as globePoseOf } from './model/globe-pose';
export { type LookHint, lookHint } from './model/look-hint';
export { poseOf } from './model/pose';
export { bindEyeControls } from './ui/eye-controls';
