/**
 * The screens and visits the layout sweeps run over, one list for every
 * sweep so a screen added here is tried by all of them. Only tests and
 * `scripts/sweep-mushrooms.ts` read it.
 */

/** Each screen as its name, width and height in CSS px. */
export const VIEWPORTS = [
  ['tablet', 1180, 820],
  ['tablet portrait', 820, 1180],
  ['phone', 390, 844],
  ['phone held sideways', 844, 390],
  ['small phone', 320, 568],
  ['desktop', 1920, 1080],
] as const;

/** A screen of `VIEWPORTS`, by name. */
export type Screen = (typeof VIEWPORTS)[number][0];

/** A phone narrower than any of `VIEWPORTS`, whose camera the zoom floor holds. */
export const FLOOR_HELD = ['280×600', 280, 600] as const;

/**
 * The small phones held sideways, whose sky is too short for the pickers'
 * top row: the controls' sweeps alone run over them.
 */
export const TURNED_SMALL = [
  ['small phone held sideways', 568, 320],
  ['600×280', 600, 280],
] as const;

/** The seed of each of 2000 visits, spread over the seed space. */
export const VISITS = Array.from(
  { length: 2000 },
  (_, index) => index * 7919 + 3,
);
