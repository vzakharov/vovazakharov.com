/**
 * The cast: one puppet, the operator's robo-avatar, and the band it plays four
 * ways. Everything drawn is a pure function of the pen and its arguments; the
 * sides `L` and `R` are the viewer's.
 *
 * - `puppet(pen, { place, pose, outfit, look })` — the figure in a pose.
 * - `head(pen, { jaw })` — the head alone, the point between its eyes at the origin.
 * - `player(pen, 'guitar', { place, beats })` — one of the band, playing.
 * - `lerpPose` — poses out of `POSES`.
 */
export { FORM_LOOKS, player, type Role, ROLES } from './band';
export { lerpPose, POSES, puppet } from './body';
export { head, type Look } from './head';
