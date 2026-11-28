// masd-disable insignificant -- the wave-2 scenes under `clip/pages/` are its consumers

/**
 * The cast: one puppet, the operator's robo-avatar, and the band it plays four
 * ways. Everything drawn is a pure function of the pen and its arguments; the
 * sides `L` and `R` are the viewer's.
 *
 * - `puppet(pen, { place, pose, outfit, look })` — the figure in a pose.
 * - `head(pen, { jaw })` — the head alone, the point between its eyes at the origin.
 * - `player(pen, 'guitar', { place, beats })` — one of the band, playing.
 * - `castSheet(pen, beats, jaw)` — all four on a flat ground.
 * - `lerpPose`, `reaching`, `carried`, `fitted` — poses out of `POSES`.
 */
export {
  BUILDS,
  castSheet,
  FORM_LOOKS,
  guitar,
  micStand,
  player,
  type PlayerOptions,
  type Role,
  ROLES,
  thump,
} from './band';
export {
  type Build,
  type Carriage,
  carried,
  type Dress,
  fitted,
  type Grip,
  GRIPS,
  type Joint,
  JOINTS,
  lerpPose,
  type Outfit,
  OUTFITS,
  type Placed,
  type Pose,
  type PoseName,
  POSES,
  puppet,
  type PuppetOptions,
  type Reach,
  reaching,
  type Side,
  STANDARD_BUILD,
  type Worn,
} from './body';
export {
  DEFAULT_LOOK,
  type Hair,
  HAIRS,
  head,
  LED_PALETTE,
  type Look,
} from './head';
