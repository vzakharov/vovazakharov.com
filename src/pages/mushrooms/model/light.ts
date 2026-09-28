/**
 * Where the light comes from: one direction per picture, which every lit
 * crest and every shade takes its side from.
 */

import type { Sized } from '@/shared/typings';

import type { Point } from './geometry';

/** `toward` is a unit vector, in screen axes (y down), pointing at the light. */
export type Light = { toward: Point };

/**
 * The meadow's light: from the middle of the ground, where the mushrooms
 * stand, toward the sun.
 */
export function sunLight({
  width,
  height,
  groundTop,
  sun,
}: Sized & { groundTop: number; sun: Point }): Light {
  const dx = sun.x - width / 2;
  const dy = sun.y - (groundTop + height) / 2;
  const length = Math.hypot(dx, dy);
  return { toward: { x: dx / length, y: dy / length } };
}

/** The HUD's pictograms' light, fixed to the upper left whatever the sun does. */
export const PICTOGRAM_LIGHT: Light = {
  toward: { x: -Math.SQRT1_2, y: -Math.SQRT1_2 },
};
