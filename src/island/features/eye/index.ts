export {
  type Eye,
  eyeAt,
  type GroundAt,
  headingOf,
  heightOverGround,
  ISLAND_OPENING,
  MAX_HEIGHT,
  MIN_HEIGHT,
  openingOf,
  pointOf,
  seaHeightOf,
  step,
  STILL,
  withHeading,
  withHeight,
} from './model/eye';
export { lookHint } from './model/look-hint';
export {
  type HintShowing,
  latchHint,
  LOOK_HINT_FADE_SECONDS,
  LOOK_HINT_LIT_SECONDS,
  NO_HINT,
} from './model/look-hint-latch';
export { poseOf } from './model/pose';
export { bindEyeControls } from './ui/eye-controls';
