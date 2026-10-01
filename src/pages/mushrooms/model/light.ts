/**
 * Where the light comes from: one sun, seen from where each thing stands and
 * turned into its own frame, which every lit crest and every shade takes its
 * side from.
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

/**
 * `light` as a body turned `turn` radians clockwise on screen sees it, in
 * its own frame: what a painter drawing that body before it is turned has
 * to be handed, so the body shows the light where the light is.
 */
export function turnedLight<Turned extends Light>(
  light: Turned,
  turn: number,
): Turned {
  const [cos, sin] = [Math.cos(turn), Math.sin(turn)];
  const { x, y } = light.toward;
  return { ...light, toward: { x: x * cos + y * sin, y: y * cos - x * sin } };
}

/** The HUD's pictograms' light, fixed to the upper left whatever the sun does. */
export const PICTOGRAM_LIGHT: Light = {
  toward: { x: -Math.SQRT1_2, y: -Math.SQRT1_2 },
};
